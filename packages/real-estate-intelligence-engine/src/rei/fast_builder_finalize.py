from __future__ import annotations

import csv
import json
import re
import sqlite3
import zipfile
from collections import defaultdict
from pathlib import Path
from typing import Any

csv.field_size_limit(40_000_000)

BAD_ROW_TOKENS = (
    "award",
    "blog",
    "celebration",
    "event",
    "festival",
    "holiday inn",
    "interview",
    "media",
    "news",
    "press release",
    "restaurant launch",
    "testimonial",
    "webinar",
    "wellness festival",
)
GOOD_ROW_TOKENS = (
    "project",
    "property",
    "residential",
    "commercial",
    "apartment",
    "villa",
    "plot",
    "retail",
    "office",
    "tower",
    "arcade",
    "estate",
    "greens",
    "upcoming",
    "new launch",
)
BAD_IMAGE_TOKENS = (
    "data:image",
    ".svg",
    "arrow",
    "cross-out",
    "facebook",
    "fb-",
    "instagram",
    "linkedin",
    "youtube",
    "icon",
    "logo",
    "favicon",
    "sprite",
    "avatar",
    "profile",
    "testimonial",
    "team",
    "restaurant",
    "event",
    "festival",
    "yoga",
    "food",
    "chair",
    "chairs",
    "sofa",
    "table",
    "kitchen",
    "bathroom",
    "bedroom",
    "interview",
    "googletagmanager",
    "google.com/maps/embed",
    "brochure",
    "floor-plan",
    "floorplan",
    "site-plan",
    "master-layout",
    "master plan",
    "header/adani_realty",
)
PROPERTY_IMAGE_TOKENS = (
    "project",
    "property",
    "tower",
    "building",
    "facade",
    "exterior",
    "elevation",
    "commercial",
    "residential",
    "retail",
    "office",
    "villa",
    "plot",
    "arcade",
    "estate",
    "greens",
    "aerial",
    "site",
    "entrance",
    "clubhouse",
    "lobby",
    "landscape",
)
UPCOMING_TOKENS = ("upcoming", "new launch", "pre-launch", "launching soon")


def clean_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def token_present(text: str, token: str) -> bool:
    text = text.lower()
    token = token.lower()
    if " " in token or "-" in token or "." in token:
        return token in text
    return re.search(rf"(?<![a-z0-9]){re.escape(token)}(?![a-z0-9])", text) is not None


def row_is_listing(row: dict[str, str]) -> tuple[bool, str]:
    text = " ".join(
        [
            clean_text(row.get("project_name")),
            clean_text(row.get("project_url")),
            clean_text(row.get("description"))[:300],
        ]
    ).lower()
    if any(token_present(text, token) for token in BAD_ROW_TOKENS):
        return False, "non_property_event_or_article"
    if not any(token_present(text, token) for token in GOOD_ROW_TOKENS):
        return False, "not_enough_property_signals"
    return True, "property_listing"


def row_is_upcoming(row: dict[str, str]) -> bool:
    text = " ".join(
        [
            clean_text(row.get("status")),
            clean_text(row.get("project_name")),
            clean_text(row.get("description")),
            clean_text(row.get("project_url")),
        ]
    ).lower()
    return any(token in text for token in UPCOMING_TOKENS)


def media_is_good(row: dict[str, str], project_row: dict[str, str]) -> bool:
    if row.get("media_type") != "listing_image":
        return False
    url = clean_text(row.get("url")).lower()
    caption = clean_text(row.get("caption")).lower()
    source = clean_text(row.get("source")).lower()
    conf = clean_text(row.get("confidence")).lower()
    text = " ".join([url, caption, source, conf])
    if any(token_present(text, token) for token in BAD_IMAGE_TOKENS):
        return False
    if url.endswith(".svg"):
        return False
    if "maps.googleapis.com/maps/api/place/photo" not in url and not (
        url.startswith("http://") or url.startswith("https://")
    ):
        return False
    if "google_maps_place_photo" in source:
        return row_is_listing(project_row)
    if not media_matches_project(row, project_row):
        return False
    if any(token_present(text, token) for token in PROPERTY_IMAGE_TOKENS):
        return True
    # Allow official builder images unless the page itself is a non-listing.
    return True


