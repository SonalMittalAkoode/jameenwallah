#!/usr/bin/env python3
import csv
import json
import sys
import time
import zipfile
from collections import defaultdict
from copy import deepcopy
from pathlib import Path

sys.path.insert(0, "/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-18/scrape-this-website-logo-call-91/.pydeps")
from bson import json_util  # noqa: E402


REPO = Path("/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-06/jameenwallah-pr-real")
EXPORT_ROOT = REPO / "database-exports"
SOURCE_EXPORT = EXPORT_ROOT / "jameenwallah-verified-clean-export-2026-05-22T10-08-34"
OUTPUT_EXPORT = EXPORT_ROOT / f"jameenwallah-verified-clean-5-image-export-{time.strftime('%Y-%m-%dT%H-%M-%S', time.gmtime())}"


def clean(value):
    return " ".join(str(value or "").split()).strip()


def prop_images(prop):
    return [clean(url) for url in (prop.get("media", {}).get("images") or []) if clean(url)]


def dedupe(urls):
    seen = set()
    out = []
    for url in urls:
        if url and url not in seen:
            seen.add(url)
            out.append(url)
    return out


def keys_for(prop):
    external = prop.get("externalSource", {})
    location = prop.get("location", {})
    return {
        "place_id": clean(external.get("googleMapsPlaceId")).lower(),
        "place_name": clean(external.get("googleMapsPlaceName")).lower(),
        "address": clean(location.get("address")).lower(),
        "nearby": clean(location.get("nearBy")).lower(),
    }


def zip_dir(root):
    zip_path = root.with_suffix(".zip")
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in root.rglob("*"):
            archive.write(path, path.relative_to(root.parent))
    return zip_path


source_manifest = json.loads((SOURCE_EXPORT / "manifest.json").read_text(encoding="utf-8"))
source_collections = SOURCE_EXPORT / "collections"
output_collections = OUTPUT_EXPORT / "collections"
output_collections.mkdir(parents=True, exist_ok=True)

props = json_util.loads((source_collections / "properties.json").read_text(encoding="utf-8"))

pools = {
    "same_google_place_id": defaultdict(list),
    "same_google_place_name": defaultdict(list),
    "same_exact_address": defaultdict(list),
}

for prop in props:
    images = prop_images(prop)
    keys = keys_for(prop)
    if keys["place_id"]:
        pools["same_google_place_id"][keys["place_id"]].extend(images)
    if keys["place_name"]:
        pools["same_google_place_name"][keys["place_name"]].extend(images)
    if keys["address"]:
        pools["same_exact_address"][keys["address"]].extend(images)

for pool_name in pools:
    for key, urls in list(pools[pool_name].items()):
        pools[pool_name][key] = dedupe(urls)

filled_reports = []
replacement_needed = []
updated_props = []

for prop in props:
    next_prop = deepcopy(prop)
    original = prop_images(next_prop)
    images = dedupe(original)
    strategy = []
    keys = keys_for(next_prop)

    for strategy_name, key_name in [
        ("same_google_place_id", "place_id"),
        ("same_google_place_name", "place_name"),
        ("same_exact_address", "address"),
    ]:
        key = keys[key_name]
        if not key or len(images) >= 5:
            continue
        before = len(images)
        images = dedupe(images + pools[strategy_name].get(key, []))
        if len(images) > before:
            strategy.append(strategy_name)

    next_prop.setdefault("media", {})["images"] = images[:5]
    if strategy:
        next_prop.setdefault("externalSource", {})["verifiedImageFillStrategy"] = "+".join(strategy)
        next_prop.setdefault("externalSource", {})["verifiedImageCount"] = len(next_prop["media"]["images"])
        filled_reports.append(
            {
                "_id": str(next_prop.get("_id")),
                "customId": next_prop.get("details", {}).get("customId", ""),
                "slug": next_prop.get("description", {}).get("slug", ""),
                "title": next_prop.get("description", {}).get("title", ""),
                "beforeCount": len(original),
                "afterCount": len(next_prop["media"]["images"]),
                "fillStrategy": "+".join(strategy),
            }
        )

    if len(next_prop["media"]["images"]) < 5:
        replacement_needed.append(
            {
                "_id": str(next_prop.get("_id")),
                "customId": next_prop.get("details", {}).get("customId", ""),
                "slug": next_prop.get("description", {}).get("slug", ""),
                "title": next_prop.get("description", {}).get("title", ""),
                "safeImageCount": len(next_prop["media"]["images"]),
                "googleMapsPlaceId": next_prop.get("externalSource", {}).get("googleMapsPlaceId", ""),
                "googleMapsPlaceName": next_prop.get("externalSource", {}).get("googleMapsPlaceName", ""),
                "address": next_prop.get("location", {}).get("address", ""),
                "nearBy": next_prop.get("location", {}).get("nearBy", ""),
                "reason": "needs new verified property/building replacement images; not filled from broad nearby pools",
            }
        )

    updated_props.append(next_prop)

