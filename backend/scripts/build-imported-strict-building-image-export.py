#!/usr/bin/env python3
import csv
import hashlib
import json
import re
import sys
import time
import zipfile
from collections import defaultdict
from copy import deepcopy
from pathlib import Path

import cv2
import easyocr
import numpy as np
import torch
from PIL import Image
from torchvision.models import ResNet50_Weights, resnet50

sys.path.insert(0, "/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-18/scrape-this-website-logo-call-91/.pydeps")
from bson import json_util  # noqa: E402
from pymongo import MongoClient  # noqa: E402


REPO = Path("/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-06/jameenwallah-pr-real")
EXPORT_ROOT = REPO / "database-exports"
RUNTIME_FILE = REPO / "backend/.local-stack-runtime.json"
VERIFY_CACHE = EXPORT_ROOT / "_image-verify-cache" / "verification-cache.json"
USEFUL_CACHE = EXPORT_ROOT / "_image-verify-cache" / "useful-building-image-cache.json"
PLACES_CACHE = EXPORT_ROOT / "_image-verify-cache" / "places-extra-photo-cache.json"
FIVE_EXPORT = EXPORT_ROOT / "jameenwallah-production-five-real-images-export-2026-05-22T10-31-59"
OUTPUT_EXPORT = EXPORT_ROOT / f"jameenwallah-imported-strict-building-images-export-{time.strftime('%Y-%m-%dT%H-%M-%S', time.gmtime())}"

VERIFY_SCRIPT = REPO / "backend/scripts/build-verified-clean-property-export.py"


