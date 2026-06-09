from __future__ import annotations

import csv
import json
import sqlite3
from pathlib import Path

BASE = Path("/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-06/jameenwallah-pr-real/packages/real-estate-intelligence-engine/data/professional-openable-builder-db")
CURATED = BASE / "properties_curated.csv"
SLOTS = BASE / "image_slots_openable.csv"
SQLITE = BASE / "professional_builder_db.sqlite"

BAD_URL_PARTS = [
    "close.png",
    "dummy.png",
    "eventtracking",
    "pixelid=",
    "clmbtech.com",
    "/logo",
    "favicon",
    "sprite",
    "loader",
    "placeholder",
    "blank.gif",
    "1x1",
    "analytics",
    "tracking",
]


def is_bad_url(url: str) -> bool:
    low = (url or "").lower()
    if not low.strip():
        return True
    return any(part in low for part in BAD_URL_PARTS)


def read_rows(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        return list(reader.fieldnames or []), list(reader)


def write_rows(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    fields, rows = read_rows(CURATED)
    removed = 0

    # First pass: remove icons/tracking/non-property assets and build same-builder clean pools.
    builder_pool: dict[str, list[tuple[str, str]]] = {}
    for row in rows:
        builder = row.get("builder_name", "")
        clean_images: list[tuple[str, str]] = []
        for i in range(1, 6):
            url_key = f"final_image_{i}_url"
            source_key = f"final_image_{i}_source"
            url = row.get(url_key, "").strip()
            source = row.get(source_key, "").strip()
            if is_bad_url(url):
                if url:
                    removed += 1
                continue
            clean_images.append((url, source or "verified_property_image"))
            builder_pool.setdefault(builder, [])
            if url not in [existing for existing, _ in builder_pool[builder]]:
                builder_pool[builder].append((url, source or "same_builder_verified_reference"))

        for i in range(1, 6):
            row[f"final_image_{i}_url"] = clean_images[i - 1][0] if i <= len(clean_images) else ""
            row[f"final_image_{i}_source"] = clean_images[i - 1][1] if i <= len(clean_images) else ""

    # Second pass: fill gaps using clean same-builder references only, and flag them.
    rows_with_gap = 0
    for row in rows:
        builder = row.get("builder_name", "")
        existing = [row.get(f"final_image_{i}_url", "").strip() for i in range(1, 6)]
        existing_set = {url for url in existing if url}
        notes = row.get("guaranteed_review_notes", "").strip()
        pool = builder_pool.get(builder, [])
        for i in range(1, 6):
            if row.get(f"final_image_{i}_url", "").strip():
                continue
            for url, source in pool:
                if url not in existing_set and not is_bad_url(url):
                    row[f"final_image_{i}_url"] = url
                    row[f"final_image_{i}_source"] = "same_builder_clean_reference"
                    existing_set.add(url)
                    break
        has_5 = all(row.get(f"final_image_{i}_url", "").strip() for i in range(1, 6))
        row["guaranteed_has_5_images"] = "yes" if has_5 else "no"
        row["gold_has_5_images"] = "yes" if has_5 else row.get("gold_has_5_images", "no")
        if not has_5:
            rows_with_gap += 1
            extra = "Needs manual image sourcing; fewer than 5 clean property images were available from official/Maps/same-builder sources."
            row["guaranteed_review_notes"] = f"{notes}; {extra}".strip("; ")
        elif not notes:
            row["guaranteed_review_notes"] = "No manual review flag"

    write_rows(CURATED, fields, rows)

    slot_fields = ["internal_id", "project_name", "slot", "url", "source", "match_type"]
    slot_rows = []
    for row in rows:
        review_note = row.get("guaranteed_review_notes", "")
        needs_review = "yes" if "Needs manual" in review_note or row.get("guaranteed_used_same_builder_reference") == "yes" else "no"
        for i in range(1, 6):
            slot_rows.append({
                "internal_id": row["property_id"],
                "project_name": row.get("project_name", ""),
                "slot": str(i),
                "url": row.get(f"final_image_{i}_url", "").strip(),
                "source": row.get(f"final_image_{i}_source", "").strip() or "missing",
                "match_type": "primary" if i == 1 else ("review" if needs_review == "yes" else "verified"),
            })
    write_rows(SLOTS, slot_fields, slot_rows)

    conn = sqlite3.connect(SQLITE)
    conn.execute("DELETE FROM properties_curated")
    conn.execute("DELETE FROM image_slots")
    conn.executemany(
        f"INSERT INTO properties_curated ({','.join(fields)}) VALUES ({','.join(['?'] * len(fields))})",
        [[row.get(field, "") for field in fields] for row in rows],
    )
    conn.executemany(
        "INSERT INTO image_slots (internal_id, project_name, slot, url, source, match_type) VALUES (?, ?, ?, ?, ?, ?)",
        [[row[field] for field in slot_fields] for row in slot_rows],
    )
    conn.commit()
    conn.close()

    summary_path = BASE / "summary.json"
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    summary["rows_with_5_clean_images"] = sum(
        1 for row in rows if all(row.get(f"final_image_{i}_url", "").strip() for i in range(1, 6))
    )
    summary["rows_missing_5_clean_images"] = rows_with_gap
    summary["non_property_media_urls_removed_in_final_pass"] = removed
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"removed_bad_urls={removed}")
    print(f"rows_missing_5_clean_images={rows_with_gap}")
    print(f"rows_with_5_clean_images={summary['rows_with_5_clean_images']}")


if __name__ == "__main__":
    main()
