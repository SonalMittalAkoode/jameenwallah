from __future__ import annotations

import csv
import html
import json
import os
import re
import sqlite3
import time
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus, urlparse


BEDROOM_RE = re.compile(r"\b([1-9](?:\.\d)?\s*BHK|[1-9]\s*Bedroom|Penthouse|Villa|Plot|Office|Retail|SCO)\b", re.I)
AREA_RE = re.compile(r"\b(\d[\d,]*(?:\.\d+)?)\s*(sq\.?\s*ft|sqft|sq\.ft|acre|acres|sq\.?\s*yd|sqyd)\b", re.I)
PRICE_RE = re.compile(r"(?:₹|Rs\.?|INR)?\s*(\d[\d,.]*(?:\.\d+)?)\s*(Cr|Crore|Crores|Lakh|Lac|Lakhs)?", re.I)
STATUS_KEYWORDS = {
    "upcoming": ("upcoming", "pre-launch", "prelaunch", "new launch", "new-launch", "launching soon"),
    "under_construction": ("under construction", "ongoing", "construction update"),
    "ready_to_move": ("ready to move", "ready-to-move", "delivered", "completed"),
}
DEFAULT_AMENITIES = {
    "residential": ["Security", "Parking", "Power Backup", "Landscaped Greens"],
    "commercial": ["Security", "Parking", "Power Backup", "High-Speed Elevators"],
}


@dataclass
class MapsResult:
    place_id: str = ""
    name: str = ""
    formatted_address: str = ""
    lat: float | None = None
    lng: float | None = None
    google_maps_url: str = ""
    photo_references: list[str] | None = None


def clean_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def csv_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def parse_source_projects(db_path: Path) -> list[dict[str, Any]]:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    projects = []
    for row in conn.execute("select data_json from projects"):
        projects.append(json.loads(row["data_json"]))
    return projects


def normalized_id(index: int) -> str:
    return f"JW-BLD-{index:06d}"


def infer_status(project: dict[str, Any]) -> str:
    text = " ".join(
        [
            project.get("project_url", ""),
            project.get("project_name", ""),
            project.get("short_description", ""),
            project.get("long_description", ""),
        ]
    ).lower()
    for status, keywords in STATUS_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return status
    return project.get("project_status") or "active"


def infer_bedrooms(project: dict[str, Any]) -> list[str]:
    values = []
    for config in project.get("configurations") or []:
        label = clean_text(config.get("configuration") or config.get("unit_type"))
        if label:
            values.append(label.upper())
    text = " ".join([project.get("project_name", ""), project.get("long_description", ""), project.get("project_url", "")])
    values.extend(match.group(1).upper().replace("BEDROOM", "Bedroom") for match in BEDROOM_RE.finditer(text))
    normalized = []
    for value in values:
        value = clean_text(value).replace(" ", "")
        value = value.replace("BHK", " BHK") if "BHK" in value else value
        if value and value not in normalized:
            normalized.append(value)
    return normalized[:12]


def infer_area_values(project: dict[str, Any]) -> list[str]:
    values = []
    for config in project.get("configurations") or []:
        for key in ("size_sqft", "carpet_area", "super_area", "builtup_area"):
            if config.get(key):
                values.append(f"{config[key]} sq.ft")
    text = " ".join([project.get("long_description", ""), project.get("short_description", "")])
    values.extend(f"{m.group(1)} {m.group(2)}" for m in AREA_RE.finditer(text))
    return list(dict.fromkeys(values))[:12]


def infer_price_label(project: dict[str, Any]) -> str:
    price = project.get("price") or {}
    if price.get("raw"):
        return clean_text(price["raw"])
    if price.get("starting"):
        starting = int(price["starting"])
        if starting >= 10000000:
            return f"Starting from Rs {starting / 10000000:.2f} Cr"
        return f"Starting from Rs {starting / 100000:.2f} Lakh"
    text = " ".join([project.get("long_description", ""), project.get("short_description", "")])
    matches = [m.group(0) for m in PRICE_RE.finditer(text)]
    return clean_text(" - ".join(matches[:2]))


def infer_amenities(project: dict[str, Any]) -> list[str]:
    amenities = [clean_text(item).title() for item in (project.get("amenities") or []) if clean_text(item)]
    if not amenities:
        amenities = DEFAULT_AMENITIES["residential" if project.get("category") == "residential" else "commercial"].copy()
    return list(dict.fromkeys(amenities))[:40]


