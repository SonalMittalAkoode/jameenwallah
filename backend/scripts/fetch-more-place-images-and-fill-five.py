#!/usr/bin/env python3
import csv
import importlib.util
import json
import os
import sys
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import defaultdict
from copy import deepcopy
from pathlib import Path

import requests

sys.path.insert(0, "/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-18/scrape-this-website-logo-call-91/.pydeps")
from bson import json_util  # noqa: E402


REPO = Path("/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-06/jameenwallah-pr-real")
EXPORT_ROOT = REPO / "database-exports"
SOURCE_EXPORT = EXPORT_ROOT / "jameenwallah-production-no-zero-image-export-2026-05-22T10-16-26"
OUTPUT_EXPORT = EXPORT_ROOT / f"jameenwallah-production-five-real-images-export-{time.strftime('%Y-%m-%dT%H-%M-%S', time.gmtime())}"
VERIFY_CACHE = EXPORT_ROOT / "_image-verify-cache" / "verification-cache.json"
PLACES_CACHE = EXPORT_ROOT / "_image-verify-cache" / "places-extra-photo-cache.json"
VERIFY_SCRIPT = REPO / "backend/scripts/build-verified-clean-property-export.py"


def load_verify_module():
    spec = importlib.util.spec_from_file_location("jw_verify", VERIFY_SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


verify = load_verify_module()


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
        "place_id": clean(external.get("googleMapsPlaceId")),
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


def place_details(place_id, api_key):
    response = requests.get(
        f"https://places.googleapis.com/v1/places/{place_id}",
        headers={
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "id,displayName,formattedAddress,photos",
        },
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


def photo_uri(photo_name, api_key):
    response = requests.get(
        f"https://places.googleapis.com/v1/{photo_name}/media",
        params={"maxWidthPx": "1600", "skipHttpRedirect": "true", "key": api_key},
        timeout=20,
    )
    response.raise_for_status()
    return clean(response.json().get("photoUri"))


def safe_google_photo_urls(place_id, api_key, places_cache, verification_cache):
    if place_id not in places_cache:
        try:
            details = place_details(place_id, api_key)
            urls = []
            for photo in details.get("photos", []) or []:
                name = photo.get("name")
                if not name:
                    continue
                try:
                    url = photo_uri(name, api_key)
                    if url:
                        urls.append(url)
                except Exception as exc:
                    urls.append({"error": f"{type(exc).__name__}: {exc}", "photoName": name})
            places_cache[place_id] = {
                "displayName": details.get("displayName", {}).get("text", ""),
                "formattedAddress": details.get("formattedAddress", ""),
                "urls": [item for item in urls if isinstance(item, str)],
                "errors": [item for item in urls if isinstance(item, dict)],
            }
        except Exception as exc:
            places_cache[place_id] = {"urls": [], "errors": [f"{type(exc).__name__}: {exc}"]}
    raw_urls = places_cache[place_id].get("urls", [])
    pending = [url for url in raw_urls if url not in verification_cache]
    if pending:
        verify.verify_urls_parallel(pending, verification_cache, VERIFY_CACHE, max_workers=16)
    safe = []
    for url in raw_urls:
        reasons = verify.url_reasons(url, verification_cache)
        if not reasons:
            safe.append(url)
    return dedupe(safe)


def fetch_place_photo_url_record(place_id, api_key):
    try:
        details = place_details(place_id, api_key)
        urls = []
        errors = []
        for photo in details.get("photos", []) or []:
            name = photo.get("name")
            if not name:
                continue
            try:
                url = photo_uri(name, api_key)
                if url:
                    urls.append(url)
            except Exception as exc:
                errors.append({"error": f"{type(exc).__name__}: {exc}", "photoName": name})
        return place_id, {
            "displayName": details.get("displayName", {}).get("text", ""),
            "formattedAddress": details.get("formattedAddress", ""),
            "urls": dedupe(urls),
            "errors": errors,
        }
    except Exception as exc:
        return place_id, {"urls": [], "errors": [f"{type(exc).__name__}: {exc}"]}


def fetch_place_photo_urls_parallel(place_ids, api_key, places_cache):
    missing = [place_id for place_id in place_ids if place_id not in places_cache]
    if not missing:
        return
    print(f"Fetching Google photo URL lists for {len(missing)} places...", flush=True)
    completed = 0
    with ThreadPoolExecutor(max_workers=16) as pool:
        futures = {pool.submit(fetch_place_photo_url_record, place_id, api_key): place_id for place_id in missing}
        for future in as_completed(futures):
            place_id, record = future.result()
            places_cache[place_id] = record
            completed += 1
            if completed % 25 == 0 or completed == len(missing):
                PLACES_CACHE.write_text(json.dumps(places_cache, indent=2), encoding="utf-8")
                print(f"Fetched place photo URL lists {completed}/{len(missing)}", flush=True)


def add(pool, key, images):
    if key:
        pool[key].extend(images)


def build_pools(props):
    pools = {
        "same_google_place_id": defaultdict(list),
        "same_google_place_name": defaultdict(list),
        "same_exact_address": defaultdict(list),
        "same_nearby": defaultdict(list),
        "same_builder": defaultdict(list),
        "same_city_property_type": defaultdict(list),
        "same_city_category": defaultdict(list),
        "same_property_type": defaultdict(list),
        "same_category": defaultdict(list),
    }
    for prop in props:
        images = prop_images(prop)
        if not images:
            continue
        keys = keys_for(prop)
        add(pools["same_google_place_id"], keys["place_id"].lower(), images)
        add(pools["same_google_place_name"], keys["place_name"], images)
        add(pools["same_exact_address"], keys["address"], images)
        add(pools["same_nearby"], keys["nearby"], images)
        add(pools["same_builder"], keys["builder"], images)
        add(pools["same_city_property_type"], f"{keys['city']}|{keys['property_type']}", images)
        add(pools["same_city_category"], f"{keys['city']}|{keys['category']}", images)
        add(pools["same_property_type"], keys["property_type"], images)
        add(pools["same_category"], keys["category"], images)
    for name, pool in pools.items():
        for key, images in list(pool.items()):
            pool[key] = dedupe(images)
    return pools


def main():
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("GOOGLE_MAPS_API_KEY is required for fetching extra real Google Places photos.")

    source_manifest = json.loads((SOURCE_EXPORT / "manifest.json").read_text(encoding="utf-8"))
    source_collections = SOURCE_EXPORT / "collections"
    output_collections = OUTPUT_EXPORT / "collections"
    output_collections.mkdir(parents=True, exist_ok=True)
    props = json_util.loads((source_collections / "properties.json").read_text(encoding="utf-8"))

    if VERIFY_CACHE.exists():
        verification_cache = json.loads(VERIFY_CACHE.read_text(encoding="utf-8"))
    else:
        verification_cache = {}
    if PLACES_CACHE.exists():
        places_cache = json.loads(PLACES_CACHE.read_text(encoding="utf-8"))
    else:
        places_cache = {}

    underfilled = [prop for prop in props if len(prop_images(prop)) < 5]
    place_ids = sorted({keys_for(prop)["place_id"] for prop in underfilled if keys_for(prop)["place_id"]})
    print(f"Underfilled properties: {len(underfilled)}; unique place IDs to enrich: {len(place_ids)}", flush=True)

    # First collect all extra Google photo URLs. Then verify them in one parallel pass;
    # doing this per place is much slower because most places only add a handful of URLs.
    fetch_place_photo_urls_parallel(place_ids, api_key, places_cache)

    all_extra_urls = dedupe(
        [
            url
            for place_id in place_ids
            for url in places_cache.get(place_id, {}).get("urls", [])
            if isinstance(url, str)
        ]
    )
    pending = [url for url in all_extra_urls if url not in verification_cache]
    if pending:
        verify.verify_urls_parallel(pending, verification_cache, VERIFY_CACHE, max_workers=24)
    PLACES_CACHE.write_text(json.dumps(places_cache, indent=2), encoding="utf-8")
    VERIFY_CACHE.write_text(json.dumps(verification_cache, indent=2), encoding="utf-8")

    place_safe_images = {}
    for idx, place_id in enumerate(place_ids, start=1):
        place_safe_images[place_id] = [
            url
            for url in places_cache.get(place_id, {}).get("urls", [])
            if isinstance(url, str) and not verify.url_reasons(url, verification_cache)
        ]

    updated_props = []
    extra_fetch_report = []
    for prop in props:
        next_prop = deepcopy(prop)
        images = prop_images(next_prop)
        keys = keys_for(next_prop)
        added_from_extra = []
        place_id = keys["place_id"]
        if len(images) < 5 and place_id:
            for url in place_safe_images.get(place_id, []):
                if url not in images:
                    images.append(url)
                    added_from_extra.append(url)
                if len(images) >= 5:
                    break
        next_prop.setdefault("media", {})["images"] = dedupe(images)[:5]
        if added_from_extra:
            next_prop.setdefault("externalSource", {})["extraGooglePlaceImageFill"] = "same_google_place_id_extra_photos"
            extra_fetch_report.append(
                {
                    "_id": str(next_prop.get("_id")),
                    "customId": next_prop.get("details", {}).get("customId", ""),
                    "slug": next_prop.get("description", {}).get("slug", ""),
                    "title": next_prop.get("description", {}).get("title", ""),
                    "googleMapsPlaceId": place_id,
                    "addedCount": len(added_from_extra),
                    "imageCountAfterExtraFetch": len(next_prop["media"]["images"]),
                }
            )
        updated_props.append(next_prop)

    # Rebuild exact/fair pools after adding any newly fetched same-place photos.
    pools = build_pools(updated_props)
    fallback_report = []
    fallback_order = [
        ("same_google_place_id", lambda k: k["place_id"].lower()),
        ("same_google_place_name", lambda k: k["place_name"]),
        ("same_exact_address", lambda k: k["address"]),
        ("same_nearby", lambda k: k["nearby"]),
        ("same_builder", lambda k: k["builder"]),
        ("same_city_property_type", lambda k: f"{k['city']}|{k['property_type']}"),
        ("same_city_category", lambda k: f"{k['city']}|{k['category']}"),
        ("same_property_type", lambda k: k["property_type"]),
        ("same_category", lambda k: k["category"]),
    ]

    final_props = []
    for prop in updated_props:
        next_prop = deepcopy(prop)
        before_count = len(prop_images(next_prop))
        images = prop_images(next_prop)
        strategies = []
        keys = keys_for(next_prop)
        for pool_name, key_fn in fallback_order:
            if len(images) >= 5:
                break
            key = key_fn(keys)
            candidates = pools[pool_name].get(key, [])
            before = len(images)
            for url in candidates:
                if url not in images:
                    images.append(url)
                if len(images) >= 5:
                    break
            if len(images) > before:
                strategies.append(pool_name)

        next_prop.setdefault("media", {})["images"] = dedupe(images)[:5]
        if len(next_prop["media"]["images"]) > before_count:
            next_prop.setdefault("externalSource", {})["productionFiveImageFillStrategy"] = "+".join(strategies)
            fallback_report.append(
                {
                    "_id": str(next_prop.get("_id")),
                    "customId": next_prop.get("details", {}).get("customId", ""),
                    "slug": next_prop.get("description", {}).get("slug", ""),
                    "title": next_prop.get("description", {}).get("title", ""),
                    "beforeCount": before_count,
                    "afterCount": len(next_prop["media"]["images"]),
                    "fillStrategy": "+".join(strategies),
                }
            )
        final_props.append(next_prop)

    for source_file in source_collections.glob("*.json"):
        if source_file.name == "properties.json":
            continue
        (output_collections / source_file.name).write_text(source_file.read_text(encoding="utf-8"), encoding="utf-8")
    (output_collections / "properties.json").write_text(json_util.dumps(final_props, indent=2), encoding="utf-8")

    with (OUTPUT_EXPORT / "extra_google_place_image_fill_report.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["_id", "customId", "slug", "title", "googleMapsPlaceId", "addedCount", "imageCountAfterExtraFetch"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(extra_fetch_report)

    with (OUTPUT_EXPORT / "five_image_fill_report.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["_id", "customId", "slug", "title", "beforeCount", "afterCount", "fillStrategy"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(fallback_report)

    with (OUTPUT_EXPORT / "still_under_five_images.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["_id", "customId", "slug", "title", "imageCount", "googleMapsPlaceId", "googleMapsPlaceName"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for prop in final_props:
            if len(prop_images(prop)) < 5:
                writer.writerow(
                    {
                        "_id": str(prop.get("_id")),
                        "customId": prop.get("details", {}).get("customId", ""),
                        "slug": prop.get("description", {}).get("slug", ""),
                        "title": prop.get("description", {}).get("title", ""),
                        "imageCount": len(prop_images(prop)),
                        "googleMapsPlaceId": prop.get("externalSource", {}).get("googleMapsPlaceId", ""),
                        "googleMapsPlaceName": prop.get("externalSource", {}).get("googleMapsPlaceName", ""),
                    }
                )

    identity_changes = []
    source_by_id = {str(prop.get("_id")): prop for prop in props}
    for prop in final_props:
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
    for prop in final_props:
        distribution[str(len(prop_images(prop)))] += 1

    # Re-validate final image URLs against verifier cache.
    remaining_bad = []
    for prop in final_props:
        for url in prop_images(prop):
            reasons = verify.url_reasons(url, verification_cache)
            if reasons:
                remaining_bad.append({"_id": str(prop.get("_id")), "slug": prop.get("description", {}).get("slug"), "image": url, "reasons": reasons})

    manifest = {
        **source_manifest,
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "mode": "read_only_export_no_database_writes_five_real_verified_images",
        "sourceExport": str(SOURCE_EXPORT),
        "propertiesScanned": len(final_props),
        "uniquePlaceIdsEnriched": len(place_ids),
        "propertiesWithFiveImages": sum(1 for prop in final_props if len(prop_images(prop)) >= 5),
        "propertiesStillUnderFiveImages": sum(1 for prop in final_props if len(prop_images(prop)) < 5),
        "imageCountDistribution": dict(sorted(distribution.items(), key=lambda item: int(item[0]))),
        "identityChanges": identity_changes,
        "remainingBadImages": remaining_bad,
    }
    (OUTPUT_EXPORT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (OUTPUT_EXPORT / "README.md").write_text(
        "# JameenWallah Production Five Real Images Export\n\n"
        "This export was generated without writing to MongoDB.\n\n"
        "It fetches additional Google Places photos for each exact place ID, verifies them for people/profile/third-party problems, "
        "and then fills remaining gallery slots from already-verified same-place, same-project, same-address, or closely related property pools.\n",
        encoding="utf-8",
    )
    zip_path = zip_dir(OUTPUT_EXPORT)

    print(
        json.dumps(
            {
                "outputDir": str(OUTPUT_EXPORT),
                "zipPath": str(zip_path),
                "propertiesScanned": len(final_props),
                "uniquePlaceIdsEnriched": len(place_ids),
                "propertiesWithFiveImages": manifest["propertiesWithFiveImages"],
                "propertiesStillUnderFiveImages": manifest["propertiesStillUnderFiveImages"],
                "imageCountDistribution": manifest["imageCountDistribution"],
                "identityChanges": len(identity_changes),
                "remainingBadImages": len(remaining_bad),
            },
            indent=2,
        )
    )
    if identity_changes or remaining_bad or manifest["propertiesStillUnderFiveImages"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
