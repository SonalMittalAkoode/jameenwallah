from __future__ import annotations

import csv
import hashlib
import html
import json
import re
import shutil
import sqlite3
import time
import zipfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus, unquote, urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from .image_completion import (
    DownloadedImage,
    ImageCandidate,
    clean_text,
    google_maps_place_photos,
    image_dimensions,
    property_id_for_row,
    safe_slug,
    upcoming_next_six_months,
)

csv.field_size_limit(40_000_000)


IMAGE_EXT_RE = re.compile(r"\.(?:jpe?g|png|webp)(?:[?#][^\"'()<>\s]*)?$", re.I)
IMAGE_ANYWHERE_RE = re.compile(
    r"(?:(?:https?:)?//[^\"'()<>\s]+|/[A-Za-z0-9_./%~@,+:=;-]+|(?:\\.\\.?/)?[A-Za-z0-9_./%~@,+:=;-]+)"
    r"\.(?:jpe?g|png|webp)(?:[?#][^\"'()<>\s]*)?",
    re.I,
)
VIDEO_ANYWHERE_RE = re.compile(
    r"(?:(?:https?:)?//[^\"'()<>\s]+|/[A-Za-z0-9_./%~@,+:=;-]+)"
    r"(?:youtube\\.com/embed/[^\"'()<>\s]+|youtu\\.be/[^\"'()<>\s]+|vimeo\\.com/[^\"'()<>\s]+|\\.mp4(?:[?#][^\"'()<>\s]*)?)",
    re.I,
)

BAD_ROW_TOKENS = (
    "404",
    "award",
    "blog",
    "career",
    "celebration",
    "event",
    "festival",
    "gallery launch",
    "holiday inn",
    "interview",
    "media",
    "news",
    "press",
    "restaurant launch",
    "singapore",
    "testimonial",
    "webinar",
    "wellness festival",
)
GENERIC_TITLE_TOKENS = (
    "projects",
    "experiences",
    "best commercial projects",
    "new residential projects",
    "top benefits",
)
BAD_IMAGE_TOKENS = (
    "404",
    "award",
    "avatar",
    "banner-icon",
    "blog",
    "broker",
    "captcha",
    "career",
    "favicon",
    "food",
    "icon",
    "interview",
    "loader",
    "logo",
    "media",
    "news",
    "placeholder",
    "profile",
    "qr",
    "restaurant",
    "sprite",
    "team",
    "testimonial",
    "thumb",
    "user",
)
PROPERTY_POSITIVE_TOKENS = (
    "aerial",
    "amenity",
    "apartment",
    "arcade",
    "building",
    "clubhouse",
    "commercial",
    "construction",
    "elevation",
    "entrance",
    "exterior",
    "facade",
    "gallery",
    "greens",
    "landscape",
    "lobby",
    "master",
    "office",
    "plot",
    "project",
    "property",
    "render",
    "residence",
    "residential",
    "retail",
    "site",
    "tower",
    "villa",
)


@dataclass
class PageScrape:
    final_url: str = ""
    description: str = ""
    videos: list[str] = field(default_factory=list)
    image_candidates: list[ImageCandidate] = field(default_factory=list)
    linked_asset_count: int = 0
    error: str = ""


def is_probably_listing_row(row: dict[str, str]) -> tuple[bool, str]:
    title = clean_text(row.get("project_name") or row.get("title"))
    url = clean_text(row.get("project_url") or row.get("source_url"))
    desc = clean_text(row.get("description") or row.get("long_description"))
    title_url = f"{title} {url}".lower()
    text = f"{title_url} {desc[:500].lower()}"
    if any(token_present(title_url, token) for token in BAD_ROW_TOKENS):
        return False, "non_property_event_blog_or_media_page"
    if title.strip().lower() in GENERIC_TITLE_TOKENS:
        return False, "generic_listing_or_article_page"
    if re.search(r"\b(top benefits|how to|guide to|advantages of investing)\b", title_url):
        return False, "article_or_blog_page"
    positive = re.search(
        r"\b(project|property|residential|commercial|apartment|villa|plot|office|retail|arcade|tower|greens|estate|heights|floors?)\b",
        text,
    )
    if not positive:
        return False, "not_enough_property_signals"
    return True, "property_listing_candidate"


