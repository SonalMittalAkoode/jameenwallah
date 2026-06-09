#!/usr/bin/env python3
import hashlib
import json
import os
import re
import shutil
import sys
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from copy import deepcopy
from pathlib import Path
from urllib.parse import urlparse

import cv2
import numpy as np
import requests

REPO = Path("/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-06/jameenwallah-pr-real")
BACKEND = REPO / "backend"
RUNTIME_FILE = BACKEND / ".local-stack-runtime.json"
OUTPUT_ROOT = REPO / "database-exports"
CACHE_DIR = OUTPUT_ROOT / "_image-verify-cache"

sys.path.insert(0, "/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-18/scrape-this-website-logo-call-91/.pydeps")
from bson import json_util  # noqa: E402
from pymongo import MongoClient  # noqa: E402


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

TRUSTED_HOSTS = {
    "lh3.googleusercontent.com",
    "maps.googleapis.com",
    "jameenwallah.com",
    "www.jameenwallah.com",
    "jameenwallah.akoodedemo.com",
    "localhost",
    "127.0.0.1",
}

PERSON_URL_RE = re.compile(
    r"\b(agent|avatar|broker|customer|director|face|headshot|human|owner|passport|people|person|portrait|"
    r"profile|selfie|staff|team|testimonial|user|whatsapp|profile[-_ ]?photo|display[-_ ]?picture)\b",
    re.I,
)

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

SKIP_TEXT_PATHS = {
    "_id",
    "createdAt",
    "updatedAt",
    "description.slug",
    "details.customId",
}

SKIP_TEXT_PREFIXES = (
    "externalSource.",
    "media.",
)


def clean_timestamp():
    return time.strftime("%Y-%m-%dT%H-%M-%S", time.gmtime())


def host_of(url):
    text = str(url or "").strip()
    if not text or text.startswith("/"):
        return ""
    try:
        return urlparse(text).netloc.lower()
    except Exception:
        return ""


def is_trusted_host_or_local(url):
    text = str(url or "").strip()
    if text.startswith("/images/") or text.startswith("/assets/") or text.startswith("/uploads/"):
        return True
    host = host_of(text)
    return host in TRUSTED_HOSTS or host.endswith(".jameenwallah.com")


def image_path_for(url):
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()
    return CACHE_DIR / f"{digest}.img"


def download_image(url):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = image_path_for(url)
    if path.exists() and path.stat().st_size > 0:
        return path
    response = requests.get(url, timeout=12, headers={"User-Agent": "JameenWallah-image-audit/1.0"})
    response.raise_for_status()
    path.write_bytes(response.content)
    return path


def load_cv_image(path):
    data = np.frombuffer(path.read_bytes(), dtype=np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_COLOR)


def detect_people_or_faces(url):
    text = str(url or "").strip()
    if not text.startswith("http"):
        return {"checked": False, "people_detected": False, "reasons": []}
    try:
        path = download_image(text)
        image = load_cv_image(path)
        if image is None:
            return {"checked": True, "people_detected": True, "reasons": ["unreadable downloaded image"]}

        height, width = image.shape[:2]
        scale = min(900 / max(width, height), 1.0)
        if scale < 1.0:
            image = cv2.resize(image, (int(width * scale), int(height * scale)), interpolation=cv2.INTER_AREA)

        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
        hog = cv2.HOGDescriptor()
        hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.08, minNeighbors=5, minSize=(28, 28))
        profile_faces = profile_cascade.detectMultiScale(gray, scaleFactor=1.08, minNeighbors=5, minSize=(28, 28))
        face_count = len(faces) + len(profile_faces)

        person_count = 0
        if min(image.shape[:2]) >= 220:
            resized = image
            rects, weights = hog.detectMultiScale(
                resized,
                winStride=(8, 8),
                padding=(8, 8),
                scale=1.05,
            )
            person_count = sum(1 for weight in weights if float(weight) > 0.35)

        reasons = []
        if face_count:
            reasons.append(f"face detected: {face_count}")
        if person_count:
            reasons.append(f"standing/person body detected: {person_count}")
        return {"checked": True, "people_detected": bool(reasons), "reasons": reasons}
    except Exception as exc:
        return {"checked": True, "people_detected": True, "reasons": [f"image verification failed: {type(exc).__name__}"]}


