from __future__ import annotations

import argparse
import json
from pathlib import Path

from .crawler import FetchPolicy
from .discover import DiscoveryConfig, discover_from_config, load_sources
from .deep_builder_database import build_gold_builder_database
from .fast_builder_finalize import build_fast_gold_database
from .image_completion import complete_property_images
from .pipeline import RealEstateIntelligencePipeline
from .storage import SQLiteProjectStore
from .local_database import build_local_database
from .refine_database import refine_database


def write_json(path: str | Path, data) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(prog="rei", description="Indian real estate intelligence crawler")
    sub = parser.add_subparsers(dest="command", required=True)

    discover_cmd = sub.add_parser("discover")
    discover_cmd.add_argument("--start-url", action="append", required=True)
    discover_cmd.add_argument("--include", action="append", default=[])
    discover_cmd.add_argument("--out", default="data/discovered_urls.json")
    discover_cmd.add_argument("--max-urls", type=int, default=1000)

    crawl_cmd = sub.add_parser("crawl-url")
    crawl_cmd.add_argument("url")
    crawl_cmd.add_argument("--source-name", default="")
    crawl_cmd.add_argument("--render-js", action="store_true")
    crawl_cmd.add_argument("--download-media", action="store_true")
    crawl_cmd.add_argument("--out", default="data/project.json")

    run_cmd = sub.add_parser("run-source")
    run_cmd.add_argument("--sources", default="config/sample_sources.json")
    run_cmd.add_argument("--source-name", default="")
    run_cmd.add_argument("--render-js", action="store_true")
    run_cmd.add_argument("--download-media", action="store_true")
    run_cmd.add_argument("--out-dir", default="data/rei")
    run_cmd.add_argument("--sqlite", default="data/rei.sqlite")

    local_db_cmd = sub.add_parser("build-local-db")
    local_db_cmd.add_argument("--sources", default="config/india_builder_sources.json")
    local_db_cmd.add_argument("--sqlite", default="data/local-property-db/properties.sqlite")
    local_db_cmd.add_argument("--out-dir", default="data/local-property-db")
    local_db_cmd.add_argument("--source-name", default="")
    local_db_cmd.add_argument("--max-per-source", type=int, default=None)

    refine_cmd = sub.add_parser("refine-db")
    refine_cmd.add_argument("--source-sqlite", default="data/local-property-db/properties.sqlite")
    refine_cmd.add_argument("--out-dir", default="data/refined-builder-db")
    refine_cmd.add_argument("--maps-api-key-env", default="GOOGLE_MAPS_API_KEY")
    refine_cmd.add_argument("--target-images", type=int, default=5)

    complete_images_cmd = sub.add_parser("complete-images")
    complete_images_cmd.add_argument("--input-csv", required=True)
    complete_images_cmd.add_argument("--out-dir", default="data/completed-property-images")
    complete_images_cmd.add_argument("--maps-api-key-env", default="GOOGLE_MAPS_API_KEY")
    complete_images_cmd.add_argument("--target-images", type=int, default=5)
    complete_images_cmd.add_argument("--min-width", type=int, default=500)
    complete_images_cmd.add_argument("--min-height", type=int, default=250)
    complete_images_cmd.add_argument("--request-timeout", type=int, default=12)
    complete_images_cmd.add_argument("--no-refresh-from-pages", action="store_true")
    complete_images_cmd.add_argument("--no-same-builder-for-upcoming", action="store_true")
    complete_images_cmd.add_argument("--allow-portrait", action="store_true")

    gold_cmd = sub.add_parser("build-gold-db")
    gold_cmd.add_argument("--input-csv", required=True)
    gold_cmd.add_argument("--out-dir", default="data/gold-builder-current-upcoming-db")
    gold_cmd.add_argument("--maps-api-key-env", default="GOOGLE_MAPS_API_KEY")
    gold_cmd.add_argument("--target-images", type=int, default=5)
    gold_cmd.add_argument("--min-width", type=int, default=500)
    gold_cmd.add_argument("--min-height", type=int, default=250)
    gold_cmd.add_argument("--request-timeout", type=int, default=10)

    fast_gold_cmd = sub.add_parser("build-fast-gold-db")
    fast_gold_cmd.add_argument("--properties-csv", default="data/exact-review-db/exact_properties_main_openable.csv")
    fast_gold_cmd.add_argument("--media-csv", default="data/exact-review-db/exact_property_media_openable.csv")
    fast_gold_cmd.add_argument("--out-dir", default="data/fast-gold-builder-current-upcoming-db")
    fast_gold_cmd.add_argument("--target-images", type=int, default=5)

    args = parser.parse_args()

    if args.command == "discover":
        urls = discover_from_config(DiscoveryConfig(args.start_url, include_patterns=args.include, max_urls=args.max_urls))
        write_json(args.out, urls)
        print(f"Discovered {len(urls)} URLs -> {args.out}")
        return

    if args.command == "crawl-url":
        pipeline = RealEstateIntelligencePipeline(
            output_dir=Path(args.out).parent,
            fetch_policy=FetchPolicy(render_javascript=args.render_js),
            download_media=args.download_media,
        )
        project, result = pipeline.crawl_and_extract_url(args.url, source_name=args.source_name)
        if not project:
            raise SystemExit(f"Failed: {result.error}")
        write_json(args.out, project.to_dict())
        print(f"Extracted {project.project_name or project.project_url} -> {args.out}")
        return

    if args.command == "run-source":
        config = load_sources(args.sources)
        sources = config.get("sources", [])
        if args.source_name:
            sources = [source for source in sources if source.get("name") == args.source_name]
        store = SQLiteProjectStore(args.sqlite)
        pipeline = RealEstateIntelligencePipeline(
            store=store,
            output_dir=args.out_dir,
            fetch_policy=FetchPolicy(render_javascript=args.render_js),
            download_media=args.download_media,
        )
        for source in sources:
            stats = pipeline.run_source(source)
            print(f"{source.get('name')}: {stats}")
        return

    if args.command == "build-local-db":
        stats = build_local_database(
            sources_path=args.sources,
            sqlite_path=args.sqlite,
            out_dir=args.out_dir,
            source_name=args.source_name,
            max_per_source=args.max_per_source,
        )
        print(json.dumps(stats, ensure_ascii=False, indent=2))
        return

    if args.command == "refine-db":
        import os

        summary = refine_database(
            source_db=Path(args.source_sqlite),
            output_dir=Path(args.out_dir),
            maps_api_key=os.environ.get(args.maps_api_key_env, ""),
            target_images=args.target_images,
        )
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return

    if args.command == "complete-images":
        import os

        summary = complete_property_images(
            input_csv=Path(args.input_csv),
            output_dir=Path(args.out_dir),
            maps_api_key=os.environ.get(args.maps_api_key_env, ""),
            target_images=args.target_images,
            min_width=args.min_width,
            min_height=args.min_height,
            horizontal_only=not args.allow_portrait,
            request_timeout=args.request_timeout,
            refresh_from_pages=not args.no_refresh_from_pages,
            same_builder_for_upcoming=not args.no_same_builder_for_upcoming,
        )
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return

    if args.command == "build-gold-db":
        import os

        summary = build_gold_builder_database(
            input_csv=Path(args.input_csv),
            output_dir=Path(args.out_dir),
            maps_api_key=os.environ.get(args.maps_api_key_env, ""),
            target_images=args.target_images,
            min_width=args.min_width,
            min_height=args.min_height,
            request_timeout=args.request_timeout,
        )
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return

    if args.command == "build-fast-gold-db":
        summary = build_fast_gold_database(
            properties_csv=Path(args.properties_csv),
            media_csv=Path(args.media_csv),
            output_dir=Path(args.out_dir),
            target_images=args.target_images,
        )
        print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
