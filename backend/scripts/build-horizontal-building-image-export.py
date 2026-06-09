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
from urllib.parse import urlparse

import cv2
import easyocr
import numpy as np
import torch
from PIL import Image
from torchvision.models import ResNet50_Weights, resnet50

sys.path.insert(0, "/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-18/scrape-this-website-logo-call-91/.pydeps")
from bson import json_util  # noqa: E402


REPO = Path("/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-06/jameenwallah-pr-real")
EXPORT_ROOT = REPO / "database-exports"
STRICT_EXPORT = EXPORT_ROOT / "jameenwallah-imported-strict-building-images-export-2026-05-22T17-10-05"
FIVE_EXPORT = EXPORT_ROOT / "jameenwallah-production-five-real-images-export-2026-05-22T10-31-59"
VERIFY_SCRIPT = REPO / "backend/scripts/build-verified-clean-property-export.py"
VERIFY_CACHE = EXPORT_ROOT / "_image-verify-cache" / "verification-cache.json"
PLACES_CACHE = EXPORT_ROOT / "_image-verify-cache" / "places-extra-photo-cache.json"
HORIZONTAL_CACHE = EXPORT_ROOT / "_image-verify-cache" / "horizontal-building-image-cache.json"
OUTPUT_EXPORT = EXPORT_ROOT / f"jameenwallah-horizontal-building-images-export-{time.strftime('%Y-%m-%dT%H-%M-%S', time.gmtime())}"

KNOWN_BAD_HOSTS = {
    "www.axiomlandbase.in",
    "axiomlandbase.in",
    "www.addressofchoice.com",
    "addressofchoice.com",
    "newprojects.99acres.com",
    "www.dlf.in",
    "dlf.in",
    "www.comingkeys.com",
    "comingkeys.com",
    "dlf-projects.co",
    "www.dlf-projects.co",
    "miro.medium.com",
    "www.nanubhaiproperty.com",
    "nanubhaiproperty.com",
    "i.ytimg.com",
    "res.cloudinary.com",
    "www.kenrealty.in",
    "kenrealty.in",
    "alexandro.in",
    "www.alexandro.in",
}

PERSON_URL_RE = re.compile(r"\b(agent|avatar|broker|owner|profile|selfie|team|testimonial|user|whatsapp|headshot|portrait)\b", re.I)

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


def load_verify_module():
    import importlib.util

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


def host(url):
    try:
        return urlparse(str(url)).netloc.lower()
    except Exception:
        return ""


def parse_number(value):
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(re.sub(r"[^\d.]", "", str(value or "")))
    except Exception:
        return None


def sqft_from_description(prop):
    text = " ".join(
        [
            clean(prop.get("description", {}).get("title")),
            clean(prop.get("description", {}).get("description")),
            clean(prop.get("description", {}).get("metaDescription")),
        ]
    )
    patterns = [
        r"(?:total\s+area|available\s+area|plot\s+area|land\s+area|area|size)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(acre|acres|sq\.?\s*ft|sqft|sq\.ft|square\s*feet)",
        r"([0-9]+(?:\.[0-9]+)?)\s*(acre|acres|sq\.?\s*ft|sqft|sq\.ft|square\s*feet)",
    ]
    hits = []
    for pattern in patterns:
        for match in re.finditer(pattern, text, re.I):
            number = float(match.group(1))
            unit = match.group(2).lower().replace(" ", "")
            sqft = round(number * 43560) if unit.startswith("acre") else round(number)
            if sqft >= 100:
                hits.append({"raw": match.group(0), "number": number, "unit": unit, "sqft": sqft})
    if not hits:
        return None
    # Prefer explicit area labels over generic occurrences by keeping first pattern hits first.
    return hits[0]


