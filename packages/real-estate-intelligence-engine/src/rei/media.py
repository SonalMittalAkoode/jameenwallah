from __future__ import annotations

import hashlib
import mimetypes
import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

import requests

from .models import DocumentAsset, MediaAsset


@dataclass
class MediaDownloadResult:
    downloaded: int = 0
    duplicates: int = 0
    failed: int = 0


def classify_media(url: str, alt: str = "", caption: str = "") -> str:
    text = f"{url} {alt} {caption}".lower()
    if "floor" in text and "plan" in text:
        return "floor_plan"
    if "master" in text and "plan" in text:
        return "master_plan"
    if "logo" in text:
        return "logo"
    if any(word in text for word in ("club", "pool", "gym", "amenity", "landscape")):
        return "amenity"
    if any(word in text for word in ("bedroom", "kitchen", "bathroom", "interior")):
        return "interior"
    if any(word in text for word in ("elevation", "tower", "facade", "exterior")):
        return "exterior"
    if "location" in text and "map" in text:
        return "location_map"
    return "gallery"


def safe_filename(url: str, fallback: str = "asset") -> str:
    parsed = urlparse(url)
    name = Path(parsed.path).name or fallback
    name = re.sub(r"[^A-Za-z0-9._-]+", "-", name)[:120]
    if "." not in name:
        ext = mimetypes.guess_extension(mimetypes.guess_type(url)[0] or "") or ".bin"
        name += ext
    return name


class MediaDownloader:
    def __init__(self, output_dir: str | Path, timeout_seconds: int = 40) -> None:
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.timeout_seconds = timeout_seconds
        self._hashes: set[str] = set()

    def download_media(self, assets: list[MediaAsset], namespace: str = "project") -> MediaDownloadResult:
        result = MediaDownloadResult()
        target_dir = self.output_dir / namespace / "images"
        target_dir.mkdir(parents=True, exist_ok=True)
        for asset in assets:
            try:
                response = requests.get(asset.url, timeout=self.timeout_seconds)
                response.raise_for_status()
                digest = hashlib.sha256(response.content).hexdigest()
                asset.sha256 = digest
                asset.mime_type = response.headers.get("content-type", "")
                if digest in self._hashes:
                    asset.is_duplicate = True
                    result.duplicates += 1
                    continue
                self._hashes.add(digest)
                asset.asset_type = classify_media(asset.url, asset.alt, asset.caption)
                filename = f"{asset.asset_type}-{digest[:12]}-{safe_filename(asset.url)}"
                path = target_dir / filename
                path.write_bytes(response.content)
                asset.local_path = str(path)
                result.downloaded += 1
            except Exception:
                result.failed += 1
        return result

    def download_documents(self, documents: list[DocumentAsset], namespace: str = "project") -> MediaDownloadResult:
        result = MediaDownloadResult()
        target_dir = self.output_dir / namespace / "documents"
        target_dir.mkdir(parents=True, exist_ok=True)
        for document in documents:
            try:
                response = requests.get(document.url, timeout=self.timeout_seconds)
                response.raise_for_status()
                digest = hashlib.sha256(response.content).hexdigest()
                document.sha256 = digest
                if digest in self._hashes:
                    result.duplicates += 1
                    continue
                self._hashes.add(digest)
                path = target_dir / f"{document.document_type}-{digest[:12]}-{safe_filename(document.url, 'document.pdf')}"
                path.write_bytes(response.content)
                document.local_path = str(path)
                result.downloaded += 1
            except Exception:
                result.failed += 1
        return result
