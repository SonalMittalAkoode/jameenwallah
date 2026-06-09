from __future__ import annotations

import json
import sqlite3
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

from .models import ChangeEvent, PropertyProject
from .monitor import project_fingerprint


class ProjectStore(ABC):
    @abstractmethod
    def get_project(self, canonical_key: str) -> dict[str, Any] | None:
        raise NotImplementedError

    @abstractmethod
    def upsert_project(self, project: PropertyProject) -> None:
        raise NotImplementedError

    @abstractmethod
    def save_events(self, events: list[ChangeEvent]) -> None:
        raise NotImplementedError


class SQLiteProjectStore(ProjectStore):
    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.connection = sqlite3.connect(self.path)
        self.connection.row_factory = sqlite3.Row
        self._init_schema()

    def _init_schema(self) -> None:
        self.connection.executescript(
            """
            create table if not exists projects (
                canonical_key text primary key,
                project_name text,
                builder_name text,
                city text,
                source_url text,
                fingerprint text,
                data_json text not null,
                updated_at text not null
            );

            create table if not exists snapshots (
                id integer primary key autoincrement,
                canonical_key text not null,
                fingerprint text not null,
                data_json text not null,
                created_at text not null
            );

            create table if not exists change_events (
                id integer primary key autoincrement,
                event_type text not null,
                canonical_key text not null,
                project_name text,
                source_url text,
                before_json text,
                after_json text,
                created_at text not null
            );
            """
        )
        self.connection.commit()

    def get_project(self, canonical_key: str) -> dict[str, Any] | None:
        row = self.connection.execute("select data_json from projects where canonical_key = ?", (canonical_key,)).fetchone()
        return json.loads(row["data_json"]) if row else None

    def upsert_project(self, project: PropertyProject) -> None:
        data = project.to_dict()
        fingerprint = project_fingerprint(project)
        payload = json.dumps(data, ensure_ascii=False, sort_keys=True)
        self.connection.execute(
            """
            insert into projects (canonical_key, project_name, builder_name, city, source_url, fingerprint, data_json, updated_at)
            values (?, ?, ?, ?, ?, ?, ?, ?)
            on conflict(canonical_key) do update set
                project_name = excluded.project_name,
                builder_name = excluded.builder_name,
                city = excluded.city,
                source_url = excluded.source_url,
                fingerprint = excluded.fingerprint,
                data_json = excluded.data_json,
                updated_at = excluded.updated_at
            """,
            (
                project.canonical_key,
                project.project_name,
                project.builder_name,
                project.city,
                project.project_url,
                fingerprint,
                payload,
                project.extracted_at,
            ),
        )
        self.connection.execute(
            "insert into snapshots (canonical_key, fingerprint, data_json, created_at) values (?, ?, ?, ?)",
            (project.canonical_key, fingerprint, payload, project.extracted_at),
        )
        self.connection.commit()

    def save_events(self, events: list[ChangeEvent]) -> None:
        self.connection.executemany(
            """
            insert into change_events (event_type, canonical_key, project_name, source_url, before_json, after_json, created_at)
            values (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    event.event_type,
                    event.canonical_key,
                    event.project_name,
                    event.source_url,
                    json.dumps(event.before, ensure_ascii=False),
                    json.dumps(event.after, ensure_ascii=False),
                    event.created_at,
                )
                for event in events
            ],
        )
        self.connection.commit()


class MongoProjectStore(ProjectStore):
    def __init__(self, mongo_uri: str, database: str = "real_estate_intelligence") -> None:
        try:
            from pymongo import MongoClient
        except ImportError as exc:
            raise RuntimeError("Install optional stores extra: pip install .[stores]") from exc
        self.client = MongoClient(mongo_uri)
        self.collection = self.client[database]["projects"]
        self.events = self.client[database]["change_events"]

    def get_project(self, canonical_key: str) -> dict[str, Any] | None:
        return self.collection.find_one({"canonical_key": canonical_key}, {"_id": 0})

    def upsert_project(self, project: PropertyProject) -> None:
        self.collection.update_one({"canonical_key": project.canonical_key}, {"$set": project.to_dict()}, upsert=True)

    def save_events(self, events: list[ChangeEvent]) -> None:
        if events:
            self.events.insert_many([event.__dict__ for event in events])


class PlaceholderStore(ProjectStore):
    def __init__(self, name: str) -> None:
        self.name = name

    def get_project(self, canonical_key: str) -> dict[str, Any] | None:
        return None

    def upsert_project(self, project: PropertyProject) -> None:
        raise NotImplementedError(f"{self.name} adapter is a deployment integration point.")

    def save_events(self, events: list[ChangeEvent]) -> None:
        raise NotImplementedError(f"{self.name} adapter is a deployment integration point.")
