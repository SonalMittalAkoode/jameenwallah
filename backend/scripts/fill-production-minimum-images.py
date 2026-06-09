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
SOURCE_EXPORT = EXPORT_ROOT / "jameenwallah-verified-clean-5-image-export-2026-05-22T10-13-45"
OUTPUT_EXPORT = EXPORT_ROOT / f"jameenwallah-production-no-zero-image-export-{time.strftime('%Y-%m-%dT%H-%M-%S', time.gmtime())}"


def clean(value):
    return " ".join(str(value or "").split()).strip()


def lower(value):
    return clean(value).lower()


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
    description = prop.get("description", {})
    details = prop.get("details", {})
    return {
        "place_id": lower(external.get("googleMapsPlaceId")),
        "place_name": lower(external.get("googleMapsPlaceName")),
        "address": lower(location.get("address")),
        "nearby": lower(location.get("nearBy")),
        "city": lower(location.get("city")),
        "property_type": lower(description.get("propertyType")),
        "category": lower(description.get("category")),
        "builder": lower(description.get("builder")),
        "bhk": lower(details.get("bhk")),
    }


def zip_dir(root):
    zip_path = root.with_suffix(".zip")
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in root.rglob("*"):
            archive.write(path, path.relative_to(root.parent))
    return zip_path


def add(pool, key, images):
    if key:
        pool[key].extend(images)


source_manifest = json.loads((SOURCE_EXPORT / "manifest.json").read_text(encoding="utf-8"))
source_collections = SOURCE_EXPORT / "collections"
output_collections = OUTPUT_EXPORT / "collections"
output_collections.mkdir(parents=True, exist_ok=True)

props = json_util.loads((source_collections / "properties.json").read_text(encoding="utf-8"))

pools = {
    "same_google_place_id": defaultdict(list),
    "same_google_place_name": defaultdict(list),
    "same_exact_address": defaultdict(list),
    "same_nearby": defaultdict(list),
    "same_builder": defaultdict(list),
    "same_property_type": defaultdict(list),
    "same_category": defaultdict(list),
    "same_city_property_type": defaultdict(list),
    "same_city_category": defaultdict(list),
    "global_verified": defaultdict(list),
}

for prop in props:
    images = prop_images(prop)
    if not images:
        continue
    keys = keys_for(prop)
    add(pools["same_google_place_id"], keys["place_id"], images)
    add(pools["same_google_place_name"], keys["place_name"], images)
    add(pools["same_exact_address"], keys["address"], images)
    add(pools["same_nearby"], keys["nearby"], images)
    add(pools["same_builder"], keys["builder"], images)
    add(pools["same_property_type"], keys["property_type"], images)
    add(pools["same_category"], keys["category"], images)
    add(pools["same_city_property_type"], f"{keys['city']}|{keys['property_type']}", images)
    add(pools["same_city_category"], f"{keys['city']}|{keys['category']}", images)
    add(pools["global_verified"], "all", images)

for name, pool in pools.items():
    for key, images in list(pool.items()):
        pool[key] = dedupe(images)

updated_props = []
fallback_report = []
still_zero = []

fallback_order = [
    ("same_google_place_id", "place_id"),
    ("same_google_place_name", "place_name"),
    ("same_exact_address", "address"),
    ("same_nearby", "nearby"),
    ("same_builder", "builder"),
    ("same_city_property_type", "city_property_type"),
    ("same_city_category", "city_category"),
    ("same_property_type", "property_type"),
    ("same_category", "category"),
    ("global_verified", "global"),
]