def source_host(url: str) -> str:
    return urlparse(url or "").netloc.lower().removeprefix("www.")


def media_url(item: dict[str, Any]) -> str:
    return clean_text(item.get("url"))


def is_probably_property_image(item: dict[str, Any]) -> bool:
    url = media_url(item)
    if not url:
        return False
    text = " ".join([url, item.get("alt", ""), item.get("caption", ""), item.get("asset_type", "")]).lower()
    bad = ("logo", "icon", "sprite", "favicon", "loader", "qr", "placeholder", "avatar", "profile", "team", "testimonial")
    if any(token in text for token in bad):
        return False
    if url.lower().endswith((".svg", ".gif")):
        return False
    return True


def official_images(project: dict[str, Any]) -> list[dict[str, Any]]:
    images = []
    for bucket in ("gallery_images", "master_plan_images"):
        for item in project.get(bucket) or []:
            if isinstance(item, dict) and is_probably_property_image(item):
                images.append(
                    {
                        "url": media_url(item),
                        "kind": item.get("asset_type") or bucket,
                        "source": "official_builder",
                        "caption": item.get("caption") or item.get("alt") or project.get("project_name", ""),
                        "verified": "source_page",
                    }
                )
    seen = set()
    output = []
    for item in images:
        key = item["url"].split("?", 1)[0]
        if key in seen:
            continue
        seen.add(key)
        output.append(item)
    return output


def floor_plan_images(project: dict[str, Any]) -> list[dict[str, Any]]:
    output = []
    for item in project.get("floor_plans") or []:
        if isinstance(item, dict) and media_url(item):
            output.append(
                {
                    "url": media_url(item),
                    "kind": "floor_plan",
                    "source": "official_builder",
                    "caption": item.get("caption") or item.get("alt") or "Floor plan",
                    "verified": "source_page",
                }
            )
    return output


def video_items(project: dict[str, Any]) -> list[dict[str, Any]]:
    videos = []
    for item in project.get("videos") or []:
        url = media_url(item)
        if not url:
            continue
        videos.append(
            {
                "url": url,
                "provider": item.get("provider") or "embedded",
                "title": item.get("title") or project.get("project_name", ""),
                "source": "official_builder",
            }
        )
    return videos


def make_banner(project: dict[str, Any], output_dir: Path) -> dict[str, Any]:
    output_dir.mkdir(parents=True, exist_ok=True)
    name = clean_text(project.get("project_name")) or "Upcoming Project"
    builder = clean_text(project.get("source_name") or project.get("builder_name")) or "Builder"
    city = clean_text(project.get("city")) or "India"
    slug = re.sub(r"[^a-z0-9]+", "-", f"{builder}-{name}".lower()).strip("-")[:120] or "project"
    path = output_dir / f"{slug}.svg"
    colors = {
        "residential": ("#102a43", "#2f855a", "#edf7ed"),
        "commercial": ("#1f2933", "#b7791f", "#fff7ed"),
    }
    bg, accent, panel = colors["residential" if project.get("category") == "residential" else "commercial"]
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="{html.escape(bg)}"/>
  <rect x="96" y="96" width="1408" height="708" rx="28" fill="{html.escape(panel)}" opacity="0.96"/>
  <rect x="96" y="96" width="1408" height="12" fill="{html.escape(accent)}"/>
  <text x="160" y="275" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" fill="#111827">{html.escape(name[:80])}</text>
  <text x="160" y="355" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#374151">{html.escape(builder[:70])}</text>
  <text x="160" y="425" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#4b5563">{html.escape(city[:60])}</text>
  <text x="160" y="690" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#6b7280">Generated listing banner - replace with verified project media before production publishing</text>
  <path d="M1020 620 L1160 470 L1270 575 L1365 455 L1460 620 Z" fill="{html.escape(accent)}" opacity="0.85"/>
  <rect x="1010" y="620" width="470" height="56" fill="#111827" opacity="0.2"/>