def verify_urls_parallel(urls, verification_cache, cache_path, max_workers=24):
    pending = sorted(set(url for url in urls if url not in verification_cache))
    if not pending:
        return
    print(f"Verifying {len(pending)} unique trusted external image URLs...", flush=True)
    completed = 0
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {pool.submit(detect_people_or_faces, url): url for url in pending}
        for future in as_completed(futures):
            url = futures[future]
            try:
                verification_cache[url] = future.result()
            except Exception as exc:
                verification_cache[url] = {
                    "checked": True,
                    "people_detected": True,
                    "reasons": [f"image verification failed: {type(exc).__name__}"],
                }
            completed += 1
            if completed % 50 == 0 or completed == len(pending):
                cache_path.write_text(json.dumps(verification_cache, indent=2), encoding="utf-8")
                print(f"Verified {completed}/{len(pending)} image URLs", flush=True)


def url_reasons(url, verification_cache):
    text = str(url or "").strip()
    reasons = []
    if not text:
        reasons.append("empty URL")
        return reasons
    decoded = text
    try:
        from urllib.parse import unquote

        decoded = unquote(text)
    except Exception:
        pass
    host = host_of(text)
    if host in KNOWN_BAD_HOSTS:
        reasons.append(f"known third-party host: {host}")
    if PERSON_URL_RE.search(decoded):
        reasons.append("person/profile-like URL")
    if not is_trusted_host_or_local(text):
        reasons.append(f"untrusted gallery host: {host or 'relative path outside approved folders'}")
    if text.startswith("http") and is_trusted_host_or_local(text):
        if text not in verification_cache:
            verification_cache[text] = detect_people_or_faces(text)
        detection = verification_cache[text]
        if detection.get("people_detected"):
            reasons.extend(detection.get("reasons") or ["people/person detected"])
    return reasons


def parse_num(value):
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(re.sub(r"[^\d.]", "", str(value or "")))
    except Exception:
        return None


def same_tiny(value, expected):
    parsed = parse_num(value)
    return parsed is not None and abs(parsed - expected) < 0.001


def sanitize_text(value):
    next_value = value
    for regex, replacement in BRANDING_REPLACEMENTS:
        next_value = regex.sub(replacement, next_value)
    if next_value != value:
        return re.sub(r"[ \t]{2,}", " ", next_value).strip()
    return value


def sanitize_public_strings(value, path="", changes=None):
    if changes is None:
        changes = []
    if isinstance(value, str):
        if path in SKIP_TEXT_PATHS or any(path.startswith(prefix) for prefix in SKIP_TEXT_PREFIXES):
            return value
        next_value = sanitize_text(value)
        if next_value != value:
            changes.append({"path": path, "before": value, "after": next_value})
        return next_value
    if isinstance(value, list):
        return [sanitize_public_strings(item, f"{path}.{idx}" if path else str(idx), changes) for idx, item in enumerate(value)]
    if isinstance(value, dict):
        for key in list(value.keys()):
            next_path = f"{path}.{key}" if path else key
            value[key] = sanitize_public_strings(value[key], next_path, changes)
    return value


