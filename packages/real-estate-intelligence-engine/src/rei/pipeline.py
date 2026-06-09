from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .crawler import BrowserCrawler, FetchPolicy, HttpCrawler
from .discover import DiscoveryConfig, discover_from_config
from .extractors import extract_project
from .media import MediaDownloader
from .monitor import diff_projects
from .storage import ProjectStore


@dataclass
class PipelineStats:
    discovered_urls: int = 0
    crawled_urls: int = 0
    extracted_projects: int = 0
    failed_urls: int = 0
    change_events: int = 0


class RealEstateIntelligencePipeline:
    def __init__(
        self,
        store: ProjectStore | None = None,
        output_dir: str | Path = "data/rei",
        fetch_policy: FetchPolicy | None = None,
        download_media: bool = False,
    ) -> None:
        self.store = store
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.fetch_policy = fetch_policy or FetchPolicy()
        self.download_media = download_media
        self.http = HttpCrawler(self.fetch_policy)
        self.browser = BrowserCrawler(self.fetch_policy, self.output_dir / "browser")
        self.media_downloader = MediaDownloader(self.output_dir / "assets")

    def discover(self, source: dict[str, Any]) -> list[str]:
        start_urls = source.get("start_urls") or ([source["base_url"]] if source.get("base_url") else [])
        config = DiscoveryConfig(
            start_urls=start_urls,
            include_patterns=source.get("include_patterns", []),
            exclude_patterns=source.get("exclude_patterns", []),
            max_urls=int(source.get("max_urls", 1000)),
        )
        return discover_from_config(config)

    def crawl_and_extract_url(self, url: str, source_name: str = ""):
        crawler = self.browser if self.fetch_policy.render_javascript else self.http
        result = crawler.fetch(url)
        if result.error or not result.html:
            return None, result
        project = extract_project(result, source_name=source_name)
        if self.download_media:
            namespace = project.canonical_key or "project"
            all_images = project.gallery_images + project.floor_plans + project.master_plan_images + project.logo_images
            self.media_downloader.download_media(all_images, namespace=namespace)
            self.media_downloader.download_documents(project.brochures, namespace=namespace)
        return project, result

    def run_source(self, source: dict[str, Any]) -> PipelineStats:
        stats = PipelineStats()
        urls = self.discover(source)
        stats.discovered_urls = len(urls)
        source_name = source.get("name", "")
        for url in urls:
            stats.crawled_urls += 1
            project, result = self.crawl_and_extract_url(url, source_name=source_name)
            if not project:
                stats.failed_urls += 1
                self._write_failure(url, result.error)
                continue
            stats.extracted_projects += 1
            if self.store:
                before = self.store.get_project(project.canonical_key)
                events = diff_projects(before, project)
                stats.change_events += len(events)
                self.store.upsert_project(project)
                self.store.save_events(events)
            self._write_project(project)
        return stats

    def _write_project(self, project) -> None:
        path = self.output_dir / "projects-jsonl"
        path.mkdir(parents=True, exist_ok=True)
        with (path / "projects.jsonl").open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(project.to_dict(), ensure_ascii=False) + "\n")

    def _write_failure(self, url: str, error: str) -> None:
        path = self.output_dir / "failures.jsonl"
        with path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps({"url": url, "error": error}, ensure_ascii=False) + "\n")