def unescape_text(value: str) -> str:
    value = html.unescape(value or "")
    value = value.replace("\\/", "/")
    value = value.replace("\\u002F", "/").replace("\\u002f", "/")
    return value


def token_present(text: str, token: str) -> bool:
    token = token.lower()
    if " " in token or "-" in token:
        return token in text
    return re.search(rf"(?<![a-z0-9]){re.escape(token)}(?![a-z0-9])", text) is not None


def normalize_asset_url(raw_url: str, base_url: str) -> str:
    raw_url = unescape_text(raw_url).strip().strip("'\"")
    if not raw_url or raw_url.startswith(("data:", "blob:", "mailto:", "tel:")):
        return ""
    if raw_url.startswith("//"):
        parsed = urlparse(base_url)
        raw_url = f"{parsed.scheme}:{raw_url}"
    return urljoin(base_url, raw_url)


def extract_image_urls_from_text(text: str, base_url: str) -> list[str]:
    text = unescape_text(text)
    urls = []
    for match in IMAGE_ANYWHERE_RE.finditer(text):
        url = normalize_asset_url(match.group(0), base_url)
        if url:
            urls.append(url)
    return list(dict.fromkeys(urls))


def extract_video_urls_from_text(text: str, base_url: str) -> list[str]:
    text = unescape_text(text)
    urls = []
    for match in VIDEO_ANYWHERE_RE.finditer(text):
        url = normalize_asset_url(match.group(0), base_url)
        if url:
            urls.append(url)
    return list(dict.fromkeys(urls))


def best_src_from_srcset(srcset: str) -> str:
    best_url = ""
    best_width = -1
    for part in (srcset or "").split(","):
        bits = part.strip().split()
        if not bits:
            continue
        width = 0
        if len(bits) > 1 and bits[1].endswith("w"):
            try:
                width = int(bits[1][:-1])
            except ValueError:
                width = 0
        if width >= best_width:
            best_url = bits[0]
            best_width = width
    return best_url


def image_url_is_candidate(url: str, caption: str = "") -> bool:
    text = f"{url} {caption}".lower()
    parsed = urlparse(url)
    path = unquote(parsed.path).lower()
    if not IMAGE_EXT_RE.search(path):
        return False
    if any(token_present(text, token) for token in BAD_IMAGE_TOKENS):
        return False
    return True


def image_priority(candidate: ImageCandidate) -> tuple[int, int, str]:
    text = f"{candidate.url} {candidate.caption} {candidate.match_type}".lower()
    positive = sum(1 for token in PROPERTY_POSITIVE_TOKENS if token in text)
    source_rank = {
        "builder_page_img": 0,
        "builder_page_picture": 0,
        "builder_page_meta": 1,
        "builder_page_background": 1,
        "builder_page_json_or_js": 2,
        "official_csv": 3,
        "google_maps": 4,
        "same_builder_reference": 5,
    }.get(candidate.source, 3)
    return (source_rank, -positive, candidate.url)


