from __future__ import annotations

import re
from decimal import Decimal

try:
    from slugify import slugify
except ImportError:
    def slugify(value: str) -> str:
        value = re.sub(r"[^A-Za-z0-9]+", "-", value).strip("-")
        return re.sub(r"-+", "-", value).lower()

from .models import Price

CITY_ALIASES = {
    "gurgaon": "Gurugram",
    "gurugram": "Gurugram",
    "noida": "Noida",
    "greater noida": "Greater Noida",
    "new delhi": "Delhi",
    "delhi ncr": "Delhi NCR",
}

PROPERTY_TYPE_ALIASES = {
    "flat": "Apartment",
    "apartment": "Apartment",
    "builder floor": "Builder Floor",
    "independent floor": "Builder Floor",
    "villa": "Villa",
    "farm house": "Farm House",
    "office": "Office Space",
    "retail": "Retail Shop",
    "sco": "SCO Plot",
}


def normalize_city(value: str) -> str:
    text = " ".join(str(value or "").split()).lower()
    return CITY_ALIASES.get(text, text.title())


def normalize_builder_name(value: str) -> str:
    text = re.sub(r"\b(ltd|limited|pvt|private|india|group|developers?)\b\.?", "", str(value or ""), flags=re.I)
    text = re.sub(r"\s+", " ", text).strip()
    return text.title()


def normalize_property_type(value: str) -> str:
    text = str(value or "").strip().lower()
    for key, normalized in PROPERTY_TYPE_ALIASES.items():
        if key in text:
            return normalized
    return text.title()


def make_project_slug(builder: str, project: str, city: str = "", sector: str = "") -> str:
    return slugify(" ".join(part for part in [builder, project, sector, city] if part))


def parse_inr_price(raw: str) -> int | None:
    text = str(raw or "").replace(",", "").strip().lower()
    if not text:
        return None
    match = re.search(r"(\d+(?:\.\d+)?)\s*(cr|crore|crores|lac|lakh|lakhs|k)?", text)
    if not match:
        return None
    amount = Decimal(match.group(1))
    unit = match.group(2) or ""
    if unit in {"cr", "crore", "crores"}:
        amount *= Decimal("10000000")
    elif unit in {"lac", "lakh", "lakhs"}:
        amount *= Decimal("100000")
    elif unit == "k":
        amount *= Decimal("1000")
    return int(amount)


def normalize_price(raw: str) -> Price:
    text = str(raw or "")
    values = [parse_inr_price(part) for part in re.split(r"\bto\b|[-–]", text, flags=re.I)]
    values = [value for value in values if value]
    price = Price(raw=text)
    if values:
        price.starting = values[0]
        price.minimum_price = min(values)
        price.maximum_price = max(values)
        price.ending = values[-1] if len(values) > 1 else None
        price.crores = round(price.minimum_price / 10000000, 3)
        price.lakhs = round(price.minimum_price / 100000, 3)
    ppsf = re.search(r"(\d[\d,]*(?:\.\d+)?)\s*(?:/|per)?\s*sq\.?\s*ft", text, re.I)
    if ppsf:
        price.price_per_sqft = int(float(ppsf.group(1).replace(",", "")))
    return price


def parse_area_sqft(raw: str) -> float | None:
    text = str(raw or "").replace(",", "").lower()
    match = re.search(r"(\d+(?:\.\d+)?)\s*(acre|acres|sq\.?\s*ft|sqft|sq\.ft|square\s*feet)", text)
    if not match:
        return None
    value = float(match.group(1))
    unit = match.group(2).replace(" ", "")
    if unit.startswith("acre"):
        return round(value * 43560, 2)
    return value


def normalize_amenity(value: str) -> str:
    text = re.sub(r"[^A-Za-z0-9 &/-]+", " ", str(value or ""))
    return re.sub(r"\s+", " ", text).strip().title()