def project_tokens(project_row: dict[str, str]) -> list[str]:
    text = " ".join([clean_text(project_row.get("project_name")), clean_text(project_row.get("project_url"))]).lower()
    tokens = re.findall(r"[a-z0-9]{4,}", text)
    builder_tokens = set(re.findall(r"[a-z0-9]{4,}", clean_text(project_row.get("builder_name")).lower()))
    stop = {
        "about",
        "adani",
        "adanirealty",
        "apartments",
        "builder",
        "commercial",
        "current",
        "cpic",
        "estate",
        "greens",
        "group",
        "gurgaon",
        "gurugram",
        "india",
        "launch",
        "limited",
        "listing",
        "listings",
        "mall",
        "new",
        "noida",
        "project",
        "projects",
        "property",
        "realty",
        "residential",
        "sector",
        "sobha",
        "https",
        "http",
        "www",
        "upcoming",
    }
    ordered = []
    for token in tokens:
        if token in stop:
            continue
        if token in builder_tokens:
            continue
        if token not in ordered:
            ordered.append(token)
    return ordered[:8]


def media_matches_project(media_row: dict[str, str], project_row: dict[str, str]) -> bool:
    text = " ".join(
        [
            clean_text(media_row.get("url")),
            clean_text(media_row.get("caption")),
        ]
    ).lower()
    tokens = project_tokens(project_row)
    if not tokens:
        return True
    matched = [token for token in tokens if token_present(text, token)]
    if len(tokens) >= 2:
        return len(matched) >= 2
    return len(matched) >= 1


def media_priority(row: dict[str, str]) -> tuple[int, int, str]:
    url = clean_text(row.get("url")).lower()
    caption = clean_text(row.get("caption")).lower()
    source = clean_text(row.get("source")).lower()
    conf = clean_text(row.get("confidence")).lower()
    text = " ".join([url, caption, source, conf])
    source_rank = 0 if "official_builder" in source else 1 if "google_maps" in source else 2
    conf_rank = 0 if "high" in conf else 1 if "medium" in conf else 2 if "source_page" in conf else 3
    positive = sum(1 for token in PROPERTY_IMAGE_TOKENS if token_present(text, token))
    return (source_rank, conf_rank, -positive, url)


