from __future__ import annotations

import csv
import hashlib
import json
import re
import shutil
import sqlite3
import time
import zipfile
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus, urljoin, urlparse

import requests
from bs4 import BeautifulSoup

csv.field_size_limit(20_000_000)


BAD_IMAGE_TOKENS = (
    "avatar",
    "broker",
    "captcha",
    "favicon",
    "icon",
    "loader",
    "logo",
    "owner",
    "placeholder",
    "profile",
    "qr",
    "sprite",
    "team",
    "testimonial",
    "thumbs-up",
    "user",
)
NON_PROPERTY_ROW_TOKENS = (
    "404",
    "award",
    "blog",
    "career",
    "celebration",
    "event",
    "experience",
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
NON_PROPERTY_IMAGE_TOKENS = (
    "award",
    "banquet",
    "bedroom",
    "birthday",
    "broker",
    "cabin",
    "celebration",
    "chair",
    "chairs",
    "conference",
    "desk",
    "dining",
    "event",
    "festival",
    "food",
    "headshot",
    "interior",
    "interview",
    "kitchen",
    "meeting",
    "people",
    "person",
    "restaurant",
    "selfie",
    "sofa",
    "table",
    "team",
    "testimonial",
    "workstation",
    "yoga",
)
PROPERTY_IMAGE_TOKENS = (
    "aerial",
    "amenity",
    "apartment",
    "building",
    "club",
    "clubhouse",
    "commercial",
    "elevation",
    "entrance",
    "exterior",
    "facade",
    "facade",
    "floor-plan",
    "floorplan",
    "gallery",
    "landscape",
    "location",
    "master-plan",
    "masterplan",
    "office-space",
    "plot",
    "project",
    "property",
    "residence",
    "residential",
    "retail",
    "site-plan",
    "tower",
    "villa",
)
UPCOMING_TOKENS = (
    "launching soon",
    "new launch",
    "new-launch",
    "pre launch",
    "pre-launch",
    "prelaunch",
    "upcoming",
)
IMAGE_URL_RE = re.compile(r"https?://[^\"'()\s<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^\"'()\s<>]*)?", re.I)
VIDEO_URL_RE = re.compile(r"https?://[^\"'()\s<>]+?(?:youtube\.com/embed/[^\"'()\s<>]+|youtu\.be/[^\"'()\s<>]+|vimeo\.com/[^\"'()\s<>]+|\.mp4(?:\?[^\"'()\s<>]*)?)", re.I)


@dataclass
class ImageCandidate:
    url: str
    source: str
    match_type: str
    caption: str = ""
    source_page: str = ""


@dataclass
class DownloadedImage:
    source_url: str
    local_path: str
    source: str
    match_type: str
    width: int = 0
    height: int = 0
    sha256: str = ""


@dataclass
class ImageCompletionStats:
    properties: int = 0
    properties_with_5_images: int = 0
    properties_with_maps_fallback: int = 0
    properties_needing_review: int = 0
    downloaded_images: int = 0
    rejected_images: int = 0
    upcoming_next_6_months: int = 0
    failures: list[dict[str, str]] = field(default_factory=list)


def clean_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def safe_slug(value: str, fallback: str = "property") -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", clean_text(value).lower()).strip("-")
    return (slug or fallback)[:100]


def read_json_list(value: str) -> list[dict[str, Any]]:
    if not value:
        return []
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        return []
    return parsed if isinstance(parsed, list) else []


def image_dimensions(path: Path) -> tuple[int, int]:
    try:
        from PIL import Image

        with Image.open(path) as image:
            return image.size
    except Exception:
        return 0, 0


def looks_like_listing_image(url: str, caption: str = "") -> bool:
    if not url:
        return False
    parsed = urlparse(url)
    path = parsed.path.lower()
    text = f"{url} {caption}".lower()
    if path.endswith((".svg", ".gif", ".ico")):
        return False
    return not any(token in text for token in BAD_IMAGE_TOKENS)


def row_looks_like_non_property(row: dict[str, str]) -> bool:
    title_url = " ".join(
        [
            get_row_value(row, "project_name", "title", "name"),
            get_row_value(row, "project_url", "source_url"),
        ]
    ).lower()
    description = get_row_value(row, "description", "project_description").lower()
    if (
        any(token in title_url for token in PROPERTY_IMAGE_TOKENS)
        or re.search(r"\b(projects?|properties|residential|commercial|township|apartments?|villas?)\b", title_url)
    ) and not re.search(r"\b(event|restaurant launch|award|blog|news|press|404)\b", title_url):
        return False
    text = f"{title_url} {description[:600]}"
    if any(token in title_url for token in NON_PROPERTY_ROW_TOKENS):
        return True
    if re.search(r"\b(top benefits|benefits of investing|how to|guide to)\b", title_url):
        return True
    if any(token in description[:600] for token in ("wellness festival", "restaurant launch", "award ceremony")):
        return True
    return False


def candidate_looks_like_property_image(candidate: ImageCandidate, row: dict[str, str]) -> bool:
    if not looks_like_listing_image(candidate.url, candidate.caption):
        return False
    text = " ".join(
        [
            candidate.url,
            candidate.caption,
            candidate.match_type,
            candidate.source_page,
            get_row_value(row, "project_name"),
            get_row_value(row, "property_type"),
        ]
    ).lower()
    if any(token in text for token in NON_PROPERTY_IMAGE_TOKENS):
        return False
    if candidate.source == "google_maps":
        return not row_looks_like_non_property(row)
    if any(token in text for token in PROPERTY_IMAGE_TOKENS):
        return True
    # Many builder sites use opaque CDN names. Only allow those when the row itself
    # is a specific property/project page, not an event, blog, or generic page.
    return not row_looks_like_non_property(row)


def get_row_value(row: dict[str, str], *keys: str) -> str:
    for key in keys:
        if row.get(key):
            return clean_text(row[key])
    return ""


def property_id_for_row(index: int, row: dict[str, str]) -> str:
    return (
        get_row_value(row, "internal_id", "customId", "custom_id", "property_id", "id")
        or f"JW-AUTO-{index:06d}"
    )


def official_candidates(row: dict[str, str]) -> list[ImageCandidate]:
    candidates: list[ImageCandidate] = []
    for item in read_json_list(row.get("listing_images", "") or row.get("listing_images_json", "")):
        url = clean_text(item.get("url"))
        caption = clean_text(item.get("caption") or item.get("alt"))
        source = clean_text(item.get("source")) or "official_builder"
        verified = clean_text(item.get("verified"))
        marker = f"{source} {verified} {caption}".lower()
        if any(token in marker for token in ("same_builder_reference", "not_same_project", "generated_placeholder", "generated_not_real_photo")):
            continue
        if looks_like_listing_image(url, caption) and "googleapis.com/maps/api/place/photo" not in url:
            candidates.append(
                ImageCandidate(
                    url=url,
                    source=source,
                    match_type=verified or "official_builder_source",
                    caption=caption,
                    source_page=get_row_value(row, "project_url", "source_url"),
                )
            )
    for i in range(1, 11):
        url = get_row_value(row, f"image_{i}_url", f"official_image_{i}_url")
        source_marker = get_row_value(row, f"image_{i}_source", f"official_image_{i}_source").lower()
        if any(token in source_marker for token in ("same_builder", "fallback", "generated")):
            continue
        if looks_like_listing_image(url):
            candidates.append(
                ImageCandidate(
                    url=url,
                    source="official_builder",
                    match_type="official_builder_column",
                    source_page=get_row_value(row, "project_url", "source_url"),
                )
            )
    seen: set[str] = set()
    output: list[ImageCandidate] = []
    for candidate in candidates:
        key = candidate.url.split("?", 1)[0]
        if key in seen:
            continue
        seen.add(key)
        output.append(candidate)
    return output


def best_src_from_srcset(srcset: str) -> str:
    best_url = ""
    best_width = -1
    for part in srcset.split(","):
        bits = part.strip().split()
        if not bits:
            continue
        url = bits[0]
        width = 0
        if len(bits) > 1 and bits[1].endswith("w"):
            try:
                width = int(bits[1][:-1])
            except ValueError:
                width = 0
        if width >= best_width:
            best_url = url
            best_width = width
    return best_url


def page_scrape_candidates(
    row: dict[str, str],
    session: requests.Session,
    request_timeout: int,
) -> tuple[list[ImageCandidate], dict[str, str]]:
    page_url = get_row_value(row, "project_url", "source_url")
    if not page_url.startswith(("http://", "https://")):
        return [], {}
    metadata: dict[str, str] = {"scraped_project_url": page_url}
    try:
        response = session.get(
            page_url,
            timeout=request_timeout,
            headers={
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            },
        )
        response.raise_for_status()
    except Exception as exc:
        metadata["page_scrape_error"] = str(exc)
        return [], metadata

    soup = BeautifulSoup(response.text, "lxml")
    candidates: list[ImageCandidate] = []

    def add(url: str, caption: str = "", match_type: str = "builder_page_image") -> None:
        direct = clean_text(url)
        if not direct:
            return
        direct = urljoin(response.url, direct)
        if looks_like_listing_image(direct, caption):
            candidates.append(
                ImageCandidate(
                    url=direct,
                    source="builder_page_scrape",
                    match_type=match_type,
                    caption=caption,
                    source_page=response.url,
                )
            )

    for meta_name in ("og:image", "twitter:image", "image"):
        for tag in soup.find_all("meta", attrs={"property": meta_name}) + soup.find_all("meta", attrs={"name": meta_name}):
            add(tag.get("content", ""), meta_name, "builder_page_meta_image")

    image_attrs = (
        "src",
        "data-src",
        "data-lazy-src",
        "data-original",
        "data-image",
        "data-bg",
        "data-background",
    )
    for tag in soup.select("img, source"):
        caption = clean_text(tag.get("alt") or tag.get("title") or "")
        srcset = tag.get("srcset") or tag.get("data-srcset") or ""
        if srcset:
            add(best_src_from_srcset(srcset), caption, "builder_page_srcset_image")
        for attr in image_attrs:
            add(tag.get(attr, ""), caption)

    for tag in soup.select("[style]"):
        style = tag.get("style", "")
        for url in re.findall(r"url\(['\"]?([^'\")]+)['\"]?\)", style, re.I):
            add(url, clean_text(tag.get_text(" "))[:120], "builder_page_background_image")

    for anchor in soup.select("a[href]"):
        href = anchor.get("href", "")
        if re.search(r"\.(?:jpg|jpeg|png|webp)(?:\?|$)", href, re.I):
            add(href, clean_text(anchor.get_text(" "))[:120], "builder_page_linked_image")

    for url in IMAGE_URL_RE.findall(response.text):
        add(url, "", "builder_page_embedded_image")

    videos: list[str] = []
    for tag in soup.select("iframe[src], video[src], source[src], a[href]"):
        url = tag.get("src") or tag.get("href") or ""
        direct = urljoin(response.url, url)
        if any(marker in direct.lower() for marker in ("youtube.com", "youtu.be", "vimeo.com", ".mp4")):
            videos.append(direct)
    videos.extend(VIDEO_URL_RE.findall(response.text))

    description = ""
    for selector in (
        "meta[name=description]",
        "meta[property='og:description']",
        "meta[name='twitter:description']",
    ):
        tag = soup.select_one(selector)
        if tag and tag.get("content"):
            description = clean_text(tag.get("content"))
            break
    if not description:
        text_blocks = []
        for selector in ("[class*=overview]", "[class*=description]", "[id*=overview]", "[id*=description]", "section"):
            for tag in soup.select(selector)[:8]:
                text = clean_text(tag.get_text(" "))
                if 80 <= len(text) <= 4000:
                    text_blocks.append(text)
        description = max(text_blocks, key=len, default="")

    metadata["scraped_description"] = description
    metadata["scraped_video_urls"] = json.dumps(list(dict.fromkeys(videos))[:20], ensure_ascii=False)
    metadata["scraped_page_image_candidates"] = str(len(candidates))

    seen: set[str] = set()
    output: list[ImageCandidate] = []
    for candidate in candidates:
        key = candidate.url.split("?", 1)[0]
        if key in seen:
            continue
        seen.add(key)
        output.append(candidate)
    return output, metadata


def maps_query(row: dict[str, str]) -> str:
    parts = [
        get_row_value(row, "project_name", "name", "title"),
        get_row_value(row, "builder_name", "source_name"),
        get_row_value(row, "address"),
        get_row_value(row, "sector", "locality", "area"),
        get_row_value(row, "city"),
        "India",
    ]
    return clean_text(" ".join(part for part in parts if part and part.lower() != "not specified"))


def google_maps_place_photos(row: dict[str, str], api_key: str, limit: int = 5) -> tuple[list[ImageCandidate], dict[str, str]]:
    if not api_key:
        return [], {}
    query = maps_query(row)
    if not query:
        return [], {}
    metadata: dict[str, str] = {"maps_query": query}
    try:
        response = requests.get(
            "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
            params={
                "input": query,
                "inputtype": "textquery",
                "fields": "place_id,name,formatted_address,geometry",
                "key": api_key,
            },
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
        candidates = payload.get("candidates") or []
        if not candidates:
            metadata["maps_status"] = payload.get("status", "ZERO_RESULTS")
            return [], metadata
        place = candidates[0]
        place_id = place.get("place_id", "")
        metadata.update(
            {
                "google_maps_place_id": place_id,
                "google_maps_name": clean_text(place.get("name")),
                "google_maps_address": clean_text(place.get("formatted_address")),
            }
        )
        details = requests.get(
            "https://maps.googleapis.com/maps/api/place/details/json",
            params={
                "place_id": place_id,
                "fields": "name,formatted_address,geometry,photos,url",
                "key": api_key,
            },
            timeout=20,
        )
        details.raise_for_status()
        detail_payload = details.json()
        result = detail_payload.get("result") or {}
        metadata["google_maps_url"] = clean_text(result.get("url"))
        metadata["google_maps_name"] = clean_text(result.get("name")) or metadata.get("google_maps_name", "")
        metadata["google_maps_address"] = clean_text(result.get("formatted_address")) or metadata.get(
            "google_maps_address", ""
        )
        photos = result.get("photos") or []
        candidates = []
        for photo in photos[:limit]:
            reference = photo.get("photo_reference")
            if not reference:
                continue
            candidates.append(
                ImageCandidate(
                    url=(
                        "https://maps.googleapis.com/maps/api/place/photo"
                        f"?maxwidth=1600&photo_reference={quote_plus(reference)}&key={quote_plus(api_key)}"
                    ),
                    source="google_maps",
                    match_type="google_maps_place_photo",
                    caption=metadata.get("google_maps_name", ""),
                    source_page=metadata.get("google_maps_url", ""),
                )
            )
        return candidates, metadata
    except Exception as exc:
        metadata["maps_status"] = f"error: {exc}"
        return [], metadata


def download_candidate(
    session: requests.Session,
    candidate: ImageCandidate,
    row: dict[str, str],
    output_dir: Path,
    seen_hashes: set[str],
    min_width: int,
    min_height: int,
    horizontal_only: bool,
    request_timeout: int,
) -> tuple[DownloadedImage | None, str]:
    if not candidate_looks_like_property_image(candidate, row):
        return None, "rejected_non_property_image"
    try:
        response = session.get(candidate.url, timeout=request_timeout, allow_redirects=True)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "").lower()
        if "image" not in content_type and not candidate.url.lower().split("?", 1)[0].endswith(
            (".jpg", ".jpeg", ".png", ".webp")
        ):
            return None, "not_image"
        digest = hashlib.sha256(response.content).hexdigest()
        if digest in seen_hashes:
            return None, "duplicate"
        suffix = ".jpg"
        parsed_suffix = Path(urlparse(response.url).path).suffix.lower()
        if parsed_suffix in {".jpg", ".jpeg", ".png", ".webp"}:
            suffix = parsed_suffix
        temp_path = output_dir / f"{digest[:16]}{suffix}"
        temp_path.write_bytes(response.content)
        width, height = image_dimensions(temp_path)
        if width < min_width or height < min_height or (horizontal_only and width < height):
            temp_path.unlink(missing_ok=True)
            return None, "bad_dimensions"
        seen_hashes.add(digest)
        return (
            DownloadedImage(
                source_url=candidate.url,
                local_path=str(temp_path),
                source=candidate.source,
                match_type=candidate.match_type,
                width=width,
                height=height,
                sha256=digest,
            ),
            "",
        )
    except Exception as exc:
        return None, f"download_error: {exc}"


def parse_date(value: str) -> date | None:
    value = clean_text(value)
    if not value:
        return None
    formats = ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%b %Y", "%B %Y", "%Y")
    for fmt in formats:
        try:
            parsed = datetime.strptime(value, fmt)
            return parsed.date()
        except ValueError:
            continue
    match = re.search(r"\b(20\d{2})\b", value)
    if match:
        return date(int(match.group(1)), 12, 31)
    return None


def upcoming_next_six_months(row: dict[str, str], today: date | None = None) -> bool:
    today = today or date.today()
    horizon = today + timedelta(days=183)
    text = " ".join(
        [
            get_row_value(row, "status", "project_status", "new_launch_status"),
            get_row_value(row, "project_name"),
            get_row_value(row, "description", "project_description"),
            get_row_value(row, "project_url"),
        ]
    ).lower()
    if any(token in text for token in UPCOMING_TOKENS):
        return True
    for key in ("launch_date", "possession_date"):
        parsed = parse_date(get_row_value(row, key))
        if parsed and today <= parsed <= horizon:
            return True
    return False


def complete_property_images(
    input_csv: str | Path,
    output_dir: str | Path,
    maps_api_key: str = "",
    target_images: int = 5,
    min_width: int = 500,
    min_height: int = 250,
    horizontal_only: bool = True,
    sleep_seconds: float = 0.05,
    request_timeout: int = 12,
    progress_every: int = 25,
    refresh_from_pages: bool = True,
    same_builder_for_upcoming: bool = True,
) -> dict[str, Any]:
    input_csv = Path(input_csv)
    output_dir = Path(output_dir)
    if output_dir.exists():
        shutil.rmtree(output_dir)
    images_root = output_dir / "properties"
    cache_root = output_dir / "image-cache"
    images_root.mkdir(parents=True)
    cache_root.mkdir(parents=True)

    with input_csv.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
        fieldnames = list(reader.fieldnames or [])

    stats = ImageCompletionStats(properties=len(rows))
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"
            )
        }
    )
    final_rows: list[dict[str, Any]] = []
    final_rows_by_index: dict[int, dict[str, Any]] = {}
    slot_rows: list[dict[str, Any]] = []
    same_builder_pool: dict[str, list[DownloadedImage]] = {}
    same_builder_reference_properties = 0
    same_builder_reference_images = 0

    extra_fields = [
        "is_upcoming_next_6_months",
        "completed_image_count",
        "has_5_completed_images",
        "used_google_maps_images",
        "used_same_builder_reference_images",
        "image_completion_review_notes",
        "google_maps_place_id",
        "google_maps_name",
        "google_maps_address",
        "google_maps_url",
        "scraped_project_url",
        "scraped_description",
        "scraped_video_urls",
        "scraped_page_image_candidates",
        "page_scrape_error",
    ]
    for i in range(1, target_images + 1):
        extra_fields.extend(
            [
                f"completed_local_image_{i}_path",
                f"completed_image_{i}_source_url",
                f"completed_image_{i}_source",
                f"completed_image_{i}_match_type",
                f"completed_image_{i}_width",
                f"completed_image_{i}_height",
            ]
        )
    output_fields = list(dict.fromkeys(fieldnames + extra_fields))

    indexed_rows = list(enumerate(rows, 1))
    processing_order = sorted(indexed_rows, key=lambda item: (upcoming_next_six_months(item[1]), item[0]))

    for processed_count, (index, row) in enumerate(processing_order, 1):
        if progress_every and (processed_count == 1 or processed_count % progress_every == 0 or processed_count == len(rows)):
            print(f"[complete-images] {processed_count}/{len(rows)}", flush=True)
        prop_id = property_id_for_row(index, row)
        builder_key = clean_text(get_row_value(row, "builder_name", "source_name")).lower()
        is_upcoming = upcoming_next_six_months(row)
        non_property_row = row_looks_like_non_property(row)
        prop_dir = images_root / prop_id
        prop_dir.mkdir(parents=True, exist_ok=True)
        page_metadata: dict[str, str] = {}
        candidates: list[ImageCandidate] = []
        if refresh_from_pages:
            page_candidates, page_metadata = page_scrape_candidates(row, session, request_timeout)
            candidates.extend(page_candidates)
        candidates.extend(official_candidates(row))
        maps_metadata: dict[str, str] = {}
        downloaded: list[DownloadedImage] = []
        seen_hashes: set[str] = set()
        rejections = 0

        for candidate in candidates:
            image, reason = download_candidate(
                session, candidate, row, cache_root, seen_hashes, min_width, min_height, horizontal_only, request_timeout
            )
            if image:
                downloaded.append(image)
            else:
                rejections += 1
            if len(downloaded) >= target_images:
                break

        used_maps = False
        if len(downloaded) < target_images and maps_api_key:
            maps_candidates, maps_metadata = google_maps_place_photos(row, maps_api_key, limit=target_images * 2)
            time.sleep(sleep_seconds)
            for candidate in maps_candidates:
                image, reason = download_candidate(
                    session, candidate, row, cache_root, seen_hashes, min_width, min_height, horizontal_only, request_timeout
                )
                if image:
                    downloaded.append(image)
                    used_maps = True
                else:
                    rejections += 1
                if len(downloaded) >= target_images:
                    break

        used_same_builder_reference = False
        if (
            same_builder_for_upcoming
            and is_upcoming
            and len(downloaded) < target_images
            and builder_key
            and not non_property_row
        ):
            for reference in same_builder_pool.get(builder_key, []):
                if reference.sha256 in seen_hashes:
                    continue
                seen_hashes.add(reference.sha256)
                downloaded.append(
                    DownloadedImage(
                        source_url=reference.source_url,
                        local_path=reference.local_path,
                        source="same_builder_built_property_reference",
                        match_type="upcoming_same_builder_built_property_image",
                        width=reference.width,
                        height=reference.height,
                        sha256=reference.sha256,
                    )
                )
                used_same_builder_reference = True
                same_builder_reference_images += 1
                if len(downloaded) >= target_images:
                    break

        selected = downloaded[:target_images]
        for slot, image in enumerate(selected, 1):
            source_token = safe_slug(f"{image.source}-{image.match_type}", "image")[:42]
            extension = Path(image.local_path).suffix or ".jpg"
            dest = prop_dir / f"image_{slot:02d}_{source_token}_{image.sha256[:12]}{extension}"
            shutil.copy2(image.local_path, dest)
            row[f"completed_local_image_{slot}_path"] = str(dest.resolve())
            row[f"completed_image_{slot}_source_url"] = image.source_url if image.source != "google_maps" else ""
            row[f"completed_image_{slot}_source"] = image.source
            row[f"completed_image_{slot}_match_type"] = image.match_type
            row[f"completed_image_{slot}_width"] = image.width
            row[f"completed_image_{slot}_height"] = image.height
            slot_rows.append(
                {
                    "property_id": prop_id,
                    "project_name": get_row_value(row, "project_name"),
                    "slot": slot,
                    "local_image_path": str(dest.resolve()),
                    "source": image.source,
                    "match_type": image.match_type,
                    "source_url": "" if image.source == "google_maps" else image.source_url,
                    "width": image.width,
                    "height": image.height,
                }
            )

        row["is_upcoming_next_6_months"] = "Yes" if is_upcoming else "No"
        row["completed_image_count"] = len(selected)
        row["has_5_completed_images"] = "Yes" if len(selected) >= target_images else "No"
        row["used_google_maps_images"] = "Yes" if used_maps else "No"
        row["used_same_builder_reference_images"] = "Yes" if used_same_builder_reference else "No"
        row["google_maps_place_id"] = maps_metadata.get("google_maps_place_id", row.get("google_maps_place_id", ""))
        row["google_maps_name"] = maps_metadata.get("google_maps_name", "")
        row["google_maps_address"] = maps_metadata.get("google_maps_address", "")
        row["google_maps_url"] = maps_metadata.get("google_maps_url", row.get("google_maps_url", ""))
        row["scraped_project_url"] = page_metadata.get("scraped_project_url", "")
        row["scraped_description"] = page_metadata.get("scraped_description", "")
        row["scraped_video_urls"] = page_metadata.get("scraped_video_urls", "[]")
        row["scraped_page_image_candidates"] = page_metadata.get("scraped_page_image_candidates", "0")
        row["page_scrape_error"] = page_metadata.get("page_scrape_error", "")
        if page_metadata.get("scraped_description"):
            row["description"] = page_metadata["scraped_description"]
        notes = []
        if non_property_row:
            notes.append("Row appears to be an event/blog/generic/non-property page; property-only image rule applied.")
        if len(selected) < target_images:
            notes.append(f"Only {len(selected)} verified local listing images found; needs manual media review.")
            stats.properties_needing_review += 1
        if used_maps:
            notes.append("Google Maps place photos used after builder website images were insufficient.")
            stats.properties_with_maps_fallback += 1
        if used_same_builder_reference:
            notes.append("Upcoming property filled with same-builder built property reference images.")
            same_builder_reference_properties += 1
        row["image_completion_review_notes"] = " ".join(notes)

        stats.downloaded_images += len(selected)
        stats.rejected_images += rejections
        stats.properties_with_5_images += int(len(selected) >= target_images)
        stats.upcoming_next_6_months += int(is_upcoming)
        if builder_key and not non_property_row:
            same_builder_pool.setdefault(builder_key, [])
            for image in selected:
                if image.source in {"builder_page_scrape", "official_builder"} and not any(
                    existing.sha256 == image.sha256 for existing in same_builder_pool[builder_key]
                ):
                    same_builder_pool[builder_key].append(image)
        final_rows_by_index[index] = row

    final_rows = [final_rows_by_index[index] for index in sorted(final_rows_by_index)]

    properties_csv = output_dir / "completed_properties.csv"
    with properties_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=output_fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(final_rows)

    slots_csv = output_dir / "completed_image_slots.csv"
    slot_fields = ["property_id", "project_name", "slot", "local_image_path", "source", "match_type", "source_url", "width", "height"]
    with slots_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=slot_fields)
        writer.writeheader()
        writer.writerows(slot_rows)

    sqlite_path = output_dir / "completed_properties.sqlite"
    connection = sqlite3.connect(sqlite_path)
    with connection:
        connection.execute(
            "create table properties (%s)" % ",".join(f'"{field}" text' for field in output_fields)
        )
        connection.executemany(
            "insert into properties values (%s)" % ",".join("?" for _ in output_fields),
            [[str(row.get(field, "")) for field in output_fields] for row in final_rows],
        )
        connection.execute("create table image_slots (%s)" % ",".join(f'"{field}" text' for field in slot_fields))
        connection.executemany(
            "insert into image_slots values (%s)" % ",".join("?" for _ in slot_fields),
            [[str(row.get(field, "")) for field in slot_fields] for row in slot_rows],
        )
    connection.close()

    summary = {
        "input_csv": str(input_csv.resolve()),
        "output_dir": str(output_dir.resolve()),
        "properties_csv": str(properties_csv.resolve()),
        "image_slots_csv": str(slots_csv.resolve()),
        "sqlite": str(sqlite_path.resolve()),
        "properties": stats.properties,
        "properties_with_5_images": stats.properties_with_5_images,
        "properties_with_google_maps_fallback": stats.properties_with_maps_fallback,
        "upcoming_properties_with_same_builder_reference": same_builder_reference_properties,
        "same_builder_reference_images_used": same_builder_reference_images,
        "properties_needing_review": stats.properties_needing_review,
        "downloaded_images": stats.downloaded_images,
        "rejected_images": stats.rejected_images,
        "upcoming_next_6_months": stats.upcoming_next_6_months,
        "notes": [
            "Builder website images are attempted first.",
            "Google Maps place photos are used only when official builder images are insufficient and an API key is provided.",
            "Same-builder built property reference images are used only for upcoming rows that still have fewer than five images.",
            "Event, restaurant, blog, award, team, chair/desk/interior, and other non-property media are rejected by strict token rules.",
            "Google Maps image source URLs are intentionally not stored with the API key in the CSV.",
            "Rows with has_5_completed_images=No should not be imported to production until manually completed.",
        ],
    }
    summary_path = output_dir / "completion_summary.json"
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