def scrape_builder_page(
    row: dict[str, str],
    session: requests.Session,
    request_timeout: int = 12,
    linked_asset_limit: int = 6,
    linked_asset_max_chars: int = 350_000,
    html_max_chars: int = 900_000,
    max_return_candidates: int = 80,
) -> PageScrape:
    url = clean_text(row.get("project_url") or row.get("source_url"))
    if not url.startswith(("http://", "https://")):
        return PageScrape(error="missing_project_url")
    try:
        response = session.get(url, timeout=request_timeout)
        response.raise_for_status()
    except Exception as exc:
        return PageScrape(error=str(exc))
    base_url = response.url
    html_text = response.text[:html_max_chars]
    soup = BeautifulSoup(html_text, "lxml")
    candidates: list[ImageCandidate] = []
    videos = extract_video_urls_from_text(html_text, base_url)

    def add(raw_url: str, source: str, match_type: str, caption: str = "") -> None:
        image_url = normalize_asset_url(raw_url, base_url)
        if not image_url_is_candidate(image_url, caption):
            return
        candidates.append(ImageCandidate(image_url, source=source, match_type=match_type, caption=caption, source_page=base_url))

    for meta_name in ("og:image", "og:image:secure_url", "twitter:image", "image"):
        for tag in soup.find_all("meta", attrs={"property": meta_name}) + soup.find_all("meta", attrs={"name": meta_name}):
            add(tag.get("content", ""), "builder_page_meta", meta_name, meta_name)

    for tag in soup.select("img, source"):
        caption = clean_text(tag.get("alt") or tag.get("title") or tag.get("aria-label") or "")
        srcset = tag.get("srcset") or tag.get("data-srcset") or tag.get("data-lazy-srcset") or ""
        if srcset:
            add(best_src_from_srcset(srcset), "builder_page_picture", "srcset", caption)
        for attr in (
            "src",
            "data-src",
            "data-lazy-src",
            "data-original",
            "data-image",
            "data-full",
            "data-large",
            "data-bg",
            "data-background",
        ):
            add(tag.get(attr, ""), "builder_page_img", attr, caption)

    for tag in soup.select("[style]"):
        style = tag.get("style", "")
        for bg_url in re.findall(r"url\(['\"]?([^'\")]+)['\"]?\)", style, re.I):
            add(bg_url, "builder_page_background", "inline_style", clean_text(tag.get_text(" "))[:100])

    for tag in soup.select("a[href]"):
        href = tag.get("href", "")
        if IMAGE_EXT_RE.search(urlparse(href).path):
            add(href, "builder_page_link", "anchor_image", clean_text(tag.get_text(" "))[:100])
        video_url = normalize_asset_url(href, base_url)
        if any(marker in video_url.lower() for marker in ("youtube.com", "youtu.be", "vimeo.com", ".mp4")):
            videos.append(video_url)

    for image_url in extract_image_urls_from_text(html_text, base_url):
        add(image_url, "builder_page_json_or_js", "inline_json_or_html", "")

    linked_assets = []
    for tag in soup.select("script[src], link[href]"):
        raw = tag.get("src") or tag.get("href") or ""
        asset_url = normalize_asset_url(raw, base_url)
        if not asset_url:
            continue
        path = urlparse(asset_url).path.lower()
        if path.endswith((".js", ".css", ".json")) or "_next/static" in path:
            linked_assets.append(asset_url)
    linked_assets = list(dict.fromkeys(linked_assets))[:linked_asset_limit]
    for asset_url in linked_assets:
        try:
            asset = session.get(asset_url, timeout=request_timeout)
            if not asset.ok:
                continue
        except Exception:
            continue
        content_type = (asset.headers.get("content-type") or "").lower()
        if "text" not in content_type and "javascript" not in content_type and "json" not in content_type and "css" not in content_type:
            continue
        asset_text = asset.text[:linked_asset_max_chars]
        for image_url in extract_image_urls_from_text(asset_text, asset_url):
            add(image_url, "builder_page_json_or_js", f"linked_asset:{urlparse(asset_url).path[-60:]}", "")
        videos.extend(extract_video_urls_from_text(asset_text, asset_url))

    description = ""
    for selector in ("meta[name=description]", "meta[property='og:description']", "meta[name='twitter:description']"):
        tag = soup.select_one(selector)
        if tag and tag.get("content"):
            description = clean_text(tag.get("content"))
            break
    if not description:
        blocks = []
        for selector in ("[class*=overview]", "[class*=description]", "[id*=overview]", "[id*=description]", "section"):
            for tag in soup.select(selector)[:12]:
                text = clean_text(tag.get_text(" "))
                if 80 <= len(text) <= 5000:
                    blocks.append(text)
        description = max(blocks, key=len, default="")

    seen = set()
    deduped = []
    for candidate in sorted(candidates, key=image_priority):
        key = candidate.url.split("?", 1)[0]
        if key in seen:
            continue
        seen.add(key)
        deduped.append(candidate)
        if len(deduped) >= max_return_candidates:
            break
    return PageScrape(
        final_url=base_url,
        description=description,
        videos=list(dict.fromkeys(videos))[:50],
        image_candidates=deduped,
        linked_asset_count=len(linked_assets),
    )


