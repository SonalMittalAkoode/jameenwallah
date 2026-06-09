import os

PUBLIC_SITE_URL = os.getenv("AI_CHATBOT_PUBLIC_SITE_URL", "https://jameenwallah.akoodedemo.com").rstrip("/")


def build_public_property_url(slug):
    if not slug:
        return ""
    return f"{PUBLIC_SITE_URL}/property/{str(slug).strip()}"


def format_properties_for_ai(properties):
    lines = []

    for p in properties:
        description = p.get("description", {}) or {}
        title = description.get("title", "Unknown Property")
        price = description.get("price", "N/A")
        bhk = p.get("details", {}).get("bhk", "N/A")

        location = p.get("location", {})
        city = location.get("city", {})
        area = location.get("area", {})

        city_name = city.get("name", "") if isinstance(city, dict) else ""
        area_name = area.get("name", "") if isinstance(area, dict) else ""

        # amenities
        amenities = p.get("amenities", [])
        amenity_names = [
            a.get("title", "") for a in amenities if isinstance(a, dict)
        ]

        # Legacy behavior kept for reference:
        # url = p.get("url", "")
        url = p.get("url") or p.get("propertyUrl") or ""
        if not url and description.get("slug"):
            url = build_public_property_url(description.get("slug"))

        line = f"""
Property: {title}
BHK: {bhk}
Price: {price}
Location: {area_name}, {city_name}
Amenities: {", ".join(amenity_names)}
URL: {url}
"""
        lines.append(line.strip())

    return "\n\n".join(lines)