def correct_area_fields(prop):
    details = prop.setdefault("details", {})
    current = parse_number(details.get("sizeInSqFt"))
    hit = sqft_from_description(prop)
    if not hit:
        return None
    should_update = current is None or current < 100 or (hit["unit"].startswith("acre") and current and current < 1000)
    if not should_update:
        return None
    before = {
        "sizeInSqFt": details.get("sizeInSqFt"),
        "totalAreaInSqFt": details.get("totalAreaInSqFt"),
        "floorPlans": [
            {"superBuiltUpArea": plan.get("superBuiltUpArea")}
            for plan in prop.get("description", {}).get("floorPlans", []) or []
        ],
    }
    details["sizeInSqFt"] = hit["sqft"]
    total = parse_number(details.get("totalAreaInSqFt"))
    if total is None or total < 100:
        details["totalAreaInSqFt"] = hit["sqft"]
    for plan in prop.get("description", {}).get("floorPlans", []) or []:
        super_area = parse_number(plan.get("superBuiltUpArea"))
        if super_area is None or super_area < 100:
            plan["superBuiltUpArea"] = hit["sqft"]
    return {"matchedText": hit["raw"], "sqft": hit["sqft"], "before": before, "after": {"sizeInSqFt": details.get("sizeInSqFt"), "totalAreaInSqFt": details.get("totalAreaInSqFt")}}


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


def tokens_for(prop):
    values = [
        prop.get("description", {}).get("title"),
        prop.get("externalSource", {}).get("googleMapsPlaceName"),
        prop.get("externalSource", {}).get("googleMapsPlaceAddress"),
        prop.get("location", {}).get("nearBy"),
        prop.get("location", {}).get("address"),
    ]
    stop = {"the", "and", "for", "with", "road", "sector", "gurgaon", "gurugram", "delhi", "haryana", "india", "office", "space", "commercial", "residential", "apartment", "building", "floor"}
    tokens = set()
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


def classify_resnet(path):
    image = Image.open(path).convert("RGB")
    batch = preprocess(image).unsqueeze(0)
    with torch.no_grad():
        probs = model(batch).softmax(1)[0]
    values, indices = torch.topk(probs, 8)
    return [(categories[int(idx)], float(val)) for val, idx in zip(values, indices)]


def image_features(path):
    image = cv2.imread(str(path))
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
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 80, 180)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=70, minLineLength=max(30, int(min(h, w) * 0.08)), maxLineGap=8)
    vertical = horizontal = 0
    if lines is not None:
        for line in lines[:, 0, :]:
            x1, y1, x2, y2 = line
            angle = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
            if angle > 75:
                vertical += 1
            if angle < 15:
                horizontal += 1
    return {
        "readable": True,
        "width": w,
        "height": h,
        "aspect": w / max(1, h),
        "sky_ratio": float(np.mean(sky_mask)),
        "edge_ratio": float(np.mean(edges > 0)),
        "vertical_lines": vertical,
        "horizontal_lines": horizontal,
    }


def ocr_match(path, wanted_tokens):
    try:
        results = reader.readtext(str(path), detail=0, paragraph=True)
    except Exception:
        return False, []
    text = " ".join(results).lower()
    found = sorted(token for token in wanted_tokens if len(token) >= 4 and token in text)
    return bool(found), found[:12]


def decision_cache_key(url, tokens):
    return hashlib.sha256((url + "\n" + " ".join(sorted(tokens))).encode("utf-8")).hexdigest()


