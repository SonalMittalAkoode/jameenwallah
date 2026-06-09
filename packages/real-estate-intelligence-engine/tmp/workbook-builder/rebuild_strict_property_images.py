from __future__ import annotations

import csv
import json
import sqlite3
import sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlparse

csv.field_size_limit(sys.maxsize)

ROOT = Path("/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-06/jameenwallah-pr-real/packages/real-estate-intelligence-engine")
BASE = ROOT / "data/professional-openable-builder-db"
FAST = ROOT / "data/fast-gold-builder-current-upcoming-db"

CURATED = BASE / "properties_curated.csv"
READY = BASE / "production_ready_properties.csv"
MANUAL = BASE / "manual_image_sourcing_needed.csv"
SLOTS = BASE / "image_slots_openable.csv"
SQLITE = BASE / "professional_builder_db.sqlite"

BAD_PARTS = (
    "logo", "favicon", "icon", "sprite", "close", "dummy", "placeholder", "loader",
    "event", "events", "expo", "webinar", "award", "certificate", "press", "news",
    "blog", "article", "media-center", "csr", "campaign", "channel", "partner",
    "brochure", "floor-plan", "floorplan", "floor_plan", "master-plan", "master_plan",
    "unit-plan", "unit_plan", "typical-unit", "typical_unit", "layout", "layouts",
    "payment-plan", "site-plan", "qr", "barcode", "analytics", "tracking", "pixelid",
    "eventtracking", "clmbtech", "youtube", "ytimg", "quora", "facebook", "instagram",
    "linkedin", "twitter", "app-store", "play-store", "banner-ad",
    "awfis", "bayer", "bnp-paribhas", "bnp-paribas", "crisil", "huhtamaki",
    "icicibank", "icici-bank", "idfc", "kelloggs", "skechers", "tcs.png",
    "wework", "wns.png",
    "black_search", "loading.gif", "bed.png", "radius.png", "menu-widget",
    "call.png", "enquire.png", "copy.png", "home-button", "home.png",
    "insta.png", "language.png", "greatplacetowork", "map-pin",
    "dlf-mall", "igi-airport", "india-gate", "airport-", "attitude-of-a",
    "search.png", "map1.png", "print.png", "site_plan", "projectsiteplans",
    "3-bhk", "3.5-bhk", "4-bhk", "2-bhk",
)

SOFT_BAD_PARTS = (
    "amenities", "amenity", "club", "pool", "gym", "spa", "kids", "badminton",
    "cricket", "jogging", "lawn", "terrace", "kitchen", "bedroom", "bathroom",
    "living-room", "interior", "sample-flat", "show-flat", "model-apartment",
)

GOOD_PARTS = (
    "elevation", "exterior", "outdoor", "facade", "façade", "tower", "towers",
    "building", "buildings", "aerial", "bird", "view", "front", "entrance",
    "gate", "street", "road", "skyline", "render", "rendering", "project-image",
    "property-image", "property-images", "gallery", "carousel-images/outdoor",
    "commercial", "residential", "high-street", "arcade", "galleria", "mall",
)


def low_text(*parts: str) -> str:
    return " ".join(part or "" for part in parts).lower()


def is_maps(url: str) -> bool:
    return "maps.googleapis.com/maps/api/place/photo" in (url or "").lower()


def is_hard_bad(url: str, caption: str = "") -> bool:
    text = low_text(url, caption)
    if not text.strip():
        return True
    if text.startswith("data:"):
        return True
    parsed = urlparse(url or "")
    host = parsed.netloc.lower()
    path = (parsed.path or "").lower()
    if host == "www.houseofhiranandani.com" and path.endswith(".png"):
        return True
    if host == "www.omaxe.com" and ("/projectfeature/" in path or "/projectcpecification/" in path):
        return True
    if "d1di04ifehjy6m.cloudfront.net" in host and "/static/brigade/images/" in path:
        return True
    if "cms.bptp.com" in host and "site_plan" in path:
        return True
    if "sumadhuragroup.com" in host and (
        path.endswith("/copy.png")
        or path.endswith("/home.png")
        or path.endswith("/home-button.png")
        or path.endswith("/insta.png")
        or path.endswith("/language.png")
        or path.endswith("/map1.png")
        or path.endswith("/print.png")
        or path.endswith("/capitol-towers.png")
        or "/horizon/" in path
        or "/olympus/" in path
        or "greatplacetowork" in path
    ):
        return True
    if "raheja.com" in host and (path.endswith("/call.png") or path.endswith("/enquire.png")):
        return True
    if "cdn.maxestates.in" in host and any(part in path for part in ("map-pin", "dlf-mall", "igi-airport", "india-gate", "attitude-of-a")):
        return True
    if "smartworlddevelopers.com" in host and path.endswith("/radius.png"):
        return True
    if "taboola.com" in host:
        return True
    return any(part in text for part in BAD_PARTS)