def load_verify_module():
    import importlib.util

    spec = importlib.util.spec_from_file_location("jw_verify", VERIFY_SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


verify = load_verify_module()

SIZE_CORRECTIONS = {
    "prop-s00008-independent-farm-house-south-delhi-delhi": {"current": 1, "value": 43560},
    "prop-s00010-independent-farm-house-south-delhi-delhi": {"current": 4.5, "value": 196020},
    "prop-s00071-independent-farm-house-mandi-hills-delhi": {"current": 4.5, "value": 196020},
    "prop-s00094-independent-warehouse-bilaspur-gurgaon": {"current": 6, "value": 261360},
    "prop-s00100-independent-farm-house-mandi-hills-delhi": {"current": 1, "value": 43560},
    "prop-s00149-reach-group-farm-house-mandi-hills-delhi": {"current": 4.12, "value": 180774},
    "prop-s00462-independent-office-space-sector-18-gurgaon": {"current": 5, "value": 217800},
    "prop-s01168-industrial-building-manesar-gurgaon": {"current": 4, "value": 174240},
    "prop-s01229-industrial-building-imt-manesar-gurgaon": {"current": 2, "value": 87120},
}

BRANDING_REPLACEMENTS = [
    (re.compile(r"https?://(?:www\.)?bigcatrealty\.com", re.I), "https://www.jameenwallah.com"),
    (re.compile(r"www\.bigcatrealty\.com", re.I), "www.jameenwallah.com"),
    (re.compile(r"property listings imported from leasing\.net\.in for BigCat Realty review", re.I), "property listing prepared for JameenWallah review"),
    (re.compile(r"Imported from leasing\.net\.in", re.I), "Property listing prepared for JameenWallah review"),
    (re.compile(r"BigCat Realty", re.I), "JameenWallah"),
    (re.compile(r"BigCat", re.I), "JameenWallah"),
    (re.compile(r"leasing\.net\.in", re.I), "JameenWallah"),
    (re.compile(r"leasing\.net", re.I), "JameenWallah"),
]

INDOOR_LABEL_TERMS = {
    "barber chair",
    "bookcase",
    "china cabinet",
    "computer keyboard",
    "desktop computer",
    "dining table",
    "entertainment center",
    "folding chair",
    "laptop",
    "monitor",
    "office",
    "screen",
    "studio couch",
    "throne",
    "toilet seat",
    "wardrobe",
}

ARCHITECTURE_LABEL_TERMS = {
    "palace",
    "castle",
    "church",
    "monastery",
    "mosque",
    "dome",
    "triumphal arch",
    "library",
    "cinema",
    "mobile home",
    "greenhouse",
    "barn",
    "boathouse",
    "planetarium",
    "street sign",
    "traffic light",
    "fountain",
}


def clean(value):
    return " ".join(str(value or "").split()).strip()


def lower(value):
    return clean(value).lower()


def parse_num(value):
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(re.sub(r"[^\d.]", "", str(value or "")))
    except Exception:
        return None


def same_num(value, expected):
    parsed = parse_num(value)
    return parsed is not None and abs(parsed - expected) < 0.001


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


def sanitize_text(value):
    next_value = value
    for regex, replacement in BRANDING_REPLACEMENTS:
        next_value = regex.sub(replacement, next_value)
    return re.sub(r"[ \t]{2,}", " ", next_value).strip() if next_value != value else value


def sanitize_imported_public_strings(value, path="", changes=None):
    if changes is None:
        changes = []
    if isinstance(value, str):
        if path in {"_id", "createdAt", "updatedAt", "description.slug", "details.customId"} or path.startswith("externalSource.") or path.startswith("media."):
            return value
        next_value = sanitize_text(value)
        if next_value != value:
            changes.append({"path": path, "before": value, "after": next_value})
        return next_value
    if isinstance(value, list):
        return [sanitize_imported_public_strings(item, f"{path}.{idx}" if path else str(idx), changes) for idx, item in enumerate(value)]
    if isinstance(value, dict):
        for key in list(value.keys()):
            value[key] = sanitize_imported_public_strings(value[key], f"{path}.{key}" if path else key, changes)
    return value


def apply_size_fix(prop):
    slug = lower(prop.get("description", {}).get("slug"))
    correction = SIZE_CORRECTIONS.get(slug)
    changed = False
    if not correction:
        return changed
    details = prop.setdefault("details", {})
    if same_num(details.get("sizeInSqFt"), correction["current"]):
        details["sizeInSqFt"] = correction["value"]
        changed = True
    if same_num(details.get("totalAreaInSqFt"), correction["current"]):
        details["totalAreaInSqFt"] = correction["value"]
        changed = True
    for plan in prop.get("description", {}).get("floorPlans", []) or []:
        if same_num(plan.get("superBuiltUpArea"), correction["current"]):
            plan["superBuiltUpArea"] = correction["value"]
            changed = True
    return changed


def image_cache_key(url, context):
    return hashlib.sha256((url + "\n" + context).encode("utf-8")).hexdigest()


def tokens_for(prop):
    values = [
        prop.get("description", {}).get("title"),
        prop.get("externalSource", {}).get("googleMapsPlaceName"),
        prop.get("externalSource", {}).get("googleMapsPlaceAddress"),
        prop.get("location", {}).get("nearBy"),
        prop.get("location", {}).get("address"),
    ]
    tokens = set()
    stop = {"the", "and", "for", "with", "road", "sector", "gurgaon", "gurugram", "delhi", "haryana", "india", "office", "space", "commercial", "residential", "apartment", "building", "floor"}
    for value in values:
        for token in re.findall(r"[A-Za-z0-9]{3,}", clean(value).lower()):
            if token not in stop:
                tokens.add(token)
    return tokens


weights = ResNet50_Weights.DEFAULT
model = resnet50(weights=weights)
model.eval()
preprocess = weights.transforms()
categories = weights.meta["categories"]
reader = easyocr.Reader(["en"], gpu=False, verbose=False)


def classify_resnet(image_path):
    image = Image.open(image_path).convert("RGB")
    batch = preprocess(image).unsqueeze(0)
    with torch.no_grad():
        probs = model(batch).softmax(1)[0]
    values, indices = torch.topk(probs, 8)
    return [(categories[int(idx)], float(val)) for val, idx in zip(values, indices)]


def exterior_features(image_path):
    image = cv2.imread(str(image_path))
    if image is None:
        return {"readable": False}
    h, w = image.shape[:2]
    if max(h, w) > 1000:
        scale = 1000 / max(h, w)
        image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        h, w = image.shape[:2]

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    top = hsv[: max(1, int(h * 0.45)), :, :]
    sky_mask = ((top[:, :, 0] >= 85) & (top[:, :, 0] <= 130) & (top[:, :, 1] >= 25) & (top[:, :, 2] >= 110))
    sky_ratio = float(np.mean(sky_mask))

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 80, 180)
    edge_ratio = float(np.mean(edges > 0))
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=70, minLineLength=max(30, int(min(h, w) * 0.08)), maxLineGap=8)
    line_count = 0 if lines is None else len(lines)
    verticalish = 0
    horizontalish = 0
    if lines is not None:
        for line in lines[:, 0, :]:
            x1, y1, x2, y2 = line
            angle = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
            if angle > 75:
                verticalish += 1
            if angle < 15:
                horizontalish += 1
    return {
        "readable": True,
        "sky_ratio": sky_ratio,
        "edge_ratio": edge_ratio,
        "line_count": line_count,
        "vertical_lines": verticalish,
        "horizontal_lines": horizontalish,
    }


