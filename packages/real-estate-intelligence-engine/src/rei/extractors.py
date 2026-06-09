from __future__ import annotations

import json
import re
from typing import Any
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from .models import DocumentAsset, MediaAsset, PropertyProject, UnitConfiguration, VideoAsset
from .normalize import (
    make_project_slug,
    normalize_amenity,
    normalize_builder_name,
    normalize_city,
    normalize_price,
    normalize_property_type,
    parse_area_sqft,
)


RERA_RE = re.compile(r"\b(?:RERA|HRERA|UPRERA|MAHARERA)[\s:#-]*([A-Z0-9/-]{6,})", re.I)
PIN_RE = re.compile(r"\b[1-9][0-9]{5}\b")
CONFIG_RE = re.compile(r"\b([1-9](?:\.\d)?\s*BHK|Penthouse|Villa|SCO|Office|Retail)\b", re.I)


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def parse_json_script(text: str) -> Any | None:
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass
    match = re.search(r"=\s*(\{.*\})\s*;?\s*$", text, re.S)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            return None
    return None


def extract_json_payloads(soup: BeautifulSoup) -> list[dict[str, Any]]:
    payloads: list[dict[str, Any]] = []
    for script in soup.find_all("script"):
        script_id = script.get("id", "")
        script_type = script.get("type", "")
        text = script.string or script.get_text(" ", strip=True)
        if not text:
            continue
        if script_type == "application/ld+json" or script_id == "__NEXT_DATA__":
            data = parse_json_script(text)
            if isinstance(data, dict):
                payloads.append({"kind": script_type or script_id, "data": data})
            elif isinstance(data, list):
                payloads.append({"kind": script_type or script_id, "data": {"items": data}})
        elif any(marker in text for marker in ("__INITIAL_STATE__", "INITIAL_STATE", "__REDUX_STATE__", "window.__")):
            data = parse_json_script(text)
            if isinstance(data, dict):
                payloads.append({"kind": "hydration", "data": data})
    return payloads


def flatten_strings(value: Any, limit: int = 500) -> list[str]:
    output: list[str] = []
    if len(output) >= limit:
        return output
    if isinstance(value, str):
        text = clean_text(value)
        if text:
            output.append(text)
    elif isinstance(value, dict):
        for child in value.values():
            output.extend(flatten_strings(child, limit))
            if len(output) >= limit:
                break
    elif isinstance(value, list):
        for child in value:
            output.extend(flatten_strings(child, limit))
            if len(output) >= limit:
                break
    return output[:limit]


def first_meta(soup: BeautifulSoup, *names: str) -> str:
    for name in names:
        tag = soup.find("meta", attrs={"property": name}) or soup.find("meta", attrs={"name": name})
        if tag and tag.get("content"):
            return clean_text(tag["content"])
    return ""


def extract_title(soup: BeautifulSoup) -> str:
    h1 = soup.find("h1")
    if h1:
        return clean_text(h1.get_text(" "))
    meta_title = first_meta(soup, "og:title", "twitter:title")
    if meta_title:
        return meta_title
    return clean_text(soup.title.get_text(" ")) if soup.title else ""


def extract_media(soup: BeautifulSoup, base_url: str) -> tuple[list[MediaAsset], list[MediaAsset], list[MediaAsset], list[MediaAsset]]:
    gallery: list[MediaAsset] = []
    floor_plans: list[MediaAsset] = []
    master_plans: list[MediaAsset] = []
    logos: list[MediaAsset] = []
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
        if not src:
            continue
        url = urljoin(base_url, src)
        alt = clean_text(img.get("alt", ""))
        caption = clean_text(img.get("title", ""))
        haystack = f"{url} {alt} {caption}".lower()
        asset_type = "gallery"
        target = gallery
        if "floor" in haystack and "plan" in haystack:
            asset_type = "floor_plan"
            target = floor_plans
        elif "master" in haystack and "plan" in haystack:
            asset_type = "master_plan"
            target = master_plans
        elif "logo" in haystack:
            asset_type = "logo"
            target = logos
        target.append(MediaAsset(url=url, asset_type=asset_type, alt=alt, caption=caption, source_url=base_url))
    return dedupe_assets(gallery), dedupe_assets(floor_plans), dedupe_assets(master_plans), dedupe_assets(logos)


def dedupe_assets(items: list[MediaAsset]) -> list[MediaAsset]:
    seen = set()
    output = []
    for item in items:
        key = item.url.split("?", 1)[0]
        if key in seen:
            continue
        seen.add(key)
        output.append(item)
    return output


def extract_documents(soup: BeautifulSoup, base_url: str) -> list[DocumentAsset]:
    docs: list[DocumentAsset] = []
    for anchor in soup.select("a[href]"):
        href = anchor.get("href", "")
        text = clean_text(anchor.get_text(" "))
        haystack = f"{href} {text}".lower()
        if not any(marker in haystack for marker in ("brochure", ".pdf", "floor plan", "payment plan", "price list")):
            continue
        document_type = "brochure"
        if "floor" in haystack:
            document_type = "floor_plan"
        elif "payment" in haystack:
            document_type = "payment_plan"
        elif "price" in haystack:
            document_type = "pricing_sheet"
        docs.append(DocumentAsset(url=urljoin(base_url, href), document_type=document_type, title=text, source_url=base_url))
    return docs


def extract_videos(soup: BeautifulSoup, base_url: str) -> list[VideoAsset]:
    videos: list[VideoAsset] = []
    for tag in soup.select("iframe[src], video[src], source[src]"):
        src = tag.get("src")
        if not src:
            continue
        url = urljoin(base_url, src)
        provider = "youtube" if "youtu" in url else "vimeo" if "vimeo" in url else "mp4" if ".mp4" in url else "embedded"
        videos.append(VideoAsset(url=url, provider=provider, embed_code=str(tag), source_url=base_url))
    return videos