for source_file in source_collections.glob("*.json"):
    if source_file.name == "properties.json":
        continue
    (output_collections / source_file.name).write_text(source_file.read_text(encoding="utf-8"), encoding="utf-8")

(output_collections / "properties.json").write_text(json_util.dumps(updated_props, indent=2), encoding="utf-8")

with (OUTPUT_EXPORT / "verified_image_fill_report.csv").open("w", newline="", encoding="utf-8") as handle:
    fields = ["_id", "customId", "slug", "title", "beforeCount", "afterCount", "fillStrategy"]
    writer = csv.DictWriter(handle, fieldnames=fields)
    writer.writeheader()
    writer.writerows(filled_reports)

with (OUTPUT_EXPORT / "replacement_images_needed.csv").open("w", newline="", encoding="utf-8") as handle:
    fields = [
        "_id",
        "customId",
        "slug",
        "title",
        "safeImageCount",
        "googleMapsPlaceId",
        "googleMapsPlaceName",
        "address",
        "nearBy",
        "reason",
    ]
    writer = csv.DictWriter(handle, fieldnames=fields)
    writer.writeheader()
    writer.writerows(replacement_needed)

identity_changes = []
source_by_id = {str(prop.get("_id")): prop for prop in props}
for prop in updated_props:
    before = source_by_id[str(prop.get("_id"))]
    for label, before_value, after_value in [
        ("_id", str(before.get("_id")), str(prop.get("_id"))),
        ("customId", before.get("details", {}).get("customId"), prop.get("details", {}).get("customId")),
        ("slug", before.get("description", {}).get("slug"), prop.get("description", {}).get("slug")),
        ("createdAt", str(before.get("createdAt")), str(prop.get("createdAt"))),
    ]:
        if before_value != after_value:
            identity_changes.append({"_id": str(prop.get("_id")), "field": label, "before": before_value, "after": after_value})

counts = defaultdict(int)
for prop in updated_props:
    counts[str(len(prop_images(prop)))] += 1

manifest = {
    **source_manifest,
    "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "mode": "read_only_export_no_database_writes_verified_image_fill",
    "sourceCleanExport": str(SOURCE_EXPORT),
    "propertiesScanned": len(updated_props),
    "propertiesFilledToFiveFromExactPlacePools": sum(1 for row in filled_reports if int(row["afterCount"]) >= 5 and int(row["beforeCount"]) < 5),
    "propertiesStillNeedingReplacementImages": len(replacement_needed),
    "imageCountDistributionAfterExactFill": dict(sorted(counts.items(), key=lambda item: int(item[0]))),
    "identityChangesAfterFill": identity_changes,
}

(OUTPUT_EXPORT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
(OUTPUT_EXPORT / "README.md").write_text(
    "# JameenWallah Verified Clean 5-Image Export\n\n"
    "This export was generated without writing to MongoDB.\n\n"
    "Images are filled only from already-verified safe images belonging to the same Google Place ID, same Google place name, or same exact address. "
    "Listings that still have fewer than five safe images are listed in `replacement_images_needed.csv` instead of being filled from broad/unrelated pools.\n",
    encoding="utf-8",
)

zip_path = zip_dir(OUTPUT_EXPORT)

print(
    json.dumps(
        {
            "outputDir": str(OUTPUT_EXPORT),
            "zipPath": str(zip_path),
            "propertiesScanned": len(updated_props),
            "propertiesFilledToFiveFromExactPlacePools": manifest["propertiesFilledToFiveFromExactPlacePools"],
            "propertiesStillNeedingReplacementImages": len(replacement_needed),
            "imageCountDistributionAfterExactFill": manifest["imageCountDistributionAfterExactFill"],
            "identityChangesAfterFill": len(identity_changes),
        },
        indent=2,
    )
)

if identity_changes:
    raise SystemExit(1)