def ocr_match(image_path, wanted_tokens):
    try:
        results = reader.readtext(str(image_path), detail=0, paragraph=True)
    except Exception:
        return False, []
    text = " ".join(results).lower()
    found = sorted(token for token in wanted_tokens if len(token) >= 4 and token in text)
    return bool(found), found[:12]


def classify_image(url, wanted_tokens, verify_cache, useful_cache):
    context = " ".join(sorted(wanted_tokens))
    key = image_cache_key(url, context)
    if key in useful_cache:
        return useful_cache[key]

    reasons = verify.url_reasons(url, verify_cache)
    if reasons:
        result = {"decision": "reject", "tier": "bad_or_people", "reasons": reasons}
        useful_cache[key] = result
        return result

    try:
        path = verify.download_image(url)
        labels = classify_resnet(path)
        label_names = {name.lower() for name, _ in labels}
        features = exterior_features(path)
        has_indoor_label = bool(label_names & INDOOR_LABEL_TERMS)
        has_arch_label = any(name.lower() in ARCHITECTURE_LABEL_TERMS and prob > 0.06 for name, prob in labels)
        strong_exterior = (
            features.get("readable")
            and (
                features.get("sky_ratio", 0) >= 0.035
                or (features.get("vertical_lines", 0) >= 8 and features.get("horizontal_lines", 0) >= 4)
            )
            and features.get("edge_ratio", 0) >= 0.025
        )
        text_match, matched_tokens = ocr_match(path, wanted_tokens)

        if text_match:
            result = {
                "decision": "approve",
                "tier": "property_name_or_signage_visible",
                "matchedTokens": matched_tokens,
                "labels": labels,
                "features": features,
            }
        elif has_indoor_label and not strong_exterior:
            result = {
                "decision": "reject",
                "tier": "indoor_or_furniture",
                "reasons": [f"indoor/furniture label: {sorted(label_names & INDOOR_LABEL_TERMS)}"],
                "labels": labels,
                "features": features,
            }
        elif strong_exterior or has_arch_label:
            result = {
                "decision": "approve",
                "tier": "exterior_building_or_project_view",
                "labels": labels,
                "features": features,
            }
        else:
            result = {
                "decision": "reject",
                "tier": "not_useful_property_listing_image",
                "reasons": ["no property signage/name and not confidently exterior/building"],
                "labels": labels,
                "features": features,
            }
    except Exception as exc:
        result = {"decision": "reject", "tier": "classification_error", "reasons": [f"{type(exc).__name__}: {exc}"]}

    useful_cache[key] = result
    return result


def add(pool, key, urls):
    if key:
        pool[key].extend(urls)


def keys_for(prop):
    external = prop.get("externalSource", {})
    location = prop.get("location", {})
    desc = prop.get("description", {})
    return {
        "place_id": lower(external.get("googleMapsPlaceId")),
        "place_name": lower(external.get("googleMapsPlaceName")),
        "address": lower(location.get("address")),
        "nearby": lower(location.get("nearBy")),
        "property_type": lower(desc.get("propertyType")),
        "category": lower(desc.get("category")),
        "builder": lower(desc.get("builder")),
    }


def zip_dir(root):
    zip_path = root.with_suffix(".zip")
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in root.rglob("*"):
            archive.write(path, path.relative_to(root.parent))
    return zip_path


