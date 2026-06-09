import re
from typing import Dict, Iterable, List, Optional, Set


PROPERTY_LISTING_INTENT_KEYWORDS = {
    "property",
    "properties",
    "listing",
    "listings",
    "flat",
    "flats",
    "apartment",
    "apartments",
    "villa",
    "villas",
    "plot",
    "plots",
    "builder",
    "project",
    "projects",
    "bhk",
    "rent",
    "rental",
    "lease",
    "buy",
    "purchase",
    "sale",
    "budget",
    "under",
    "below",
    "within",
    "sqft",
}

AREA_SUGGESTION_INTENT_KEYWORDS = {
    "area",
    "areas",
    "locality",
    "localities",
    "sector",
    "sectors",
    "neighborhood",
    "neighbourhood",
    "where to buy",
    "where should i buy",
    "best area",
    "best areas",
    "good area",
    "good areas",
    "top areas",
    "which area",
    "which areas",
    "recommended areas",
    "area suggestions",
    "locality suggestions",
    "where to invest",
    "best places",
    "places to buy",
    "places to invest",
}


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def is_property_intent(text: str) -> bool:
    t = _norm(text)
    return any(k in t for k in PROPERTY_LISTING_INTENT_KEYWORDS)


def is_area_intent(text: str) -> bool:
    """
    True when user is asking for area/locality recommendations (not specific property listings).
    We treat it as area intent only if area keywords appear and listing keywords DO NOT appear.
    """
    t = _norm(text)
    has_area = any(k in t for k in AREA_SUGGESTION_INTENT_KEYWORDS)
    has_listing = any(k in t for k in PROPERTY_LISTING_INTENT_KEYWORDS)
    return has_area and not has_listing


def detect_intent_mode(text: str) -> str:
    """
    Returns: 'areas' | 'properties' | 'general'
    """
    if is_area_intent(text):
        return "areas"
    if is_property_intent(text):
        return "properties"
    return "general"


def extract_sector_phrase(text: str) -> Optional[str]:
    """
    Returns a normalized sector phrase like 'sector 63' or 'sector 63a' if present.
    """
    t = _norm(text)
    m = re.search(r"\bsector\s*([0-9]{1,3}\s*[a-z]?)\b", t)
    if not m:
        return None
    return f"sector {m.group(1).replace(' ', '')}"


def _find_known_location_match(text: str, known: Iterable[str]) -> Optional[str]:
    """
    Find the best (longest) known location name present in the text.
    """
    t = _norm(text)
    candidates = sorted({k for k in known if k}, key=lambda x: len(x), reverse=True)
    for cand in candidates:
        cand_norm = _norm(cand)
        if not cand_norm:
            continue
        # word-boundary-ish match to avoid partials where possible
        if re.search(rf"(^|[\s,./-]){re.escape(cand_norm)}($|[\s,./-])", t):
            return cand
    return None


def _extract_location_phrase_fallback(text: str) -> Optional[str]:
    """
    Lightweight heuristic for phrases like:
      - "properties in Sohna Road, Gurgaon"
      - "in DLF Alameda"
      - "near Sector 63 Noida"
    This is used only when we can't match any known city/area names.
    """
    t = (text or "").strip()
    if not t:
        return None

    m = re.search(r"\b(in|at|near|around)\s+([^?.!\n]{2,60})", t, flags=re.IGNORECASE)
    if not m:
        return None

    phrase = m.group(2).strip()
    # Stop at common query continuations
    phrase = re.split(
        r"\b(for|with|under|below|above|between|along|from|to)\b", phrase, maxsplit=1, flags=re.IGNORECASE
    )[0].strip()

    # Trim trailing punctuation
    phrase = phrase.rstrip(").,;:!?")

    # Keep it short-ish
    words = phrase.split()
    if len(words) > 6:
        phrase = " ".join(words[:6])

    return phrase or None


def resolve_requested_location(
    user_message: str,
    history: List[dict],
    known_cities: Set[str],
    known_areas: Set[str],
) -> Dict[str, Optional[str]]:
    """
    Resolve a requested location from user message + history.
    Returns:
      - city: best matched city (may be None)
      - area: best matched area/sector phrase (may be None)
      - raw: fallback phrase if no known match
      - label: human label (area, city, raw)
      - filter_applied: whether we should scope DB results by this location
    """
    message = user_message or ""

    city = _find_known_location_match(message, known_cities)
    area = _find_known_location_match(message, known_areas)

    sector = extract_sector_phrase(message)
    if sector and not area:
        area = sector

    # If sector/area mentioned without city, try to inherit last city from history
    if (area or sector) and not city and history:
        # scan last 10 messages for a city mention
        for msg in reversed(history[-10:]):
            text = (msg or {}).get("text", "")
            hist_city = _find_known_location_match(text, known_cities)
            if hist_city:
                city = hist_city
                break

    # If user asks for areas in general ("best areas", "good localities") without city,
    # try to infer the city from recent conversation context.
    if not city and history:
        for msg in reversed(history[-10:]):
            text = (msg or {}).get("text", "")
            hist_city = _find_known_location_match(text, known_cities)
            if hist_city:
                city = hist_city
                break

    raw = None
    if not city and not area:
        raw = _extract_location_phrase_fallback(message)

    label_parts = []
    if area:
        label_parts.append(area)
    if city:
        label_parts.append(city)
    label = ", ".join(label_parts) if label_parts else (raw or None)

    # We consider a location "requested" if we found city/area/sector or a fallback phrase.
    filter_applied = bool(label)

    return {
        "city": city,
        "area": area,
        "raw": raw,
        "label": label,
        "filter_applied": filter_applied,
    }


def property_matches_location(
    prop: dict,
    city: Optional[str] = None,
    area: Optional[str] = None,
    raw: Optional[str] = None,
) -> bool:
    loc = (prop or {}).get("location", {}) or {}
    city_name = ""
    area_name = ""

    c = loc.get("city")
    if isinstance(c, dict):
        city_name = c.get("name") or ""
    elif isinstance(c, str):
        city_name = c

    a = loc.get("area")
    if isinstance(a, dict):
        area_name = a.get("name") or ""
    elif isinstance(a, str):
        area_name = a

    address = loc.get("address") or ""

    hay = " | ".join([city_name, area_name, address])
    hay_n = _norm(hay)

    if city:
        if _norm(city) not in hay_n:
            return False

    if area:
        if _norm(area) not in hay_n:
            return False

    if raw and not city and not area:
        if _norm(raw) not in hay_n:
            return False

    return True


def filter_properties_for_location(
    properties: List[dict],
    city: Optional[str] = None,
    area: Optional[str] = None,
    raw: Optional[str] = None,
) -> List[dict]:
    return [
        p
        for p in (properties or [])
        if property_matches_location(p, city=city, area=area, raw=raw)
    ]