def build_fast_gold_database(
    properties_csv: str | Path,
    media_csv: str | Path,
    output_dir: str | Path,
    target_images: int = 5,
) -> dict[str, Any]:
    properties_csv = Path(properties_csv)
    media_csv = Path(media_csv)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    with properties_csv.open(newline="", encoding="utf-8") as f:
        prop_reader = csv.DictReader(f)
        prop_rows = list(prop_reader)
        prop_fields = list(prop_reader.fieldnames or [])

    media_by_id: dict[str, list[dict[str, str]]] = defaultdict(list)
    with media_csv.open(newline="", encoding="utf-8") as f:
        media_reader = csv.DictReader(f)
        for row in media_reader:
            media_by_id[row["internal_id"]].append(row)

    valid_rows: list[dict[str, str]] = []
    excluded_rows: list[dict[str, str]] = []
    all_media_rows: list[dict[str, str]] = []
    slot_rows: list[dict[str, str]] = []
    builder_pools: dict[str, list[dict[str, str]]] = defaultdict(list)

    indexed = list(enumerate(prop_rows, 1))
    indexed.sort(key=lambda item: (row_is_upcoming(item[1]), item[0]))
    final_by_index: dict[int, dict[str, str]] = {}

    for index, row in indexed:
        listing_ok, reason = row_is_listing(row)
        builder = clean_text(row.get("builder_name")).lower()
        upcoming = row_is_upcoming(row)
        if not listing_ok:
            out = dict(row)
            out["gold_is_valid_property_listing"] = "No"
            out["gold_exclusion_reason"] = reason
            excluded_rows.append(out)
            continue

        candidates = [m for m in media_by_id.get(row["internal_id"], []) if media_is_good(m, row)]
        candidates = sorted(candidates, key=media_priority)
        deduped: list[dict[str, str]] = []
        seen_urls = set()
        for candidate in candidates:
            key = clean_text(candidate.get("url")).split("?", 1)[0]
            if not key or key in seen_urls:
                continue
            seen_urls.add(key)
            deduped.append(candidate)
        selected = deduped[:target_images]
        used_same_builder = False
        if upcoming and len(selected) < target_images and builder:
            for candidate in builder_pools.get(builder, []):
                key = clean_text(candidate.get("url")).split("?", 1)[0]
                if key in seen_urls:
                    continue
                seen_urls.add(key)
                borrowed = dict(candidate)
                borrowed["source"] = "same_builder_verified_reference"
                borrowed["confidence"] = "same_builder_upcoming_reference"
                selected.append(borrowed)
                used_same_builder = True
                if len(selected) >= target_images:
                    break

        out = dict(row)
        out["gold_is_valid_property_listing"] = "Yes"
        out["gold_exclusion_reason"] = ""
        out["gold_is_upcoming_next_6_months"] = "Yes" if upcoming else "No"
        out["gold_all_exact_image_url_count"] = str(len(deduped))
        out["gold_all_exact_image_urls"] = json.dumps([m["url"] for m in deduped], ensure_ascii=False)
        out["gold_has_5_images"] = "Yes" if len(selected) >= target_images else "No"
        out["gold_completed_image_count"] = str(len(selected))
        out["gold_used_google_maps"] = "Yes" if any("google_maps" in m.get("source", "") for m in selected) else "No"
        out["gold_used_same_builder_reference"] = "Yes" if used_same_builder else "No"
        notes = []
        if len(selected) < target_images:
            notes.append(f"Only {len(selected)} clean exact image URLs available.")
        if used_same_builder:
            notes.append("Upcoming listing uses same-builder verified property images.")
        out["gold_review_notes"] = " ".join(notes)
        out["gold_video_urls"] = row.get("video_urls", "")
        out["gold_builder_page_description"] = row.get("description", "")
        for i, media in enumerate(selected, 1):
            out[f"gold_image_{i}_exact_source_url"] = media.get("url", "")
            out[f"gold_image_{i}_source"] = media.get("source", "")
            out[f"gold_image_{i}_match_type"] = media.get("confidence", "")
            slot_rows.append(
                {
                    "internal_id": row["internal_id"],
                    "project_name": row["project_name"],
                    "slot": str(i),
                    "exact_source_url": media.get("url", ""),
                    "source": media.get("source", ""),
                    "match_type": media.get("confidence", ""),
                    "caption": media.get("caption", ""),
                }
            )
        for media in deduped:
            all_media_rows.append(
                {
                    "internal_id": row["internal_id"],
                    "project_name": row["project_name"],
                    "url": media.get("url", ""),
                    "source": media.get("source", ""),
                    "confidence": media.get("confidence", ""),
                    "caption": media.get("caption", ""),
                }
            )
        if builder:
            for media in selected:
                if media.get("source") != "same_builder_verified_reference":
                    builder_pools[builder].append(media)
        final_by_index[index] = out
        valid_rows.append(out)

    final_rows = [final_by_index[i] for i in sorted(final_by_index)]
    extra_fields = [
        "gold_is_valid_property_listing",
        "gold_exclusion_reason",
        "gold_is_upcoming_next_6_months",
        "gold_builder_page_description",
        "gold_video_urls",
        "gold_all_exact_image_url_count",
        "gold_all_exact_image_urls",
        "gold_has_5_images",
        "gold_completed_image_count",
        "gold_used_google_maps",
        "gold_used_same_builder_reference",
        "gold_review_notes",
    ] + [f"gold_image_{i}_exact_source_url" for i in range(1, target_images + 1)] + [f"gold_image_{i}_source" for i in range(1, target_images + 1)] + [f"gold_image_{i}_match_type" for i in range(1, target_images + 1)]
    out_fields = list(dict.fromkeys(prop_fields + extra_fields))

    out_props = output_dir / "gold_builder_properties.csv"
    with out_props.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=out_fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(final_rows)

    out_slots = output_dir / "gold_image_slots.csv"
    slot_fields = ["internal_id", "project_name", "slot", "exact_source_url", "source", "match_type", "caption"]
    with out_slots.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=slot_fields)
        w.writeheader()
        w.writerows(slot_rows)

    out_media = output_dir / "gold_all_exact_image_urls.csv"
    media_fields = ["internal_id", "project_name", "url", "source", "confidence", "caption"]
    with out_media.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=media_fields)
        w.writeheader()
        w.writerows(all_media_rows)

    out_excluded = output_dir / "excluded_non_property_rows.csv"
    excluded_fields = list(dict.fromkeys(prop_fields + ["gold_is_valid_property_listing", "gold_exclusion_reason"]))
    with out_excluded.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=excluded_fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(excluded_rows)

    review_rows = [r for r in final_rows if r.get("gold_has_5_images") != "Yes" or r.get("gold_review_notes")]
    out_review = output_dir / "gold_review_needed.csv"
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
    with out_review.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=review_fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(review_rows)

    sqlite_path = output_dir / "gold_builder_properties.sqlite"
    conn = sqlite3.connect(sqlite_path)
    with conn:
        conn.execute("create table properties (%s)" % ",".join(f'"{c}" text' for c in out_fields))
        conn.executemany(
            "insert into properties values (%s)" % ",".join("?" for _ in out_fields),
            [[str(r.get(c, "")) for c in out_fields] for r in final_rows],
        )
    conn.close()

    summary = {
        "input_property_rows": len(prop_rows),
        "valid_property_rows": len(final_rows),
        "excluded_non_property_rows": len(excluded_rows),
        "rows_with_5_images": sum(1 for r in final_rows if r.get("gold_has_5_images") == "Yes"),
        "rows_using_google_maps": sum(1 for r in final_rows if r.get("gold_used_google_maps") == "Yes"),
        "upcoming_rows": sum(1 for r in final_rows if r.get("gold_is_upcoming_next_6_months") == "Yes"),
        "upcoming_rows_using_same_builder_reference": sum(1 for r in final_rows if r.get("gold_used_same_builder_reference") == "Yes"),
        "all_exact_image_url_rows": len(all_media_rows),
        "properties_csv": str(out_props.resolve()),
        "image_slots_csv": str(out_slots.resolve()),
        "all_exact_image_urls_csv": str(out_media.resolve()),
        "excluded_non_property_rows_csv": str(out_excluded.resolve()),
        "review_needed_csv": str(out_review.resolve()),
        "sqlite": str(sqlite_path.resolve()),
        "notes": [
            "Built from existing exact-review exports, not by re-scraping the web.",
            "Icons, logos, social buttons, and obvious event/restaurant/article rows are filtered out.",
            "Google Maps photos are kept only when they already exist in the exact-review media export.",
            "Same-builder verified references are used only for upcoming listings.",
        ],
    }
    summary_path = output_dir / "gold_summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    zip_path = output_dir.parent / f"{output_dir.name}.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for p in output_dir.rglob("*"):
            if p.is_file():
                z.write(p, p.relative_to(output_dir.parent))
    summary["zip_path"] = str(zip_path.resolve())
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    return summary