def is_soft_bad(url: str, caption: str = "") -> bool:
    text = low_text(url, caption)
    return any(part in text for part in SOFT_BAD_PARTS)


def is_good_property_candidate(url: str, caption: str = "") -> bool:
    if is_hard_bad(url, caption):
        return False
    if is_maps(url):
        return True
    text = low_text(url, caption)
    return any(part in text for part in GOOD_PARTS) and not is_soft_bad(url, caption)


def score_candidate(item: dict[str, str]) -> int:
    url = item.get("url", "")
    caption = item.get("caption", "")
    if is_hard_bad(url, caption):
        return -1000
    score = 0
    text = low_text(url, caption, item.get("source", ""), item.get("confidence", ""))
    if is_maps(url):
        score += 70
    if "official_builder" in text:
        score += 80
    if any(part in text for part in GOOD_PARTS):
        score += 50
    if "outdoor" in text or "exterior" in text or "elevation" in text or "facade" in text:
        score += 35
    if is_soft_bad(url, caption):
        score -= 80
    return score


def dedupe(items: list[dict[str, str]]) -> list[dict[str, str]]:
    seen = set()
    out = []
    for item in items:
        url = item.get("url", "").strip()
        if not url or url in seen:
            continue
        seen.add(url)
        out.append(item)
    return out


