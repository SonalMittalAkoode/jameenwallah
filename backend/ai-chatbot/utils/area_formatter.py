from collections import Counter, defaultdict
from typing import Dict, List, Optional, Tuple


def _get_city_area(prop: dict) -> Tuple[str, str]:
    loc = (prop or {}).get("location", {}) or {}

    city_name = ""
    area_name = ""

    city = loc.get("city")
    if isinstance(city, dict):
        city_name = city.get("name") or ""
    elif isinstance(city, str):
        city_name = city

    area = loc.get("area")
    if isinstance(area, dict):
        area_name = area.get("name") or ""
    elif isinstance(area, str):
        area_name = area

    return (city_name.strip(), area_name.strip())


def format_areas_for_ai(properties: List[dict], city_filter: Optional[str] = None) -> str:
    """
    Provide an "areas catalog" for the AI.
    If city_filter is provided, return areas within that city (with counts).
    Otherwise, return top areas grouped by city.
    """
    props = properties or []

    if city_filter:
        counter = Counter()
        for p in props:
            city, area = _get_city_area(p)
            if not city or not area:
                continue
            if city.lower().strip() != city_filter.lower().strip():
                continue
            counter[area] += 1

        if not counter:
            return ""

        top = counter.most_common(30)
        lines = [f"City: {city_filter}"]
        lines.append("Areas (with listing counts):")
        for area, cnt in top:
            lines.append(f"- {area} ({cnt})")
        return "\n".join(lines)

    # No city filter: group by city
    by_city = defaultdict(Counter)
    for p in props:
        city, area = _get_city_area(p)
        if not city or not area:
            continue
        by_city[city][area] += 1

    if not by_city:
        return ""

    out_lines = []
    for city in sorted(by_city.keys()):
        out_lines.append(f"City: {city}")
        for area, cnt in by_city[city].most_common(15):
            out_lines.append(f"- {area} ({cnt})")
        out_lines.append("")  # blank line between cities

    return "\n".join(out_lines).strip()