for prop in props:
    next_prop = deepcopy(prop)
    images = prop_images(next_prop)
    keys = keys_for(next_prop)
    strategy = ""
    borrowed = ""

    if not images:
        for pool_name, key_name in fallback_order:
            if key_name == "city_property_type":
                key = f"{keys['city']}|{keys['property_type']}"
            elif key_name == "city_category":
                key = f"{keys['city']}|{keys['category']}"
            elif key_name == "global":
                key = "all"
            else:
                key = keys[key_name]
            candidates = pools[pool_name].get(key, [])
            if candidates:
                borrowed = candidates[0]
                images = [borrowed]
                strategy = pool_name
                break

    next_prop.setdefault("media", {})["images"] = dedupe(images)
    if strategy:
        next_prop.setdefault("externalSource", {})["productionImageFallbackStrategy"] = strategy
        next_prop.setdefault("externalSource", {})["productionImageFallbackNote"] = (
            "No verified property-specific gallery image remained after people/third-party cleanup; "
            "this image was borrowed from the closest verified safe property/project image pool."
        )
        fallback_report.append(
            {
                "_id": str(next_prop.get("_id")),
                "customId": next_prop.get("details", {}).get("customId", ""),
                "slug": next_prop.get("description", {}).get("slug", ""),
                "title": next_prop.get("description", {}).get("title", ""),
                "safeImageCountBefore": 0,
                "safeImageCountAfter": len(next_prop["media"]["images"]),
                "fallbackStrategy": strategy,
                "borrowedImageUrl": borrowed,
            }
        )

    if not next_prop["media"]["images"]:
        still_zero.append(
            {
                "_id": str(next_prop.get("_id")),
                "customId": next_prop.get("details", {}).get("customId", ""),
                "slug": next_prop.get("description", {}).get("slug", ""),
                "title": next_prop.get("description", {}).get("title", ""),
            }
        )

    updated_props.append(next_prop)

for source_file in source_collections.glob("*.json"):
    if source_file.name == "properties.json":
        continue
    (output_collections / source_file.name).write_text(source_file.read_text(encoding="utf-8"), encoding="utf-8")

(output_collections / "properties.json").write_text(json_util.dumps(updated_props, indent=2), encoding="utf-8")

with (OUTPUT_EXPORT / "zero_image_fallback_fill_report.csv").open("w", newline="", encoding="utf-8") as handle:
    fields = [
        "_id",
        "customId",
        "slug",
        "title",
        "safeImageCountBefore",
        "safeImageCountAfter",
        "fallbackStrategy",
        "borrowedImageUrl",
    ]
    writer = csv.DictWriter(handle, fieldnames=fields)
    writer.writeheader()
    writer.writerows(fallback_report)

with (OUTPUT_EXPORT / "replacement_images_still_recommended.csv").open("w", newline="", encoding="utf-8") as handle:
    fields = ["_id", "customId", "slug", "title", "safeImageCount", "recommendation"]
    writer = csv.DictWriter(handle, fieldnames=fields)
    writer.writeheader()
    for prop in updated_props:
        count = len(prop_images(prop))
        if count < 5:
            writer.writerow(
                {
                    "_id": str(prop.get("_id")),
                    "customId": prop.get("details", {}).get("customId", ""),
                    "slug": prop.get("description", {}).get("slug", ""),
                    "title": prop.get("description", {}).get("title", ""),
                    "safeImageCount": count,
                    "recommendation": "Add more verified project/property images before final launch if a 5-image gallery is mandatory.",
                }
            )

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

distribution = defaultdict(int)
for prop in updated_props:
    distribution[str(len(prop_images(prop)))] += 1

manifest = {
    **source_manifest,
    "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "mode": "read_only_export_no_database_writes_production_no_zero_images",
    "sourceExport": str(SOURCE_EXPORT),
    "propertiesScanned": len(updated_props),
    "zeroImagePropertiesFilled": len(fallback_report),
    "propertiesStillWithZeroImages": len(still_zero),
    "propertiesStillUnderFiveImages": sum(1 for prop in updated_props if len(prop_images(prop)) < 5),
    "imageCountDistribution": dict(sorted(distribution.items(), key=lambda item: int(item[0]))),
    "identityChangesAfterProductionFill": identity_changes,
}

(OUTPUT_EXPORT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
(OUTPUT_EXPORT / "README.md").write_text(
    "# JameenWallah Production No-Zero-Image Export\n\n"
    "This export was generated without writing to MongoDB.\n\n"
    "Every property has at least one verified safe image. Properties that had zero images after strict people/third-party cleanup were filled from the closest available verified image pool and recorded in `zero_image_fallback_fill_report.csv`.\n",
    encoding="utf-8",
)

zip_path = zip_dir(OUTPUT_EXPORT)

print(
    json.dumps(
        {
            "outputDir": str(OUTPUT_EXPORT),
            "zipPath": str(zip_path),
            "propertiesScanned": len(updated_props),
            "zeroImagePropertiesFilled": len(fallback_report),
            "propertiesStillWithZeroImages": len(still_zero),
            "propertiesStillUnderFiveImages": manifest["propertiesStillUnderFiveImages"],
            "imageCountDistribution": manifest["imageCountDistribution"],
            "identityChangesAfterProductionFill": len(identity_changes),
        },
        indent=2,
    )
)

if identity_changes or still_zero:
    raise SystemExit(1)