def read_dicts(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        return list(reader.fieldnames or []), list(reader)


def write_dicts(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def load_exact_media() -> dict[str, list[dict[str, str]]]:
    media: dict[str, list[dict[str, str]]] = defaultdict(list)
    path = FAST / "gold_all_exact_image_urls.csv"
    if not path.exists():
        return media
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            pid = row.get("internal_id", "")
            url = row.get("url", "").strip()
            if not pid or not url:
                continue
            media[pid].append({
                "url": url,
                "source": row.get("source", "") or "official_or_maps_candidate",
                "confidence": row.get("confidence", ""),
                "caption": row.get("caption", ""),
            })
    return media


def current_row_media(row: dict[str, str]) -> list[dict[str, str]]:
    items = []
    for i in range(1, 6):
        url = row.get(f"final_image_{i}_url", "").strip()
        if url:
            items.append({
                "url": url,
                "source": row.get(f"final_image_{i}_source", "") or "existing_curated",
                "confidence": "existing_curated",
                "caption": "",
            })
    return items


def select_images(
    row: dict[str, str],
    exact_media: dict[str, list[dict[str, str]]],
    builder_pool: dict[str, list[dict[str, str]]],
    target: int = 5,
) -> tuple[list[dict[str, str]], int]:
    pid = row["property_id"]
    builder = row.get("builder_name", "")

    exact = dedupe(exact_media.get(pid, []) + current_row_media(row))
    exact_good = [item for item in exact if is_good_property_candidate(item.get("url", ""), item.get("caption", ""))]
    exact_good.sort(key=score_candidate, reverse=True)

    selected: list[dict[str, str]] = []
    removed = 0
    for item in exact:
        if is_hard_bad(item.get("url", ""), item.get("caption", "")) or is_soft_bad(item.get("url", ""), item.get("caption", "")):
            removed += 1
    for item in exact_good:
        if len(selected) >= target:
            break
        selected.append({**item, "source": item.get("source", "") or "strict_exact_property_image"})

    selected_urls = {item["url"] for item in selected}
    if len(selected) < target:
        for item in builder_pool.get(builder, []):
            if len(selected) >= target:
                break
            if item["url"] in selected_urls:
                continue
            selected.append({**item, "source": "same_builder_strict_property_reference"})
            selected_urls.add(item["url"])

    return selected[:target], removed


def rebuild() -> None:
    fields, rows = read_dicts(CURATED)
    exact_media = load_exact_media()

    builder_pool: dict[str, list[dict[str, str]]] = defaultdict(list)
    seen_by_builder: dict[str, set[str]] = defaultdict(set)
    for row in rows:
        builder = row.get("builder_name", "")
        candidates = dedupe(exact_media.get(row["property_id"], []) + current_row_media(row))
        strict = [item for item in candidates if is_good_property_candidate(item.get("url", ""), item.get("caption", ""))]
        strict.sort(key=score_candidate, reverse=True)
        for item in strict:
            url = item["url"]
            if url in seen_by_builder[builder]:
                continue
            seen_by_builder[builder].add(url)
            builder_pool[builder].append({**item, "source": "same_builder_strict_property_reference"})

    total_removed = 0
    manual_rows = []
    ready_rows = []
    for row in rows:
        selected, removed = select_images(row, exact_media, builder_pool)
        total_removed += removed
        for i in range(1, 6):
            if i <= len(selected):
                row[f"final_image_{i}_url"] = selected[i - 1]["url"]
                row[f"final_image_{i}_source"] = selected[i - 1].get("source", "strict_property_image")
            else:
                row[f"final_image_{i}_url"] = ""
                row[f"final_image_{i}_source"] = ""
        has_5 = all(row.get(f"final_image_{i}_url", "").strip() for i in range(1, 6))
        row["gold_has_5_images"] = "yes" if has_5 else "no"
        row["guaranteed_has_5_images"] = "yes" if has_5 else "no"
        if any(row.get(f"final_image_{i}_source") == "same_builder_strict_property_reference" for i in range(1, 6)):
            row["guaranteed_used_same_builder_reference"] = "yes"
        if has_5:
            row["guaranteed_review_notes"] = row.get("guaranteed_review_notes", "") or "Strict image cleanup passed"
            ready_rows.append(row)
        else:
            row["guaranteed_review_notes"] = "Needs manual image sourcing after strict event/logo/floorplan/blog cleanup."
            manual_rows.append(row)

    write_dicts(CURATED, fields, rows)
    write_dicts(READY, fields, ready_rows)
    write_dicts(MANUAL, fields, manual_rows)

    slot_fields = ["internal_id", "project_name", "slot", "url", "source", "match_type"]
    slot_rows = []
    for row in rows:
        needs_review = row in manual_rows or row.get("guaranteed_used_same_builder_reference") == "yes"
        for i in range(1, 6):
            slot_rows.append({
                "internal_id": row["property_id"],
                "project_name": row.get("project_name", ""),
                "slot": str(i),
                "url": row.get(f"final_image_{i}_url", "").strip(),
                "source": row.get(f"final_image_{i}_source", "").strip() or "missing",
                "match_type": "primary" if i == 1 else ("review" if needs_review else "strict_verified"),
            })
    write_dicts(SLOTS, slot_fields, slot_rows)

    conn = sqlite3.connect(SQLITE)
    conn.execute("DELETE FROM properties_curated")
    conn.execute("DELETE FROM image_slots")
    cols = ",".join([f'"{field}"' for field in fields])
    placeholders = ",".join(["?"] * len(fields))
    conn.executemany(
        f"INSERT INTO properties_curated ({cols}) VALUES ({placeholders})",
        [[row.get(field, "") for field in fields] for row in rows],
    )
    conn.execute("DROP TABLE IF EXISTS production_ready_properties")
    conn.execute("CREATE TABLE production_ready_properties AS SELECT * FROM properties_curated WHERE 0")
    conn.executemany(
        f"INSERT INTO production_ready_properties ({cols}) VALUES ({placeholders})",
        [[row.get(field, "") for field in fields] for row in ready_rows],
    )
    conn.executemany(
        "INSERT INTO image_slots (internal_id, project_name, slot, url, source, match_type) VALUES (?, ?, ?, ?, ?, ?)",
        [[row[field] for field in slot_fields] for row in slot_rows],
    )
    conn.commit()
    conn.close()

    summary_path = BASE / "summary.json"
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    summary["rows_curated"] = len(rows)
    summary["rows_image_slots"] = len(slot_rows)
    summary["rows_production_ready_with_5_clean_images"] = len(ready_rows)
    summary["rows_manual_image_sourcing_needed"] = len(manual_rows)
    summary["rows_with_5_clean_images"] = len(ready_rows)
    summary["rows_missing_5_clean_images"] = len(manual_rows)
    summary["strict_media_cleanup_removed_or_demoted_candidates"] = total_removed
    summary["strict_media_cleanup_rules"] = [
        "Removed/demoted URL/caption matches for logo, icon, event, award, blog, news, video thumbnail, floor plan, layout, brochure, tracking, placeholder, social assets.",
        "Selected official exterior/building/project/gallery images first, Google Maps place photos next, same-builder property references only when needed.",
    ]
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"strict_removed_or_demoted_candidates={total_removed}")
    print(f"production_ready_rows={len(ready_rows)}")
    print(f"manual_image_sourcing_rows={len(manual_rows)}")


if __name__ == "__main__":
    rebuild()
