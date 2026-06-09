from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .models import CrawlResult


@dataclass
class AdapterResult:
    crawl_result: CrawlResult
    metadata: dict[str, Any]


class SeleniumCrawler:
    """Selenium adapter for teams that already operate Selenium grids."""

    def __init__(self, driver: Any) -> None:
        self.driver = driver

    def fetch(self, url: str) -> CrawlResult:
        self.driver.get(url)
        html = self.driver.page_source
        return CrawlResult(url=url, status_code=200, html=html, final_url=self.driver.current_url, content_type="text/html")


class ScrapyBridge:
    """Small bridge that turns Scrapy responses into the shared CrawlResult model."""

    @staticmethod
    def from_response(response: Any) -> CrawlResult:
        return CrawlResult(
            url=response.url,
            status_code=getattr(response, "status", 0),
            html=response.text,
            final_url=response.url,
            content_type=response.headers.get("content-type", b"").decode("utf-8", errors="ignore")
            if hasattr(response.headers, "get")
            else "",
        )


SCRAPY_SPIDER_TEMPLATE = """
import scrapy
from rei.framework_adapters import ScrapyBridge
from rei.extractors import extract_project


class RealEstateProjectSpider(scrapy.Spider):
    name = "real_estate_projects"

    def __init__(self, start_urls=None, source_name="", **kwargs):
        super().__init__(**kwargs)
        self.start_urls = start_urls or []
        self.source_name = source_name

    def parse(self, response):
        crawl_result = ScrapyBridge.from_response(response)
        project = extract_project(crawl_result, source_name=self.source_name)
        yield project.to_dict()
"""