def extract_virtual_tours(soup: BeautifulSoup, base_url: str) -> list[str]:
    tours = []
    for tag in soup.select("iframe[src], a[href]"):
        url = urljoin(base_url, tag.get("src") or tag.get("href") or "")
        if any(marker in url.lower() for marker in ("matterport", "360", "virtual-tour", "kuula", "vr")):
            tours.append(url)
    return list(dict.fromkeys(tours))


def extract_amenities(soup: BeautifulSoup, payload_strings: list[str]) -> list[str]:
    candidates: list[str] = []
    for selector in ("[class*=amenit]", "[id*=amenit]", "[class*=feature]", "[class*=highlight]"):
        for tag in soup.select(selector):
            text = clean_text(tag.get_text(" "))
            if 3 <= len(text) <= 80:
                candidates.append(text)
            else:
                candidates.extend(clean_text(li.get_text(" ")) for li in tag.find_all("li"))
    candidates.extend(text for text in payload_strings if any(word in text.lower() for word in ("pool", "club", "gym", "garden", "parking", "security")))
    normalized = [normalize_amenity(item) for item in candidates if item]
    return list(dict.fromkeys(item for item in normalized if 2 < len(item) <= 80))[:80]


def extract_configurations(text: str) -> list[UnitConfiguration]:
    configs: list[UnitConfiguration] = []
    for match in CONFIG_RE.finditer(text):
        label = clean_text(match.group(1).upper())
        window = text[max(0, match.start() - 100): match.end() + 140]
        configs.append(UnitConfiguration(configuration=label, unit_type=label, size_sqft=parse_area_sqft(window), raw={"context": clean_text(window)}))
    deduped: dict[str, UnitConfiguration] = {}
    for config in configs:
        key = f"{config.configuration}:{config.size_sqft or ''}"
        deduped.setdefault(key, config)
    return list(deduped.values())[:30]


def guess_location(text: str) -> dict[str, str]:
    city = ""
    for candidate in ("Gurgaon", "Gurugram", "Noida", "Greater Noida", "Delhi", "Faridabad", "Mumbai", "Bengaluru", "Hyderabad", "Pune"):
        if re.search(rf"\b{re.escape(candidate)}\b", text, re.I):
            city = normalize_city(candidate)
            break
    sector_match = re.search(r"\bSector\s*[-]?\s*([A-Za-z0-9]+)\b", text, re.I)
    pincode = PIN_RE.search(text)
    return {
        "city": city,
        "sector": f"Sector {sector_match.group(1)}" if sector_match else "",
        "pincode": pincode.group(0) if pincode else "",
    }


def extract_project(crawl_result, source_name: str = "") -> PropertyProject:
    soup = BeautifulSoup(crawl_result.html or "", "lxml")
    payloads = extract_json_payloads(soup)
    payload_strings = []
    for payload in payloads:
        payload_strings.extend(flatten_strings(payload.get("data")))
    page_text = clean_text(soup.get_text(" "))
    full_text = clean_text(" ".join([page_text, *payload_strings[:200]]))
    title = extract_title(soup)
    description = first_meta(soup, "description", "og:description", "twitter:description")
    rera_match = RERA_RE.search(full_text)
    location = guess_location(full_text)
    gallery, floor_plans, master_plans, logos = extract_media(soup, crawl_result.final_url or crawl_result.url)
    builder = source_name
    for text in payload_strings[:100]:
        if re.search(r"\b(builder|developer)\b", text, re.I) and len(text) <= 80:
            builder = text
            break

    price_context = " ".join(re.findall(r"(?:₹|Rs\.?|INR)?\s*\d[\d,.]*\s*(?:Cr|Crore|Lakh|Lac|Lakhs|/sq\.?\s*ft|per\s*sq\.?\s*ft)?", full_text, re.I)[:8])
    project = PropertyProject(
        project_name=title,
        builder_name=normalize_builder_name(builder),
        project_type=normalize_property_type(full_text[:500]),
        category="residential" if re.search(r"\b(BHK|apartment|villa|residential)\b", full_text, re.I) else "commercial",
        rera_number=rera_match.group(1) if rera_match else "",
        project_description=description or full_text[:1200],
        short_description=(description or full_text)[:260],
        long_description=full_text[:5000],
        country="India",
        city=location["city"],
        sector=location["sector"],
        pincode=location["pincode"],
        price=normalize_price(price_context),
        configurations=extract_configurations(full_text),
        amenities=extract_amenities(soup, payload_strings),
        gallery_images=gallery,
        floor_plans=floor_plans,
        master_plan_images=master_plans,
        logo_images=logos,
        videos=extract_videos(soup, crawl_result.final_url or crawl_result.url),
        brochures=extract_documents(soup, crawl_result.final_url or crawl_result.url),
        virtual_tours=extract_virtual_tours(soup, crawl_result.final_url or crawl_result.url),
        project_url=crawl_result.final_url or crawl_result.url,
        source_name=source_name,
        source_url=crawl_result.url,
        raw={"json_payloads": payloads, "network_payloads": crawl_result.network_payloads},
    )
    project.project_slug = make_project_slug(project.builder_name, project.project_name, project.city, project.sector)
    project.canonical_key = project.project_slug or crawl_result.url
    project.builder_details.name = project.builder_name
    project.builder_details.canonical_name = normalize_builder_name(project.builder_name)
    project.seo_title = title
    project.seo_description = project.short_description
    return project