def classify_horizontal_building(url, tokens, cache):
    key = decision_cache_key(url, tokens)
    if key in cache:
        return cache[key]
    if not url.startswith("http") and not url.startswith("/"):
        result = {"decision": "reject", "tier": "invalid_url", "reasons": ["invalid image URL"]}
        cache[key] = result
        return result
    if host(url) in KNOWN_BAD_HOSTS:
        result = {"decision": "reject", "tier": "known_bad_host", "reasons": [f"known bad host: {host(url)}"]}
        cache[key] = result
        return result
    if PERSON_URL_RE.search(url):
        result = {"decision": "reject", "tier": "person_profile_url", "reasons": ["standalone person/profile-like URL"]}
        cache[key] = result
        return result
    try:
        path = verify.download_image(url) if url.startswith("http") else Path(url)
        features = image_features(path)
        if not features.get("readable"):
            result = {"decision": "reject", "tier": "unreadable", "reasons": ["unreadable image"]}
        elif features["aspect"] <= 1.08:
            result = {"decision": "reject", "tier": "not_horizontal", "reasons": [f"aspect {features['aspect']:.2f} is not horizontal"], "features": features}
        else:
            labels = classify_resnet(path)
            label_names = {name.lower() for name, _ in labels}
            has_indoor = bool(label_names & INDOOR_LABEL_TERMS)
            has_arch = any(name.lower() in ARCHITECTURE_LABEL_TERMS and prob > 0.045 for name, prob in labels)
            strong_exterior = (
                features.get("sky_ratio", 0) >= 0.03
                or (features.get("vertical_lines", 0) >= 7 and features.get("horizontal_lines", 0) >= 3 and features.get("edge_ratio", 0) >= 0.022)
            )
            text_match, matched = ocr_match(path, tokens)
            if text_match:
                result = {"decision": "approve", "tier": "horizontal_property_name_or_signage_visible", "matchedTokens": matched, "labels": labels, "features": features}
            elif has_indoor and not (strong_exterior or has_arch):
                result = {"decision": "reject", "tier": "indoor_room_furniture", "reasons": [f"indoor/furniture label: {sorted(label_names & INDOOR_LABEL_TERMS)}"], "labels": labels, "features": features}
            elif strong_exterior or has_arch:
                result = {"decision": "approve", "tier": "horizontal_exterior_building_or_project_view", "labels": labels, "features": features}
            else:
                result = {"decision": "reject", "tier": "not_property_building_view", "reasons": ["not confidently building/project/signage"], "labels": labels, "features": features}
    except Exception as exc:
        result = {"decision": "reject", "tier": "classification_error", "reasons": [f"{type(exc).__name__}: {exc}"]}
    cache[key] = result
    return result


def keys_for(prop):
    ext = prop.get("externalSource", {})
    loc = prop.get("location", {})
    desc = prop.get("description", {})
    return {
        "place_id": lower(ext.get("googleMapsPlaceId")),
        "place_name": lower(ext.get("googleMapsPlaceName")),
        "address": lower(loc.get("address")),
        "nearby": lower(loc.get("nearBy")),
        "builder": lower(desc.get("builder")),
    }


def add(pool, key, images):
    if key:
        pool[key].extend(images)


def zip_dir(root):
    zip_path = root.with_suffix(".zip")
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in root.rglob("*"):
            archive.write(path, path.relative_to(root.parent))
    return zip_path


