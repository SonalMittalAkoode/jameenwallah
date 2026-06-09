from __future__ import annotations

import gzip
import json
import re
from dataclasses import dataclass, field
from typing import Iterable
from urllib.parse import urljoin, urlparse
from xml.etree import ElementTree

import requests
from bs4 import BeautifulSoup


PRIORITY_KEYWORDS = (
    "project",
    "property",
    "residential",
    "commercial",
    "new-launch",
    "luxury",
    "gurgaon",
    "gurugram",
    "noida",
    "delhi",
    "dwarka",
    "golf-course",
    "sector",
)


@dataclass
class DiscoveryConfig:
    start_urls: list[str]
    include_patterns: list[str] = field(default_factory=list)
    exclude_patterns: list[str] = field(default_factory=lambda: ["privacy", "terms", "career", "contact"])
    max_urls: int = 1000


def same_domain(url: str, root: str) -> bool:
    return urlparse(url).netloc.lower().removeprefix("www.") == urlparse(root).netloc.lower().removeprefix("www.")


def discover_sitemap_urls(root_url: str) -> list[str]:
    parsed = urlparse(root_url)
    origin = f"{parsed.scheme}://{parsed.netloc}"
    candidates = [f"{origin}/sitemap.xml", f"{origin}/sitemap_index.xml", f"{origin}/robots.txt"]
    found: list[str] = []
    for candidate in candidates:
        try:
            response = requests.get(candidate, timeout=20)
        except requests.RequestException:
            continue
        if response.status_code >= 400:
            continue
        if candidate.endswith("robots.txt"):
            for line in response.text.splitlines():
                if line.lower().startswith("sitemap:"):
                    found.append(line.split(":", 1)[1].strip())
        else:
            found.append(candidate)
    return list(dict.fromkeys(found))


def parse_sitemap(url: str, seen: set[str] | None = None, limit: int = 2000) -> list[str]:
    seen = seen or set()
    if url in seen:
        return []
    seen.add(url)
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException:
        return []
    body = gzip.decompress(response.content) if url.endswith(".gz") else response.content
    try:
        root = ElementTree.fromstring(body)
    except ElementTree.ParseError:
        return []

    namespace = ""
    if root.tag.startswith("{"):
        namespace = root.tag.split("}", 1)[0] + "}"
    urls: list[str] = []
    if root.tag.endswith("sitemapindex"):
        for loc in root.findall(f".//{namespace}loc"):
            urls.extend(parse_sitemap(loc.text or "", seen, limit=limit))
            if len(urls) >= limit:
                break
    else:
        for loc in root.findall(f".//{namespace}loc"):
            if loc.text:
                urls.append(loc.text.strip())
            if len(urls) >= limit:
                break
    return urls


def extract_links(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html or "", "lxml")
    links = []
    for tag in soup.select("a[href]"):
        url = urljoin(base_url, tag.get("href", ""))
        if url.startswith("http") and same_domain(url, base_url):
            links.append(url.split("#", 1)[0])
    return list(dict.fromkeys(links))


def prioritize_urls(urls: Iterable[str]) -> list[str]:
    def score(url: str) -> tuple[int, str]:
        text = url.lower()
        value = sum(5 for keyword in PRIORITY_KEYWORDS if keyword in text)
        value -= sum(2 for keyword in ("blog", "news", "privacy", "terms", "career") if keyword in text)
        return (-value, url)

    return sorted(list(dict.fromkeys(urls)), key=score)


def filter_urls(urls: Iterable[str], config: DiscoveryConfig) -> list[str]:
    output = []
    include = [re.compile(pattern, re.I) for pattern in config.include_patterns]
    exclude = [re.compile(pattern, re.I) for pattern in config.exclude_patterns]
    for url in urls:
        if any(pattern.search(url) for pattern in exclude):
            continue
        if include and not any(pattern.search(url) for pattern in include):
            continue
        output.append(url)
    return prioritize_urls(output)[: config.max_urls]


def discover_from_config(config: DiscoveryConfig) -> list[str]:
    urls: list[str] = []
    for start_url in config.start_urls:
        for sitemap in discover_sitemap_urls(start_url):
            urls.extend(parse_sitemap(sitemap, limit=max(config.max_urls * 20, config.max_urls)))
            if len(urls) >= config.max_urls * 20:
                break
        if not urls:
            try:
                response = requests.get(start_url, timeout=25)
                if response.ok:
                    urls.extend(extract_links(response.text, start_url))
            except requests.RequestException:
                continue
    return filter_urls(urls, config)


def load_sources(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)