</svg>
"""
    path.write_text(svg, encoding="utf-8")
    return {
        "url": str(path.resolve()),
        "kind": "generated_banner",
        "source": "generated_placeholder",
        "caption": "Generated listing banner; not a real property photograph",
        "verified": "generated_not_real_photo",
    }


def enrich_google_maps(project: dict[str, Any], api_key: str, sleep_seconds: float = 0.1) -> MapsResult:
    if not api_key:
        return MapsResult(photo_references=[])
    try:
        import requests
    except ImportError:
        return MapsResult(photo_references=[])

    query = clean_text(" ".join([project.get("project_name", ""), project.get("source_name", ""), project.get("city", ""), "India"]))
    if not query:
        return MapsResult(photo_references=[])
    params = {
        "input": query,
        "inputtype": "textquery",
        "fields": "place_id,name,formatted_address,geometry,photos,url",
        "key": api_key,
    }
    try:
        response = requests.get("https://maps.googleapis.com/maps/api/place/findplacefromtext/json", params=params, timeout=15)
        payload = response.json()
    except Exception:
        return MapsResult(photo_references=[])
    time.sleep(sleep_seconds)
    candidates = payload.get("candidates") or []
    if not candidates:
        return MapsResult(photo_references=[])
    place = candidates[0]
    location = ((place.get("geometry") or {}).get("location") or {})
    refs = [photo.get("photo_reference") for photo in (place.get("photos") or []) if photo.get("photo_reference")]
    return MapsResult(
        place_id=place.get("place_id", ""),
        name=place.get("name", ""),
        formatted_address=place.get("formatted_address", ""),
        lat=location.get("lat"),
        lng=location.get("lng"),
        google_maps_url=place.get("url", ""),
        photo_references=refs[:5],
    )


def google_photo_template(photo_reference: str) -> str:
    ref = quote_plus(photo_reference)
    return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference={ref}&key={{GOOGLE_MAPS_API_KEY}}"


def google_maps_search_url(address: str) -> str:
    return f"https://www.google.com/maps/search/?api=1&query={quote_plus(address)}" if address else ""


def google_maps_embed_url(address: str) -> str:
    return f"https://www.google.com/maps/embed/v1/place?key={{GOOGLE_MAPS_API_KEY}}&q={quote_plus(address)}" if address else ""


def google_maps_embed_iframe(address: str) -> str:
    url = google_maps_embed_url(address)
    if not url:
        return ""
    return (
        '<iframe width="600" height="450" style="border:0" loading="lazy" '
        'allowfullscreen referrerpolicy="no-referrer-when-downgrade" '
        f'src="{html.escape(url, quote=True)}"></iframe>'
    )


def build_same_builder_pool(projects: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    pool: dict[str, list[dict[str, Any]]] = {}
    for project in projects:
        source = project.get("source_name") or project.get("builder_name") or "Unknown"
        pool.setdefault(source, [])
        for image in official_images(project):
            pool[source].append(image)
    for source, images in pool.items():
        deduped = []
        seen = set()
        for image in images:
            if image["url"] in seen:
                continue
            seen.add(image["url"])
            deduped.append(image)
        pool[source] = deduped
    return pool


def select_listing_images(
    project: dict[str, Any],
    maps: MapsResult,
    same_builder_pool: dict[str, list[dict[str, Any]]],
    banner_dir: Path,
    target_count: int = 5,
) -> list[dict[str, Any]]:
    images = official_images(project)
    for ref in maps.photo_references or []:
        images.append(
            {
                "url": google_photo_template(ref),
                "kind": "google_maps_photo_reference",
                "source": "google_maps",
                "caption": maps.name or project.get("project_name", ""),
                "verified": "maps_place_match_photo_reference",
            }
        )
    if len(images) < target_count:
        source = project.get("source_name") or project.get("builder_name") or "Unknown"
        for item in same_builder_pool.get(source, []):
            if item["url"] in {image["url"] for image in images}:
                continue
            borrowed = dict(item)
            borrowed["source"] = "same_builder_reference"
            borrowed["verified"] = "not_same_project_reference_only"
            images.append(borrowed)
            if len(images) >= target_count:
                break
    while len(images) < target_count:
        images.append(make_banner(project, banner_dir))
    return images[:target_count]


def quality_score(row: dict[str, Any]) -> int:
    score = 0
    for key in ("project_name", "builder_name", "city", "project_url"):
        if row.get(key):
            score += 10
    if row.get("price_label") and row.get("price_label") != "Price on request":
        score += 10
    if row.get("configurations"):
        score += 10
    if row.get("amenities"):
        score += 10
    if int(row.get("image_count") or 0) >= 5:
        score += 10
    if row.get("google_maps_place_id"):
        score += 10
    return min(score, 100)


def refine_database(
    source_db: Path,
    output_dir: Path,
    maps_api_key: str = "",
    target_images: int = 5,
) -> dict[str, Any]:
    output_dir.mkdir(parents=True, exist_ok=True)
    banner_dir = output_dir / "generated-banners"
    projects = parse_source_projects(source_db)
    same_builder_pool = build_same_builder_pool(projects)
    refined_db = output_dir / "refined_builder_properties.sqlite"
    if refined_db.exists():
        refined_db.unlink()
    conn = sqlite3.connect(refined_db)
    conn.execute(
        """
        create table refined_properties (
            internal_id text primary key,
            source_canonical_key text,
            project_name text,
            builder_name text,
            source_name text,
            category text,
            property_type text,
            status text,
            city text,
            sector text,
            address text,
            pincode text,
            latitude real,
            longitude real,
            google_maps_place_id text,
            google_maps_url text,
            google_maps_embed_url text,
            google_maps_embed_iframe text,
            rera_number text,
            price_label text,
            starting_price_inr integer,
            price_per_sqft integer,
            configurations_json text,
            areas_json text,
            amenities_json text,
            listing_images_json text,
            floor_plans_json text,
            videos_json text,
            brochures_json text,
            description text,
            project_url text,
            image_count integer,
            data_quality_score integer,
            review_notes text
        )
        """
    )
    conn.execute(
        """
        create table refined_media (
            internal_id text,
            media_type text,
            url text,
            source text,
            verified text,
            caption text
        )
        """
    )
    rows = []
    media_rows = []
    maps_used = 0
    generated_banners = 0
    same_builder_refs = 0
    for index, project in enumerate(projects, 1):
        internal_id = normalized_id(index)
        maps = enrich_google_maps(project, maps_api_key) if maps_api_key else MapsResult(photo_references=[])
        if maps.place_id:
            maps_used += 1
        listing_images = select_listing_images(project, maps, same_builder_pool, banner_dir, target_count=target_images)
        generated_banners += sum(1 for item in listing_images if item["source"] == "generated_placeholder")
        same_builder_refs += sum(1 for item in listing_images if item["source"] == "same_builder_reference")
        floors = floor_plan_images(project)
        videos = video_items(project)
        brochures = [
            {"url": item.get("url"), "title": item.get("title"), "source": "official_builder"}
            for item in (project.get("brochures") or [])
            if isinstance(item, dict) and item.get("url")
        ]
        amenities = infer_amenities(project)
        configs = infer_bedrooms(project)
        areas = infer_area_values(project)
        price = project.get("price") or {}
        address = maps.formatted_address or project.get("address") or clean_text(" ".join([project.get("sector", ""), project.get("city", ""), "India"]))
        row = {
            "internal_id": internal_id,
            "source_canonical_key": project.get("canonical_key", ""),
            "project_name": clean_text(project.get("project_name")) or "Unnamed Project",
            "builder_name": clean_text(project.get("builder_name") or project.get("source_name")),
            "source_name": clean_text(project.get("source_name")),
            "category": project.get("category") or "unknown",
            "property_type": project.get("project_type") or "Not specified",
            "status": infer_status(project),
            "city": project.get("city") or "Not specified",
            "sector": project.get("sector") or "Not specified",
            "address": address or "Not specified",
            "pincode": project.get("pincode") or "Not specified",
            "latitude": maps.lat if maps.lat is not None else ((project.get("coordinates") or {}).get("lat") or ""),
            "longitude": maps.lng if maps.lng is not None else ((project.get("coordinates") or {}).get("lng") or ""),
            "google_maps_place_id": maps.place_id,
            "google_maps_url": maps.google_maps_url or google_maps_search_url(address),
            "google_maps_embed_url": google_maps_embed_url(address),
            "google_maps_embed_iframe": google_maps_embed_iframe(address),
            "rera_number": project.get("rera_number") or "Not disclosed",
            "price_label": infer_price_label(project) or "Price on request",
            "starting_price_inr": price.get("starting") or "",
            "price_per_sqft": price.get("price_per_sqft") or "",
            "configurations": csv_json(configs or ["Not specified"]),
            "areas": csv_json(areas or ["Not specified"]),
            "amenities": csv_json(amenities),
            "listing_images": csv_json(listing_images),
            "floor_plans": csv_json(floors),
            "videos": csv_json(videos),
            "brochures": csv_json(brochures),
            "description": clean_text(project.get("project_description") or project.get("short_description")) or "Description not available from source.",
            "project_url": project.get("project_url") or project.get("source_url") or "",
            "image_count": len(listing_images),
            "review_notes": "",
        }
        if any(item["source"] in {"generated_placeholder", "same_builder_reference"} for item in listing_images):
            row["review_notes"] = "Contains non-project-specific reference/generated media; replace before public production use."
        row["data_quality_score"] = quality_score(row)
        rows.append(row)
        for item in listing_images:
            media_rows.append((internal_id, item["kind"], item["url"], item["source"], item["verified"], item["caption"]))
        for item in floors:
            media_rows.append((internal_id, "floor_plan", item["url"], item["source"], item["verified"], item["caption"]))
        for item in videos:
            media_rows.append((internal_id, "video", item["url"], item["source"], "source_page", item["title"]))
        for item in brochures:
            media_rows.append((internal_id, "brochure", item["url"], item["source"], "source_page", item["title"] or "Brochure"))

    insert_fields = [
        "internal_id",
        "source_canonical_key",
        "project_name",
        "builder_name",
        "source_name",
        "category",
        "property_type",
        "status",
        "city",
        "sector",
        "address",
        "pincode",
        "latitude",
        "longitude",
        "google_maps_place_id",
        "google_maps_url",
        "google_maps_embed_url",
        "google_maps_embed_iframe",
        "rera_number",
        "price_label",
        "starting_price_inr",
        "price_per_sqft",
        "configurations",
        "areas",
        "amenities",
        "listing_images",
        "floor_plans",
        "videos",
        "brochures",
        "description",
        "project_url",
        "image_count",
        "data_quality_score",
        "review_notes",
    ]
    sql_fields = [
        "internal_id",
        "source_canonical_key",
        "project_name",
        "builder_name",
        "source_name",
        "category",
        "property_type",
        "status",
        "city",
        "sector",
        "address",
        "pincode",
        "latitude",
        "longitude",
        "google_maps_place_id",
        "google_maps_url",
        "google_maps_embed_url",
        "google_maps_embed_iframe",
        "rera_number",
        "price_label",
        "starting_price_inr",
        "price_per_sqft",
        "configurations_json",
        "areas_json",
        "amenities_json",
        "listing_images_json",
        "floor_plans_json",
        "videos_json",
        "brochures_json",
        "description",
        "project_url",
        "image_count",
        "data_quality_score",
        "review_notes",
    ]
    placeholders = ",".join(["?"] * len(sql_fields))
    conn.executemany(
        f"insert into refined_properties ({','.join(sql_fields)}) values ({placeholders})",
        [[row[field] for field in insert_fields] for row in rows],
    )
    conn.executemany("insert into refined_media values (?,?,?,?,?,?)", media_rows)
    conn.commit()

    properties_csv = output_dir / "refined_builder_properties.csv"
    with properties_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=insert_fields)
        writer.writeheader()
        writer.writerows(rows)

    media_csv = output_dir / "refined_builder_media.csv"
    with media_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["internal_id", "media_type", "url", "source", "verified", "caption"])
        writer.writerows(media_rows)

    summary = {
        "source_database": str(source_db.resolve()),
        "refined_database": str(refined_db.resolve()),
        "properties_csv": str(properties_csv.resolve()),
        "media_csv": str(media_csv.resolve()),
        "property_count": len(rows),
        "media_rows": len(media_rows),
        "target_images_per_property": target_images,
        "properties_with_5_listing_images": sum(1 for row in rows if int(row["image_count"]) >= target_images),
        "google_maps_enriched_properties": maps_used,
        "generated_banner_images": generated_banners,
        "same_builder_reference_images": same_builder_refs,
        "maps_api_used": bool(maps_api_key),
        "notes": [
            "Google Maps photo URLs are exported as templates containing {GOOGLE_MAPS_API_KEY}; do not hard-code secrets into CSV files.",
            "generated_placeholder and same_builder_reference media are not verified project photographs.",
            "Use data_quality_score and review_notes before production import.",
        ],
    }
    summary_path = output_dir / "refined_summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    zip_path = output_dir.parent / "refined-builder-property-database.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in [refined_db, properties_csv, media_csv, summary_path]:
            archive.write(path, path.relative_to(output_dir.parent))
        for path in banner_dir.glob("*.svg"):
            archive.write(path, path.relative_to(output_dir.parent))
    summary["zip_path"] = str(zip_path.resolve())
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    return summary
