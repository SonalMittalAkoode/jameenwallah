from __future__ import annotations

import random
import re
import time
import urllib.robotparser
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests

from .models import CrawlResult


ANTI_BOT_MARKERS = (
    "cf-chl",
    "akamai",
    "datadome",
    "perimeterx",
    "px-captcha",
    "captcha",
    "access denied",
    "unusual traffic",
)


@dataclass
class FetchPolicy:
    respect_robots: bool = True
    delay_seconds: tuple[float, float] = (1.5, 4.0)
    timeout_seconds: int = 30
    max_retries: int = 3
    render_javascript: bool = False
    wait_until: str = "networkidle"
    scroll_passes: int = 3
    click_selectors: list[str] = field(default_factory=lambda: [
        "text=Load More",
        "text=View More",
        "text=Show More",
        "button:has-text('More')",
    ])
    user_agents: list[str] = field(default_factory=lambda: [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    ])


class RobotsCache:
    def __init__(self, user_agent: str = "*") -> None:
        self.user_agent = user_agent
        self._cache: dict[str, urllib.robotparser.RobotFileParser] = {}

    def allowed(self, url: str) -> bool:
        parsed = urlparse(url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        if origin not in self._cache:
            parser = urllib.robotparser.RobotFileParser()
            try:
                response = requests.get(f"{origin}/robots.txt", timeout=10)
                parser.parse(response.text.splitlines() if response.ok else [])
            except Exception:
                return True
            self._cache[origin] = parser
        return self._cache[origin].can_fetch(self.user_agent, url)


def looks_protected(status_code: int, html: str, headers: dict[str, Any] | None = None) -> bool:
    if status_code in {401, 403, 429, 503}:
        return True
    combined = " ".join([html[:5000], " ".join(f"{k}:{v}" for k, v in (headers or {}).items())]).lower()
    return any(marker in combined for marker in ANTI_BOT_MARKERS)


class HttpCrawler:
    def __init__(self, policy: FetchPolicy | None = None) -> None:
        self.policy = policy or FetchPolicy()
        self.session = requests.Session()
        self.robots = RobotsCache()

    def fetch(self, url: str) -> CrawlResult:
        if self.policy.respect_robots and not self.robots.allowed(url):
            return CrawlResult(url=url, status_code=0, error="Blocked by robots.txt policy")

        last_error = ""
        for attempt in range(1, self.policy.max_retries + 1):
            time.sleep(random.uniform(*self.policy.delay_seconds))
            headers = {"User-Agent": random.choice(self.policy.user_agents), "Accept": "text/html,application/xhtml+xml"}
            try:
                response = self.session.get(url, headers=headers, timeout=self.policy.timeout_seconds)
                html = response.text if "text" in response.headers.get("content-type", "") or response.text else ""
                result = CrawlResult(
                    url=url,
                    status_code=response.status_code,
                    html=html,
                    final_url=response.url,
                    content_type=response.headers.get("content-type", ""),
                )
                if looks_protected(response.status_code, html, dict(response.headers)):
                    result.error = "Protected or CAPTCHA-like response detected; paused for compliant review"
                return result
            except requests.RequestException as exc:
                last_error = str(exc)
                time.sleep(min(2**attempt, 20))
        return CrawlResult(url=url, status_code=0, error=last_error)


class BrowserCrawler:
    def __init__(self, policy: FetchPolicy | None = None, artifact_dir: str | Path = "data/browser") -> None:
        self.policy = policy or FetchPolicy(render_javascript=True)
        self.artifact_dir = Path(artifact_dir)
        self.artifact_dir.mkdir(parents=True, exist_ok=True)
        self.robots = RobotsCache()

    def fetch(self, url: str) -> CrawlResult:
        if self.policy.respect_robots and not self.robots.allowed(url):
            return CrawlResult(url=url, status_code=0, error="Blocked by robots.txt policy")
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            return CrawlResult(url=url, status_code=0, error="Install optional browser extra: pip install .[browser]")

        payloads: list[dict[str, Any]] = []
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(user_agent=random.choice(self.policy.user_agents))
            page = context.new_page()

            def capture_response(response: Any) -> None:
                content_type = response.headers.get("content-type", "")
                if "json" not in content_type:
                    return
                try:
                    payloads.append({"url": response.url, "status": response.status, "json": response.json()})
                except Exception:
                    return

            page.on("response", capture_response)
            response = page.goto(url, wait_until=self.policy.wait_until, timeout=self.policy.timeout_seconds * 1000)
            for selector in self.policy.click_selectors:
                try:
                    page.locator(selector).first.click(timeout=1500)
                    page.wait_for_timeout(750)
                except Exception:
                    continue
            for _ in range(self.policy.scroll_passes):
                page.mouse.wheel(0, 3500)
                page.wait_for_timeout(900)
            html = page.content()
            safe_name = re.sub(r"[^A-Za-z0-9]+", "-", urlparse(url).netloc + urlparse(url).path).strip("-")[:120]
            screenshot_path = self.artifact_dir / f"{safe_name or 'page'}.png"
            try:
                page.screenshot(path=str(screenshot_path), full_page=True)
            except Exception:
                screenshot_path = Path("")
            final_url = page.url
            status_code = response.status if response else 0
            context.close()
            browser.close()

        result = CrawlResult(
            url=url,
            status_code=status_code,
            html=html,
            final_url=final_url,
            content_type="text/html",
            network_payloads=payloads,
            screenshot_path=str(screenshot_path) if screenshot_path else "",
        )
        if looks_protected(status_code, html):
            result.error = "Protected or CAPTCHA-like response detected; paused for compliant review"
        return result