def main():
    source_props = json_util.loads((STRICT_EXPORT / "collections/properties.json").read_text(encoding="utf-8"))
    five_props = json_util.loads((FIVE_EXPORT / "collections/properties.json").read_text(encoding="utf-8"))
    five_by_id = {str(prop.get("_id")): prop for prop in five_props}
    audit_rows = list(csv.DictReader((STRICT_EXPORT / "strict_image_decision_audit.csv").open(newline="", encoding="utf-8")))
    audit_by_id = defaultdict(list)
    for row in audit_rows:
        audit_by_id[row["_id"]].append(row["url"])
    places_cache = json.loads(PLACES_CACHE.read_text(encoding="utf-8")) if PLACES_CACHE.exists() else {}
    cache = json.loads(HORIZONTAL_CACHE.read_text(encoding="utf-8")) if HORIZONTAL_CACHE.exists() else {}

    OUTPUT_EXPORT.mkdir(parents=True, exist_ok=True)
    collections_dir = OUTPUT_EXPORT / "collections"
    collections_dir.mkdir(parents=True, exist_ok=True)

    image_decisions = []
    area_reports = []
    text_reports = []
    processed = []

    for prop in source_props:
        imported = prop.get("externalSource", {}).get("sourceSystem") == "leasing.net.in"
        if not imported:
            processed.append(deepcopy(prop))
            continue
        next_prop = deepcopy(prop)
        area_report = correct_area_fields(next_prop)
        if area_report:
            area_report.update({"_id": str(next_prop.get("_id")), "customId": next_prop.get("details", {}).get("customId", ""), "slug": next_prop.get("description", {}).get("slug", "")})
            area_reports.append(area_report)
        text_changes = []
        sanitize_imported_public_strings(next_prop, changes=text_changes)
        if text_changes:
            text_reports.append({"_id": str(next_prop.get("_id")), "slug": next_prop.get("description", {}).get("slug", ""), "changes": text_changes})

        candidates = []
        candidates.extend(prop_images(prop))
        candidates.extend(audit_by_id.get(str(prop.get("_id")), []))
        enriched = five_by_id.get(str(prop.get("_id")))
        if enriched:
            candidates.extend(prop_images(enriched))
        place_id = clean(next_prop.get("externalSource", {}).get("googleMapsPlaceId"))
        if place_id in places_cache:
            candidates.extend([url for url in places_cache[place_id].get("urls", []) if isinstance(url, str)])
        candidates = dedupe(candidates)

        tokens = tokens_for(next_prop)
        approved = []
        for url in candidates:
            result = classify_horizontal_building(url, tokens, cache)
            image_decisions.append(
                {
                    "_id": str(next_prop.get("_id")),
                    "customId": next_prop.get("details", {}).get("customId", ""),
                    "slug": next_prop.get("description", {}).get("slug", ""),
                    "title": next_prop.get("description", {}).get("title", ""),
                    "url": url,
                    "decision": result.get("decision"),
                    "tier": result.get("tier"),
                    "reason": "; ".join(result.get("reasons", [])),
                    "matchedTokens": " ".join(result.get("matchedTokens", [])),
                    "aspect": result.get("features", {}).get("aspect", ""),
                    "topLabels": " | ".join(f"{name}:{prob:.2f}" for name, prob in result.get("labels", [])[:5]),
                }
            )
            if result.get("decision") == "approve" and url not in approved:
                approved.append(url)
        next_prop.setdefault("media", {})["images"] = approved[:5]
        next_prop.setdefault("externalSource", {})["imagePolicy"] = "horizontal_property_building_or_signage_images_people_allowed_if_building_visible"
        processed.append(next_prop)
        if len([p for p in processed if p.get("externalSource", {}).get("sourceSystem") == "leasing.net.in"]) % 50 == 0:
            HORIZONTAL_CACHE.write_text(json.dumps(cache, indent=2), encoding="utf-8")
            print(f"Processed imported listings {len([p for p in processed if p.get('externalSource', {}).get('sourceSystem') == 'leasing.net.in'])}/1552", flush=True)

    HORIZONTAL_CACHE.write_text(json.dumps(cache, indent=2), encoding="utf-8")

    pools = {name: defaultdict(list) for name in ["place_id", "place_name", "address", "nearby", "builder"]}
    for prop in processed:
        if prop.get("externalSource", {}).get("sourceSystem") != "leasing.net.in":
            continue
        keys = keys_for(prop)
        imgs = prop_images(prop)
        for key in pools:
            add(pools[key], keys[key], imgs)
    for pool in pools.values():
        for key in list(pool.keys()):
            pool[key] = dedupe(pool[key])

    fill_reports = []
    final_props = []
    for prop in processed:
        if prop.get("externalSource", {}).get("sourceSystem") != "leasing.net.in":
            final_props.append(prop)
            continue
        images = prop_images(prop)
        before = len(images)
        keys = keys_for(prop)
        strategies = []
        for pool_name in ["place_id", "place_name", "address", "nearby", "builder"]:
            if len(images) >= 5:
                break
            old = len(images)
            for url in pools[pool_name].get(keys[pool_name], []):
                if url not in images:
                    images.append(url)
                if len(images) >= 5:
                    break
            if len(images) > old:
                strategies.append(f"same_{pool_name}")
        prop.setdefault("media", {})["images"] = images[:5]
        if len(images) > before:
            fill_reports.append({"_id": str(prop.get("_id")), "customId": prop.get("details", {}).get("customId", ""), "slug": prop.get("description", {}).get("slug", ""), "beforeCount": before, "afterCount": len(images[:5]), "strategy": "+".join(strategies)})
        final_props.append(prop)

    for source_file in (STRICT_EXPORT / "collections").glob("*.json"):
        if source_file.name == "properties.json":
            continue
        (collections_dir / source_file.name).write_text(source_file.read_text(encoding="utf-8"), encoding="utf-8")
    (collections_dir / "properties.json").write_text(json_util.dumps(final_props, indent=2), encoding="utf-8")

    with (OUTPUT_EXPORT / "horizontal_image_decision_audit.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["_id", "customId", "slug", "title", "url", "decision", "tier", "reason", "matchedTokens", "aspect", "topLabels"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(image_decisions)
    with (OUTPUT_EXPORT / "horizontal_image_fill_report.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["_id", "customId", "slug", "beforeCount", "afterCount", "strategy"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(fill_reports)
    with (OUTPUT_EXPORT / "area_field_corrections_from_description.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["_id", "customId", "slug", "matchedText", "sqft", "before", "after"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in area_reports:
            writer.writerow({**row, "before": json.dumps(row.get("before")), "after": json.dumps(row.get("after"))})
    with (OUTPUT_EXPORT / "horizontal_image_links_review.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["_id", "customId", "slug", "title", "sourceType", "image_count", "needsReplacementImages", "image_url_1", "image_url_2", "image_url_3", "image_url_4", "image_url_5"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for prop in final_props:
            imgs = prop_images(prop)
            imported = prop.get("externalSource", {}).get("sourceSystem") == "leasing.net.in"
            row = {
                "_id": str(prop.get("_id")),
                "customId": prop.get("details", {}).get("customId", ""),
                "slug": prop.get("description", {}).get("slug", ""),
                "title": prop.get("description", {}).get("title", ""),
                "sourceType": "imported" if imported else "original_bigcat_unchanged",
                "image_count": len(imgs),
                "needsReplacementImages": "Yes" if imported and len(imgs) < 5 else "No",
            }
            for i in range(5):
                row[f"image_url_{i+1}"] = imgs[i] if i < len(imgs) else ""
            writer.writerow(row)

    original = [p for p in final_props if p.get("externalSource", {}).get("sourceSystem") != "leasing.net.in"]
    imported = [p for p in final_props if p.get("externalSource", {}).get("sourceSystem") == "leasing.net.in"]
    identity_changes = []
    before_by_id = {str(p.get("_id")): p for p in source_props}
    for prop in final_props:
        before = before_by_id[str(prop.get("_id"))]
        for field, old, new in [
            ("_id", str(before.get("_id")), str(prop.get("_id"))),
            ("customId", before.get("details", {}).get("customId"), prop.get("details", {}).get("customId")),
            ("slug", before.get("description", {}).get("slug"), prop.get("description", {}).get("slug")),
            ("createdAt", str(before.get("createdAt")), str(prop.get("createdAt"))),
        ]:
            if old != new:
                identity_changes.append({"_id": str(prop.get("_id")), "field": field, "before": old, "after": new})
    manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "mode": "read_only_export_horizontal_building_images_people_allowed_if_building_visible",
        "propertiesTotal": len(final_props),
        "originalClientPropertiesCopiedUnchanged": len(original),
        "importedPropertiesProcessed": len(imported),
        "importedPropertiesWithFiveHorizontalBuildingImages": sum(1 for p in imported if len(prop_images(p)) >= 5),
        "importedPropertiesNeedingReplacementImages": sum(1 for p in imported if len(prop_images(p)) < 5),
        "areaFieldCorrectionsFromDescription": len(area_reports),
        "identityChanges": identity_changes,
        "notes": [
            "No SSH used.",
            "No PR created.",
            "No MongoDB writes performed.",
            "Original/client-entered BigCat records are copied unchanged from prior strict export.",
            "People inside an image are allowed when the image is horizontal and the building/property/signage is visible.",
            "Indoor room/chair/furniture images are rejected.",
        ],
    }
    (OUTPUT_EXPORT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (OUTPUT_EXPORT / "README.md").write_text("# JameenWallah Horizontal Building Image Export\n\nRead-only export. No SSH, no PR, no database writes.\n", encoding="utf-8")
    zip_path = zip_dir(OUTPUT_EXPORT)
    print(json.dumps({**manifest, "outputDir": str(OUTPUT_EXPORT), "zipPath": str(zip_path)}, indent=2))
    if identity_changes:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
