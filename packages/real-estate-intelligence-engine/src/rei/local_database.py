from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

import requests

from .crawler import FetchPolicy, HttpCrawler
from .discover import DiscoveryConfig, discover_from_config, extract_links, filter_urls, load_sources
from .extractors import extract_project
from .monitor import diff_projects
from .storage import SQLiteProjectStore


PROPERTY_KEYWORDS = (
    "project",
    "property",
    "residential",
    "commercial",
    "retail",
    "office",
    "launch",
    "new-launch",
    "upcoming",
    "ongoing",
    "ready",
    "gurgaon",
    "gurugram",
    "noida",
    "delhi",
    "dwarka",
)

NON_PROPERTY_URL_MARKERS = (
    "/blog",
    "blogs-",
    "/news",
    "/media",
    "/press",
    "/career",
    "/privacy",
    "/terms",
    "/contact",
    "/about",
    "store-launch",
    "tax",
    "registration",
    "guide",
)


def ensure_aux_tables(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        create table if not exists discovered_urls (
            url text primary key,
            source_name text not null,
            status text not null default 'pending',
            note text default '',
            discovered_at text default current_timestamp
        );

        create table if not exists crawl_errors (
            id integer primary key autoincrement,
            url text not null,
            source_name text not null,
            error text not null,
            created_at text default current_timestamp
        );
        """
    )
    connection.commit()


def source_start_urls(source: dict[str, Any]) -> list[str]:
    return source.get("start_urls") or ([source["base_url"]] if source.get("base_url") else [])


def source_include_patterns(source: dict[str, Any]) -> list[str]:
    return source.get("include_patterns") or list(PROPERTY_KEYWORDS)


def looks_like_property_url(url: str) -> bool:
    text = url.lower()
    if any(marker in text for marker in NON_PROPERTY_URL_MARKERS):
        return False
    return any(keyword in text for keyword in PROPERTY_KEYWORDS)


def discover_source_urls(source: dict[str, Any], max_per_source: int | None) -> list[str]:
    max_urls = max_per_source or int(source.get("max_urls", 100))
    discovery = DiscoveryConfig(
        start_urls=source_start_urls(source),
        include_patterns=source_include_patterns(source),
        exclude_patterns=source.get("exclude_patterns", list(NON_PROPERTY_URL_MARKERS)),
        max_urls=max_urls,
    )
    if source.get("skip_sitemap"):
        urls: list[str] = []
        for start_url in discovery.start_urls:
            try:
                response = requests.get(start_url, timeout=20)
                if response.ok:
                    urls.extend(extract_links(response.text, start_url))
            except requests.RequestException:
                continue
        return filter_urls(urls, discovery)
    return discover_from_config(discovery)


def build_local_database(
    sources_path: str | Path,
    sqlite_path: str | Path,
    out_dir: str | Path,
    source_name: str = "",
    max_per_source: int | None = None,
    delay_seconds: tuple[float, float] = (0.2, 0.8),
) -> dict[str, int]:
    config = load_sources(str(sources_path))
    sources = config.get("sources", [])
    if source_name:
        sources = [source for source in sources if source.get("name") == source_name]
    store = SQLiteProjectStore(sqlite_path)
    ensure_aux_tables(store.connection)
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    crawler = HttpCrawler(FetchPolicy(delay_seconds=delay_seconds, timeout_seconds=20, max_retries=2))
    stats = {
        "sources": 0,
        "discovered_urls": 0,
        "crawled_urls": 0,
        "projects": 0,
        "errors": 0,
        "events": 0,
    }

    projects_jsonl = out_dir / "projects.jsonl"
    discovered_jsonl = out_dir / "discovered_urls.jsonl"
    for source in sources:
        source_name = source.get("name", "")
        stats["sources"] += 1
        print(f"[{source_name}] discovering...")
        urls = [url for url in discover_source_urls(source, max_per_source) if looks_like_property_url(url)]
        stats["discovered_urls"] += len(urls)
        print(f"[{source_name}] {len(urls)} candidate property/upcoming URLs")
        for url in urls:
            store.connection.execute(
                "insert or ignore into discovered_urls (url, source_name, status) values (?, ?, 'pending')",
                (url, source_name),
            )
            with discovered_jsonl.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps({"source_name": source_name, "url": url}, ensure_ascii=False) + "\n")
        store.connection.commit()

        for index, url in enumerate(urls, 1):
            print(f"[{source_name}] crawling {index}/{len(urls)} {url}")
            result = crawler.fetch(url)
            stats["crawled_urls"] += 1
            if result.error or not result.html:
                stats["errors"] += 1
                store.connection.execute(
                    "update discovered_urls set status = 'error', note = ? where url = ?",
                    (result.error or "No HTML returned", url),
                )
                store.connection.execute(
                    "insert into crawl_errors (url, source_name, error) values (?, ?, ?)",
                    (url, source_name, result.error or "No HTML returned"),
                )
                store.connection.commit()
                continue

            project = extract_project(result, source_name=source_name)
            if not project.project_name:
                stats["errors"] += 1
                store.connection.execute(
                    "update discovered_urls set status = 'skipped', note = 'No project title extracted' where url = ?",
                    (url,),
                )
                store.connection.commit()
                continue

            before = store.get_project(project.canonical_key)
            events = diff_projects(before, project)
            store.upsert_project(project)
            store.save_events(events)
            store.connection.execute("update discovered_urls set status = 'extracted' where url = ?", (url,))
            store.connection.commit()
            stats["projects"] += 1
            stats["events"] += len(events)
            with projects_jsonl.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(project.to_dict(), ensure_ascii=False) + "\n")

    return stats