def export_collections(db, root, collections):
    collections_dir = root / "collections"
    collections_dir.mkdir(parents=True, exist_ok=True)
    manifest = {"exportedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "database": db.name, "collections": {}}
    for name in collections:
        docs = list(db[name].find({}))
        manifest["collections"][name] = len(docs)
        (collections_dir / f"{name}.json").write_text(json_util.dumps(docs, indent=2), encoding="utf-8")
    (root / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def zip_dir(root):
    zip_path = root.with_suffix(".zip")
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in root.rglob("*"):
            archive.write(path, path.relative_to(root.parent))
    return zip_path


def apply_property_cleanup(property_doc, verification_cache):
    doc = deepcopy(property_doc)
    slug = str(doc.get("description", {}).get("slug", "")).lower()
    report = {
        "_id": str(doc.get("_id")),
        "customId": doc.get("details", {}).get("customId"),
        "slug": slug,
        "title": doc.get("description", {}).get("title"),
        "sizeUpdated": False,
        "imageUpdated": False,
        "textUpdated": False,
        "removedImages": [],
        "textChanges": [],
    }

    correction = SIZE_CORRECTIONS.get(slug)
    if correction:
        details = doc.setdefault("details", {})
        before = {
            "sizeInSqFt": details.get("sizeInSqFt"),
            "totalAreaInSqFt": details.get("totalAreaInSqFt"),
            "floorPlans": [
                {"superBuiltUpArea": plan.get("superBuiltUpArea")}
                for plan in doc.get("description", {}).get("floorPlans", [])
            ],
        }
        if same_tiny(details.get("sizeInSqFt"), correction["current"]):
            details["sizeInSqFt"] = correction["value"]
            report["sizeUpdated"] = True
        if same_tiny(details.get("totalAreaInSqFt"), correction["current"]):
            details["totalAreaInSqFt"] = correction["value"]
            report["sizeUpdated"] = True
        for plan in doc.get("description", {}).get("floorPlans", []) or []:
            if same_tiny(plan.get("superBuiltUpArea"), correction["current"]):
                plan["superBuiltUpArea"] = correction["value"]
                report["sizeUpdated"] = True
        if report["sizeUpdated"]:
            report["sizeBefore"] = before
            report["sizeAfter"] = {
                "sizeInSqFt": details.get("sizeInSqFt"),
                "totalAreaInSqFt": details.get("totalAreaInSqFt"),
                "floorPlans": [
                    {"superBuiltUpArea": plan.get("superBuiltUpArea")}
                    for plan in doc.get("description", {}).get("floorPlans", [])
                ],
            }

    images = doc.get("media", {}).get("images", [])
    if isinstance(images, list):
        kept = []
        seen = set()
        for image in images:
            image_value = str(image or "").strip()
            reasons = url_reasons(image_value, verification_cache)
            if reasons:
                report["removedImages"].append({"image": image_value, "reasons": reasons})
                continue
            if image_value in seen:
                report["removedImages"].append({"image": image_value, "reasons": ["duplicate gallery URL"]})
                continue
            seen.add(image_value)
            kept.append(image_value)
        if kept != images:
            doc.setdefault("media", {})["images"] = kept
            report["imageUpdated"] = True

    sanitize_public_strings(doc, changes=report["textChanges"])
    report["textUpdated"] = bool(report["textChanges"])
    return doc, report


def identity(doc):
    return {
        "_id": str(doc.get("_id")),
        "customId": doc.get("details", {}).get("customId"),
        "slug": doc.get("description", {}).get("slug"),
        "createdAt": str(doc.get("createdAt")),
    }


def branding_leaks(doc, path=""):
    leaks = []
    if isinstance(doc, str):
        if (
            path not in SKIP_TEXT_PATHS
            and not any(path.startswith(prefix) for prefix in SKIP_TEXT_PREFIXES)
            and re.search(r"leasing\.net(?:\.in)?|BigCat|Imported from leasing\.net\.in|property listings imported from leasing\.net\.in", doc, re.I)
        ):
            leaks.append({"path": path, "value": doc})
    elif isinstance(doc, list):
        for idx, item in enumerate(doc):
            leaks.extend(branding_leaks(item, f"{path}.{idx}" if path else str(idx)))
    elif isinstance(doc, dict):
        for key, item in doc.items():
            leaks.extend(branding_leaks(item, f"{path}.{key}" if path else key))
    return leaks


def main():
    runtime = json.loads(RUNTIME_FILE.read_text(encoding="utf-8"))
    client = MongoClient(runtime["mongoUri"], serverSelectionTimeoutMS=5000)
    db = client.get_default_database()
    db.command("ping")

    timestamp = clean_timestamp()
    untouched_backup = OUTPUT_ROOT / f"jameenwallah-untouched-backup-before-verified-clean-{timestamp}"
    clean_export = OUTPUT_ROOT / f"jameenwallah-verified-clean-export-{timestamp}"
    untouched_backup.mkdir(parents=True, exist_ok=True)
    clean_export.mkdir(parents=True, exist_ok=True)

    collections = sorted(db.list_collection_names())
    backup_manifest = export_collections(db, untouched_backup, collections)
    backup_zip = zip_dir(untouched_backup)

    verification_cache_path = CACHE_DIR / "verification-cache.json"
    if verification_cache_path.exists():
        verification_cache = json.loads(verification_cache_path.read_text(encoding="utf-8"))
    else:
        verification_cache = {}

    all_properties_for_verification = list(db["properties"].find({}, {"media.images": 1}))
    trusted_external_urls = []
    for property_doc in all_properties_for_verification:
        for image in property_doc.get("media", {}).get("images", []) or []:
            image_value = str(image or "").strip()
            if image_value.startswith("http") and is_trusted_host_or_local(image_value):
                trusted_external_urls.append(image_value)
    verify_urls_parallel(trusted_external_urls, verification_cache, verification_cache_path)

    clean_collections = clean_export / "collections"
    clean_collections.mkdir(parents=True, exist_ok=True)

    reports = []
    original_identities = {}
    corrected_properties = []
    for name in collections:
        docs = list(db[name].find({}))
        if name == "properties":
            for doc in docs:
                original_identities[str(doc["_id"])] = identity(doc)
                corrected, report = apply_property_cleanup(doc, verification_cache)
                corrected_properties.append(corrected)
                if report["sizeUpdated"] or report["imageUpdated"] or report["textUpdated"]:
                    reports.append(report)
            output_docs = corrected_properties
        else:
            output_docs = docs
        (clean_collections / f"{name}.json").write_text(json_util.dumps(output_docs, indent=2), encoding="utf-8")

    verification_cache_path.write_text(json.dumps(verification_cache, indent=2), encoding="utf-8")

    identity_changes = []
    for doc in corrected_properties:
        before = original_identities.get(str(doc["_id"]))
        after = identity(doc)
        if before != after:
            identity_changes.append({"before": before, "after": after})

    remaining_bad_images = []
    remaining_branding = []
    for doc in corrected_properties:
        for image in doc.get("media", {}).get("images", []) or []:
            reasons = url_reasons(str(image), verification_cache)
            if reasons:
                remaining_bad_images.append({"_id": str(doc["_id"]), "slug": doc.get("description", {}).get("slug"), "image": image, "reasons": reasons})
        for leak in branding_leaks(doc):
            remaining_branding.append({"_id": str(doc["_id"]), "slug": doc.get("description", {}).get("slug"), **leak})

    size_failures = []
    for slug, correction in SIZE_CORRECTIONS.items():
        doc = next((item for item in corrected_properties if str(item.get("description", {}).get("slug", "")).lower() == slug), None)
        if not doc:
            size_failures.append({"slug": slug, "reason": "missing"})
        elif doc.get("details", {}).get("sizeInSqFt") != correction["value"]:
            size_failures.append({"slug": slug, "actual": doc.get("details", {}).get("sizeInSqFt"), "expected": correction["value"]})

    manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "mode": "read_only_export_no_database_writes",
        "database": db.name,
        "untouchedBackupDir": str(untouched_backup),
        "untouchedBackupZip": str(backup_zip),
        "collections": backup_manifest["collections"],
        "propertiesScanned": len(corrected_properties),
        "propertiesUpdatedForSize": sum(1 for item in reports if item["sizeUpdated"]),
        "propertiesUpdatedForImageCleanup": sum(1 for item in reports if item["imageUpdated"]),
        "propertiesUpdatedForTextCleanup": sum(1 for item in reports if item["textUpdated"]),
        "totalImageUrlsRemoved": sum(len(item["removedImages"]) for item in reports),
        "identityChanges": identity_changes,
        "remainingBadImages": remaining_bad_images,
        "remainingBrandingLeaks": remaining_branding,
        "sizeFailures": size_failures,
        "updates": reports,
    }
    (clean_export / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (clean_export / "README.md").write_text(
        "# JameenWallah Verified Clean Export\n\n"
        "This export was generated without writing to MongoDB.\n\n"
        "- `collections/` contains the corrected Extended JSON collection exports.\n"
        "- `manifest.json` contains the audit trail, removed images, size fixes, and validation results.\n"
        "- The untouched pre-cleanup backup is stored separately and zipped.\n",
        encoding="utf-8",
    )
    clean_zip = zip_dir(clean_export)

    client.close()

    print(
        json.dumps(
            {
                "generatedAt": manifest["generatedAt"],
                "mode": manifest["mode"],
                "database": manifest["database"],
                "untouchedBackupDir": manifest["untouchedBackupDir"],
                "untouchedBackupZip": manifest["untouchedBackupZip"],
                "cleanExportDir": str(clean_export),
                "cleanExportZip": str(clean_zip),
                "propertiesScanned": manifest["propertiesScanned"],
                "propertiesUpdatedForSize": manifest["propertiesUpdatedForSize"],
                "propertiesUpdatedForImageCleanup": manifest["propertiesUpdatedForImageCleanup"],
                "propertiesUpdatedForTextCleanup": manifest["propertiesUpdatedForTextCleanup"],
                "totalImageUrlsRemoved": manifest["totalImageUrlsRemoved"],
                "identityChanges": len(manifest["identityChanges"]),
                "remainingBadImages": len(manifest["remainingBadImages"]),
                "remainingBrandingLeaks": len(manifest["remainingBrandingLeaks"]),
                "sizeFailures": len(manifest["sizeFailures"]),
            },
            indent=2,
        )
    )
    if identity_changes or remaining_bad_images or remaining_branding or size_failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