def download_image(
    session: requests.Session,
    candidate: ImageCandidate,
    row: dict[str, str],
    cache_dir: Path,
    seen_hashes: set[str],
    min_width: int,
    min_height: int,
    request_timeout: int,
) -> DownloadedImage | None:
    try:
        response = session.get(candidate.url, timeout=request_timeout, allow_redirects=True)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "").lower()
        if "image" not in content_type and not IMAGE_EXT_RE.search(urlparse(response.url).path):
            return None
        digest = hashlib.sha256(response.content).hexdigest()
        if digest in seen_hashes:
            return None
        suffix = Path(urlparse(response.url).path).suffix.lower()
        if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
            suffix = ".jpg"
        path = cache_dir / f"{digest[:16]}{suffix}"
        path.write_bytes(response.content)
        width, height = image_dimensions(path)
        if width < min_width or height < min_height:
            path.unlink(missing_ok=True)
            return None
        if width < height:
            path.unlink(missing_ok=True)
            return None
        seen_hashes.add(digest)
        return DownloadedImage(
            source_url=candidate.url,
            local_path=str(path),
            source=candidate.source,
            match_type=candidate.match_type,
            width=width,
            height=height,
            sha256=digest,
        )
    except Exception:
        return None


def csv_official_candidates(row: dict[str, str]) -> list[ImageCandidate]:
    output = []
    for i in range(1, 21):
        url = clean_text(row.get(f"image_{i}_url"))
        source = clean_text(row.get(f"image_{i}_source")) or "official_csv"
        caption = clean_text(row.get(f"image_{i}_caption"))
        if url and image_url_is_candidate(url, caption) and "fallback" not in source.lower():
            output.append(ImageCandidate(url, "official_csv", source, caption, clean_text(row.get("project_url"))))
    return output


