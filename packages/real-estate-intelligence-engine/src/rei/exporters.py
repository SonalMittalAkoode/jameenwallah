from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Iterable

from .models import PropertyProject


def flatten_project(project: PropertyProject) -> dict[str, str]:
    data = project.to_dict()
    return {
        "project_name": project.project_name,
        "builder_name": project.builder_name,
        "project_slug": project.project_slug,
        "category": project.category,
        "project_type": project.project_type,
        "status": project.project_status,
        "rera_number": project.rera_number,
        "city": project.city,
        "sector": project.sector,
        "address": project.address,
        "pincode": project.pincode,
        "latitude": "" if project.coordinates.lat is None else str(project.coordinates.lat),
        "longitude": "" if project.coordinates.lng is None else str(project.coordinates.lng),
        "starting_price_inr": "" if project.price.starting is None else str(project.price.starting),
        "ending_price_inr": "" if project.price.ending is None else str(project.price.ending),
        "price_per_sqft": "" if project.price.price_per_sqft is None else str(project.price.price_per_sqft),
        "configurations_json": json.dumps(data["configurations"], ensure_ascii=False),
        "amenities": " | ".join(project.amenities),
        "gallery_images": " | ".join(item.url for item in project.gallery_images),
        "floor_plans": " | ".join(item.url for item in project.floor_plans),
        "brochures": " | ".join(item.url for item in project.brochures),
        "videos": " | ".join(item.url for item in project.videos),
        "virtual_tours": " | ".join(project.virtual_tours),
        "description": project.project_description,
        "project_url": project.project_url,
        "source_name": project.source_name,
        "canonical_key": project.canonical_key,
    }


def write_projects_csv(projects: Iterable[PropertyProject], path: str | Path) -> None:
    rows = [flatten_project(project) for project in projects]
    if not rows:
        return
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
