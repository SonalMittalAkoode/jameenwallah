from __future__ import annotations

import hashlib
import json
from typing import Any

from .models import ChangeEvent, PropertyProject


def stable_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, ensure_ascii=True, default=str)


def project_fingerprint(project: PropertyProject) -> str:
    data = project.to_dict()
    data.pop("extracted_at", None)
    data.pop("raw", None)
    return hashlib.sha256(stable_json(data).encode("utf-8")).hexdigest()


def diff_projects(before: dict[str, Any] | None, after: PropertyProject) -> list[ChangeEvent]:
    if not before:
        return [ChangeEvent("new_project", after.canonical_key, after.project_name, after.project_url, after=after.to_dict())]

    events: list[ChangeEvent] = []
    after_dict = after.to_dict()
    checks = {
        "price_change": "price",
        "status_change": "project_status",
        "possession_change": "possession_date",
        "media_change": "gallery_images",
        "inventory_change": "configurations",
    }
    for event_type, field in checks.items():
        if before.get(field) != after_dict.get(field):
            events.append(
                ChangeEvent(
                    event_type=event_type,
                    canonical_key=after.canonical_key,
                    project_name=after.project_name,
                    source_url=after.project_url,
                    before={field: before.get(field)},
                    after={field: after_dict.get(field)},
                )
            )
    return events