def build_gold_builder_database(
    input_csv: str | Path,
    output_dir: str | Path,
    maps_api_key: str = "",
    target_images: int = 5,
    min_width: int = 500,
    min_height: int = 250,
    request_timeout: int = 10,
    progress_every: int = 20,
    max_candidates_per_row: int = 40,
) -> dict[str, Any]:
    input_csv = Path(input_csv)
    output_dir = Path(output_dir)
    if output_dir.exists():
        shutil.rmtree(output_dir)
    properties_dir = output_dir / "properties"
    cache_dir = output_dir / "image-cache"
    properties_dir.mkdir(parents=True)
    cache_dir.mkdir(parents=True)

    with input_csv.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
        input_fields = list(reader.fieldnames or [])

    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        }
    )

    final_rows: list[dict[str, Any]] = []
    image_rows: list[dict[str, Any]] = []
    all_media_rows: list[dict[str, Any]] = []
    same_builder_pool: dict[str, list[DownloadedImage]] = {}
    stats = {
        "input_rows": len(rows),
        "valid_property_rows": 0,
        "excluded_non_property_rows": 0,
        "rows_with_5_images": 0,
        "rows_using_google_maps": 0,
        "upcoming_rows": 0,
        "upcoming_rows_using_same_builder_reference": 0,
        "downloaded_image_slots": 0,
        "all_exact_image_url_rows": 0,
    }

    # Process definite current listings first so same-builder reference pools are
    # built before upcoming pages need them.
    indexed = list(enumerate(rows, 1))
    indexed.sort(key=lambda item: (upcoming_next_six_months(item[1]), item[0]))
    by_original_index: dict[int, dict[str, Any]] = {}
    excluded_rows: list[dict[str, Any]] = []

    extra_fields = [
        "gold_is_valid_property_listing",
        "gold_listing_status",
        "gold_exclusion_reason",
        "gold_is_upcoming_next_6_months",
        "gold_builder_page_final_url",
        "gold_builder_page_description",
        "gold_video_urls",
        "gold_all_exact_image_urls",
        "gold_all_exact_image_url_count",
        "gold_completed_image_count",
        "gold_has_5_images",
        "gold_used_google_maps",
        "gold_used_same_builder_reference",
        "gold_review_notes",
    ]
    for i in range(1, target_images + 1):
        extra_fields.extend(
            [
                f"gold_local_image_{i}_path",
                f"gold_image_{i}_exact_source_url",
                f"gold_image_{i}_source",
                f"gold_image_{i}_match_type",
                f"gold_image_{i}_width",
                f"gold_image_{i}_height",
            ]
        )
    output_fields = list(dict.fromkeys(input_fields + extra_fields))

    for processed, (original_index, row) in enumerate(indexed, 1):
        if progress_every and (processed == 1 or processed % progress_every == 0 or processed == len(rows)):
            print(f"[gold-db] {processed}/{len(rows)}", flush=True)
        valid, reason = is_probably_listing_row(row)
        prop_id = property_id_for_row(original_index, row)
        builder_key = clean_text(row.get("builder_name") or row.get("source_name")).lower()
        is_upcoming = upcoming_next_six_months(row)
        if is_upcoming:
            stats["upcoming_rows"] += 1
        if not valid:
            excluded = dict(row)
            excluded["gold_is_valid_property_listing"] = "No"
            excluded["gold_exclusion_reason"] = reason
            excluded_rows.append(excluded)
            stats["excluded_non_property_rows"] += 1
            continue

        stats["valid_property_rows"] += 1
        scrape = scrape_builder_page(row, session, request_timeout=request_timeout)
        candidates = scrape.image_candidates + csv_official_candidates(row)
        deduped_candidates: list[ImageCandidate] = []
        seen_candidate_urls: set[str] = set()
        for candidate in sorted(candidates, key=image_priority):
            key = candidate.url.split("?", 1)[0]
            if key in seen_candidate_urls:
                continue
            seen_candidate_urls.add(key)
            deduped_candidates.append(candidate)
            if len(deduped_candidates) >= max_candidates_per_row:
                break
        candidates = deduped_candidates
        all_exact_urls = []
        for candidate in candidates:
            if candidate.url not in all_exact_urls:
                all_exact_urls.append(candidate.url)
                all_media_rows.append(
                    {
                        "property_id": prop_id,
                        "project_name": row.get("project_name", ""),
                        "url": candidate.url,
                        "source": candidate.source,
                        "match_type": candidate.match_type,
                        "caption": candidate.caption,
                    }
                )

        seen_hashes: set[str] = set()
        downloaded: list[DownloadedImage] = []
        for candidate in candidates:
            image = download_image(session, candidate, row, cache_dir, seen_hashes, min_width, min_height, request_timeout)
            if image:
                downloaded.append(image)
            if len(downloaded) >= target_images:
                break

        used_maps = False
        if len(downloaded) < target_images and maps_api_key:
            maps_candidates, _metadata = google_maps_place_photos(row, maps_api_key, limit=target_images * 2)
            time.sleep(0.05)
            for candidate in maps_candidates:
                image = download_image(session, candidate, row, cache_dir, seen_hashes, min_width, min_height, request_timeout)
                if image:
                    downloaded.append(image)
                    used_maps = True
                if len(downloaded) >= target_images:
                    break

        used_same_builder = False
        if is_upcoming and len(downloaded) < target_images and builder_key:
            for reference in same_builder_pool.get(builder_key, []):
                if reference.sha256 in seen_hashes:
                    continue
                seen_hashes.add(reference.sha256)
                downloaded.append(
                    DownloadedImage(
                        source_url=reference.source_url,
                        local_path=reference.local_path,
                        source="same_builder_built_property_reference",
                        match_type="upcoming_same_builder_reference",
                        width=reference.width,
                        height=reference.height,
                        sha256=reference.sha256,
                    )
                )
                used_same_builder = True
                if len(downloaded) >= target_images:
                    break

        prop_dir = properties_dir / prop_id
        prop_dir.mkdir(parents=True, exist_ok=True)
        selected = downloaded[:target_images]
        out = dict(row)
        out["gold_is_valid_property_listing"] = "Yes"
        out["gold_listing_status"] = "upcoming_next_6_months" if is_upcoming else clean_text(row.get("status")) or "current"
        out["gold_exclusion_reason"] = ""
        out["gold_is_upcoming_next_6_months"] = "Yes" if is_upcoming else "No"
        out["gold_builder_page_final_url"] = scrape.final_url
        out["gold_builder_page_description"] = scrape.description or clean_text(row.get("description"))
        out["gold_video_urls"] = json.dumps(scrape.videos, ensure_ascii=False)
        out["gold_all_exact_image_urls"] = json.dumps(all_exact_urls, ensure_ascii=False)
        out["gold_all_exact_image_url_count"] = len(all_exact_urls)
        out["gold_completed_image_count"] = len(selected)
        out["gold_has_5_images"] = "Yes" if len(selected) >= target_images else "No"
        out["gold_used_google_maps"] = "Yes" if used_maps else "No"
        out["gold_used_same_builder_reference"] = "Yes" if used_same_builder else "No"
        notes = []
        if scrape.error:
            notes.append(f"Builder page scrape error: {scrape.error}")
        if len(selected) < target_images:
            notes.append(f"Only {len(selected)} usable property images found after deep scrape and Maps.")
        if used_same_builder:
            notes.append("Upcoming listing uses same-builder built property reference images.")
        out["gold_review_notes"] = " ".join(notes)

        for slot, image in enumerate(selected, 1):
            ext = Path(image.local_path).suffix or ".jpg"
            dest = prop_dir / f"image_{slot:02d}_{safe_slug(image.source + '-' + image.match_type)[:48]}_{image.sha256[:12]}{ext}"
            shutil.copy2(image.local_path, dest)
            out[f"gold_local_image_{slot}_path"] = str(dest.resolve())
            out[f"gold_image_{slot}_exact_source_url"] = "" if image.source == "google_maps" else image.source_url
            out[f"gold_image_{slot}_source"] = image.source
            out[f"gold_image_{slot}_match_type"] = image.match_type
            out[f"gold_image_{slot}_width"] = image.width
            out[f"gold_image_{slot}_height"] = image.height
            image_rows.append(
                {
                    "property_id": prop_id,
                    "project_name": row.get("project_name", ""),
                    "slot": slot,
                    "local_image_path": str(dest.resolve()),
                    "exact_source_url": "" if image.source == "google_maps" else image.source_url,
                    "source": image.source,
                    "match_type": image.match_type,
                    "width": image.width,
                    "height": image.height,
                }
            )

        if len(selected) >= target_images:
            stats["rows_with_5_images"] += 1
        if used_maps:
            stats["rows_using_google_maps"] += 1
        if used_same_builder:
            stats["upcoming_rows_using_same_builder_reference"] += 1
        stats["downloaded_image_slots"] += len(selected)
        stats["all_exact_image_url_rows"] += len(all_exact_urls)

        if builder_key:
            pool = same_builder_pool.setdefault(builder_key, [])
            for image in selected:
                if image.source != "same_builder_built_property_reference" and not any(
                    existing.sha256 == image.sha256 for existing in pool
                ):
                    pool.append(image)
        by_original_index[original_index] = out

    final_rows = [by_original_index[index] for index in sorted(by_original_index)]
    output_dir.mkdir(parents=True, exist_ok=True)
    props_csv = output_dir / "gold_builder_properties.csv"
    with props_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=output_fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(final_rows)

    image_slots_csv = output_dir / "gold_image_slots.csv"
    image_fields = ["property_id", "project_name", "slot", "local_image_path", "exact_source_url", "source", "match_type", "width", "height"]
    with image_slots_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=image_fields)
        writer.writeheader()
        writer.writerows(image_rows)

    all_media_csv = output_dir / "gold_all_exact_image_urls.csv"
    media_fields = ["property_id", "project_name", "url", "source", "match_type", "caption"]
    with all_media_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=media_fields)
        writer.writeheader()
        writer.writerows(all_media_rows)

    excluded_csv = output_dir / "excluded_non_property_rows.csv"
    with excluded_csv.open("w", newline="", encoding="utf-8") as handle:
        fields = list(dict.fromkeys(input_fields + ["gold_is_valid_property_listing", "gold_exclusion_reason"]))
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(excluded_rows)

    sqlite_path = output_dir / "gold_builder_properties.sqlite"
    connection = sqlite3.connect(sqlite_path)
    with connection:
        connection.execute("create table properties (%s)" % ",".join(f'"{field}" text' for field in output_fields))
        connection.executemany(
            "insert into properties values (%s)" % ",".join("?" for _ in output_fields),
            [[str(row.get(field, "")) for field in output_fields] for row in final_rows],
        )
        connection.execute("create table image_slots (%s)" % ",".join(f'"{field}" text' for field in image_fields))
        connection.executemany(
            "insert into image_slots values (%s)" % ",".join("?" for _ in image_fields),
            [[str(row.get(field, "")) for field in image_fields] for row in image_rows],
        )
        connection.execute("create table all_exact_image_urls (%s)" % ",".join(f'"{field}" text' for field in media_fields))
        connection.executemany(
            "insert into all_exact_image_urls values (%s)" % ",".join("?" for _ in media_fields),
            [[str(row.get(field, "")) for field in media_fields] for row in all_media_rows],
        )
    connection.close()

    review_rows = [row for row in final_rows if row.get("gold_has_5_images") != "Yes" or row.get("gold_review_notes")]
    review_csv = output_dir / "gold_review_needed.csv"
    review_fields = [
        "internal_id",
        "project_name",
        "builder_name",
        "project_url",
        "gold_completed_image_count",
        "gold_is_upcoming_next_6_months",
        "gold_all_exact_image_url_count",
        "gold_used_google_maps",
        "gold_used_same_builder_reference",
        "gold_review_notes",
    ]
    with review_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=review_fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(review_rows)

    summary = {
        **stats,
        "properties_csv": str(props_csv.resolve()),
        "image_slots_csv": str(image_slots_csv.resolve()),
        "all_exact_image_urls_csv": str(all_media_csv.resolve()),
        "excluded_non_property_rows_csv": str(excluded_csv.resolve()),
        "review_needed_csv": str(review_csv.resolve()),
        "sqlite": str(sqlite_path.resolve()),
        "notes": [
            "This export excludes obvious event/blog/media/generic non-property rows.",
            "The scraper extracts images from builder page HTML, img/srcset, background CSS, inline JSON, linked JS/CSS/JSON assets, and original CSV builder image fields.",
            "Google Maps exact-place photos are used only when builder images are insufficient.",
            "Same-builder built-property reference images are used only for upcoming listings.",
            "gold_all_exact_image_urls contains every exact builder image URL found before selecting the five production slots.",
        ],
    }
    summary_path = output_dir / "gold_summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    zip_path = output_dir.parent / f"{output_dir.name}.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in output_dir.rglob("*"):
            if path.is_file():
                archive.write(path, path.relative_to(output_dir.parent))
    summary["zip_path"] = str(zip_path.resolve())
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    return summary