def main():
    runtime = json.loads(RUNTIME_FILE.read_text(encoding="utf-8"))
    db = MongoClient(runtime["mongoUri"], serverSelectionTimeoutMS=5000).get_default_database()
    db.command("ping")
    collection_names = sorted(db.list_collection_names())
    live_props = list(db.properties.find({}))
    five_props = []
    if (FIVE_EXPORT / "collections/properties.json").exists():
        five_props = json_util.loads((FIVE_EXPORT / "collections/properties.json").read_text(encoding="utf-8"))
    five_by_id = {str(prop.get("_id")): prop for prop in five_props}
    places_cache = json.loads(PLACES_CACHE.read_text(encoding="utf-8")) if PLACES_CACHE.exists() else {}
    verify_cache = json.loads(VERIFY_CACHE.read_text(encoding="utf-8")) if VERIFY_CACHE.exists() else {}
    useful_cache = json.loads(USEFUL_CACHE.read_text(encoding="utf-8")) if USEFUL_CACHE.exists() else {}

    OUTPUT_EXPORT.mkdir(parents=True, exist_ok=True)
    collections_dir = OUTPUT_EXPORT / "collections"
    collections_dir.mkdir(parents=True, exist_ok=True)

    imported_reports = []
    image_reports = []
    cleaned_imported = []
    original_unchanged_count = 0

    for prop in live_props:
        is_imported = prop.get("externalSource", {}).get("sourceSystem") == "leasing.net.in"
        if not is_imported:
            original_unchanged_count += 1
            cleaned_imported.append(deepcopy(prop))
            continue

        next_prop = deepcopy(prop)
        size_updated = apply_size_fix(next_prop)
        text_changes = []
        sanitize_imported_public_strings(next_prop, changes=text_changes)
        wanted_tokens = tokens_for(next_prop)
        candidates = []
        candidates.extend(prop_images(prop))
        enriched = five_by_id.get(str(prop.get("_id")))
        if enriched:
            candidates.extend(prop_images(enriched))
        place_id = clean(next_prop.get("externalSource", {}).get("googleMapsPlaceId"))
        if place_id and place_id in places_cache:
            candidates.extend([url for url in places_cache[place_id].get("urls", []) if isinstance(url, str)])
        candidates = dedupe(candidates)

        approved = []
        per_prop_image_report = []
        for url in candidates:
            result = classify_image(url, wanted_tokens, verify_cache, useful_cache)
            report_row = {
                "_id": str(next_prop.get("_id")),
                "customId": next_prop.get("details", {}).get("customId", ""),
                "slug": next_prop.get("description", {}).get("slug", ""),
                "title": next_prop.get("description", {}).get("title", ""),
                "url": url,
                "decision": result.get("decision"),
                "tier": result.get("tier"),
                "reason": "; ".join(map(str, result.get("reasons", []))),
                "matchedTokens": " ".join(result.get("matchedTokens", [])),
                "topLabels": " | ".join(f"{name}:{prob:.2f}" for name, prob in result.get("labels", [])[:5]),
            }
            per_prop_image_report.append(report_row)
            if result.get("decision") == "approve" and url not in approved:
                approved.append(url)

        next_prop.setdefault("media", {})["images"] = approved[:5]
        next_prop.setdefault("externalSource", {})["strictImagePolicy"] = "property_signage_or_exterior_building_only"
        imported_reports.append(
            {
                "_id": str(next_prop.get("_id")),
                "customId": next_prop.get("details", {}).get("customId", ""),
                "slug": next_prop.get("description", {}).get("slug", ""),
                "title": next_prop.get("description", {}).get("title", ""),
                "candidateImages": len(candidates),
                "approvedImages": len(approved[:5]),
                "needsReplacementImages": "Yes" if len(approved) < 5 else "No",
                "sizeUpdated": "Yes" if size_updated else "No",
                "textFieldsUpdated": len(text_changes),
            }
        )
        image_reports.extend(per_prop_image_report)
        cleaned_imported.append(next_prop)

        if len(imported_reports) % 50 == 0:
            USEFUL_CACHE.write_text(json.dumps(useful_cache, indent=2), encoding="utf-8")
            print(f"Classified imported listings {len(imported_reports)}/1552", flush=True)

    USEFUL_CACHE.write_text(json.dumps(useful_cache, indent=2), encoding="utf-8")

    # Fill missing slots only from approved strict images in exact/sensible same-property pools.
    pools = {
        "same_google_place_id": defaultdict(list),
        "same_google_place_name": defaultdict(list),
        "same_exact_address": defaultdict(list),
        "same_nearby": defaultdict(list),
        "same_builder": defaultdict(list),
    }
    for prop in cleaned_imported:
        if prop.get("externalSource", {}).get("sourceSystem") != "leasing.net.in":
            continue
        keys = keys_for(prop)
        images = prop_images(prop)
        add(pools["same_google_place_id"], keys["place_id"], images)
        add(pools["same_google_place_name"], keys["place_name"], images)
        add(pools["same_exact_address"], keys["address"], images)
        add(pools["same_nearby"], keys["nearby"], images)
        add(pools["same_builder"], keys["builder"], images)
    for name in pools:
        for key in list(pools[name].keys()):
            pools[name][key] = dedupe(pools[name][key])

    fill_reports = []
    final_props = []
    for prop in cleaned_imported:
        if prop.get("externalSource", {}).get("sourceSystem") != "leasing.net.in":
            final_props.append(prop)
            continue
        keys = keys_for(prop)
        images = prop_images(prop)
        before = len(images)
        strategies = []
        for pool_name, key_name in [
            ("same_google_place_id", "place_id"),
            ("same_google_place_name", "place_name"),
            ("same_exact_address", "address"),
            ("same_nearby", "nearby"),
            ("same_builder", "builder"),
        ]:
            if len(images) >= 5:
                break
            old = len(images)
            for url in pools[pool_name].get(keys[key_name], []):
                if url not in images:
                    images.append(url)
                if len(images) >= 5:
                    break
            if len(images) > old:
                strategies.append(pool_name)
        prop.setdefault("media", {})["images"] = images[:5]
        if len(images) > before:
            fill_reports.append(
                {
                    "_id": str(prop.get("_id")),
                    "customId": prop.get("details", {}).get("customId", ""),
                    "slug": prop.get("description", {}).get("slug", ""),
                    "beforeCount": before,
                    "afterCount": len(images[:5]),
                    "fillStrategy": "+".join(strategies),
                }
            )
        final_props.append(prop)

    for name in collection_names:
        if name == "properties":
            continue
        docs = list(db[name].find({}))
        (collections_dir / f"{name}.json").write_text(json_util.dumps(docs, indent=2), encoding="utf-8")
    (collections_dir / "properties.json").write_text(json_util.dumps(final_props, indent=2), encoding="utf-8")

    with (OUTPUT_EXPORT / "imported_listing_strict_image_summary.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["_id", "customId", "slug", "title", "candidateImages", "approvedImages", "needsReplacementImages", "sizeUpdated", "textFieldsUpdated"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(imported_reports)

    with (OUTPUT_EXPORT / "strict_image_decision_audit.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["_id", "customId", "slug", "title", "url", "decision", "tier", "reason", "matchedTokens", "topLabels"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(image_reports)

    with (OUTPUT_EXPORT / "strict_image_pool_fill_report.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["_id", "customId", "slug", "beforeCount", "afterCount", "fillStrategy"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(fill_reports)

    identity_changes = []
    before_by_id = {str(prop["_id"]): prop for prop in live_props}
    for prop in final_props:
        before = before_by_id[str(prop["_id"])]
        for field, old, new in [
            ("_id", str(before.get("_id")), str(prop.get("_id"))),
            ("customId", before.get("details", {}).get("customId"), prop.get("details", {}).get("customId")),
            ("slug", before.get("description", {}).get("slug"), prop.get("description", {}).get("slug")),
            ("createdAt", str(before.get("createdAt")), str(prop.get("createdAt"))),
        ]:
            if old != new:
                identity_changes.append({"_id": str(prop.get("_id")), "field": field, "before": old, "after": new})

    imported_final = [prop for prop in final_props if prop.get("externalSource", {}).get("sourceSystem") == "leasing.net.in"]
    original_final = [prop for prop in final_props if prop.get("externalSource", {}).get("sourceSystem") != "leasing.net.in"]
    manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "mode": "read_only_export_no_database_writes_original_bigcat_records_unchanged",
        "propertiesTotal": len(final_props),
        "originalClientPropertiesCopiedUnchanged": original_unchanged_count,
        "importedPropertiesProcessed": len(imported_final),
        "importedPropertiesWithFiveStrictImages": sum(1 for prop in imported_final if len(prop_images(prop)) >= 5),
        "importedPropertiesNeedingReplacementImages": sum(1 for prop in imported_final if len(prop_images(prop)) < 5),
        "identityChanges": identity_changes,
        "notes": [
            "No SSH used.",
            "No PR created.",
            "No MongoDB writes performed.",
            "Original/client-entered BigCat records are copied from live DB unchanged.",
            "Imported leasing.net.in records only: gallery images filtered to property signage/name or exterior/building/project views; indoor/furniture/chair-like images rejected.",
        ],
    }
    (OUTPUT_EXPORT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (OUTPUT_EXPORT / "README.md").write_text(
        "# JameenWallah Strict Imported Building Image Export\n\n"
        "Read-only export. No SSH, no PR, no database writes.\n\n"
        "Original/client-entered BigCat records are copied unchanged. Imported listings are cleaned and their Maps-derived galleries are filtered for useful property listing images: signage/name-visible or exterior/building/project views.\n",
        encoding="utf-8",
    )
    zip_path = zip_dir(OUTPUT_EXPORT)
    print(json.dumps({**manifest, "outputDir": str(OUTPUT_EXPORT), "zipPath": str(zip_path)}, indent=2))
    if identity_changes:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
