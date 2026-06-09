import os
from typing import Any, Dict, List
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import requests

# Legacy implementation kept for reference:
# import requests
#
# # Ensure this matches your running backend port
# NODE_AI_API = "http://localhost:5000/frontend/api/properties/all"
#
# def fetch_properties():
#     try:
#         response = requests.get(NODE_AI_API, timeout=10)
#         response.raise_for_status()
#         return response.json().get("data", [])
#     except Exception as e:
#         print("Error fetching properties:", e)
#         return []

DEFAULT_NODE_PORT = os.getenv("NODE_BACKEND_PORT", "5001")
DEFAULT_PROPERTY_API = (
    f"http://localhost:{DEFAULT_NODE_PORT}/frontend/api/properties/all"
)
NODE_AI_API = os.getenv(
    "NODE_AI_API_URL",
    os.getenv("NODE_PROPERTY_API_URL", DEFAULT_PROPERTY_API),
)
REQUEST_TIMEOUT_SECONDS = float(os.getenv("NODE_AI_API_TIMEOUT", "10"))
# Legacy single-page limit kept for reference:
# DEFAULT_PROPERTY_LIMIT = os.getenv("NODE_AI_API_LIMIT", "500")
DEFAULT_PROPERTY_LIMIT = os.getenv("NODE_AI_API_LIMIT", "100")
MAX_PROPERTY_PAGES = int(os.getenv("NODE_AI_API_MAX_PAGES", "50"))


def _with_query_params(url: str, updates: Dict[str, Any]) -> str:
    parsed = urlsplit(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))

    for key, value in updates.items():
        if value is None or value == "":
            continue
        query[key] = str(value)

    return urlunsplit((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        urlencode(query),
        parsed.fragment,
    ))


def _with_default_limit(url: str) -> str:
    parsed = urlsplit(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))

    if "limit" not in query and DEFAULT_PROPERTY_LIMIT:
        query["limit"] = DEFAULT_PROPERTY_LIMIT

    return urlunsplit((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        urlencode(query),
        parsed.fragment,
    ))


def _extract_properties(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    # Legacy API shape kept for reference:
    # properties = payload.get("data", [])
    for key in ("data", "items", "properties"):
        properties = payload.get(key)
        if isinstance(properties, list):
            return properties
    return []


def _extract_total_pages(payload: Dict[str, Any]) -> int:
    candidates = [
        payload.get("totalPages"),
        payload.get("pages"),
        (payload.get("pagination") or {}).get("totalPages")
        if isinstance(payload.get("pagination"), dict)
        else None,
    ]
    for value in candidates:
        try:
            total_pages = int(value)
        except (TypeError, ValueError):
            continue
        if total_pages > 0:
            return total_pages
    return 1


def _property_identity(property_item: Dict[str, Any]) -> str:
    description = property_item.get("description", {}) or {}
    slug = description.get("slug") if isinstance(description, dict) else None
    return str(
        property_item.get("_id")
        or property_item.get("id")
        or slug
        or property_item.get("slug")
        or id(property_item)
    )


def _fetch_payload(url: str) -> Dict[str, Any]:
    response = requests.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    payload = response.json()

    if not isinstance(payload, dict):
        raise ValueError(f"Unexpected property API payload type: {type(payload).__name__}")

    return payload


def get_property_service_info() -> Dict[str, Any]:
    return {
        "property_api_url": _with_default_limit(NODE_AI_API),
        "timeout_seconds": REQUEST_TIMEOUT_SECONDS,
        "default_limit": DEFAULT_PROPERTY_LIMIT,
        "max_pages": MAX_PROPERTY_PAGES,
    }


def fetch_properties() -> List[Dict[str, Any]]:
    request_url = _with_default_limit(NODE_AI_API)

    try:
        # Legacy behavior fetched one response only:
        # response = requests.get(request_url, timeout=REQUEST_TIMEOUT_SECONDS)
        # response.raise_for_status()
        # payload = response.json()
        payload = _fetch_payload(request_url)
    except requests.RequestException as error:
        print(f"Error fetching properties from {request_url}: {error}")
        return []
    except ValueError as error:
        print(f"Invalid JSON from property API {request_url}: {error}")
        return []

    if not isinstance(payload, dict):
        print(f"Unexpected property API payload type: {type(payload).__name__}")
        return []

    properties = _extract_properties(payload)
    if not properties:
        print("Property API response did not include a non-empty list in `data`, `items`, or `properties`.")
        return []

    total_pages = min(_extract_total_pages(payload), MAX_PROPERTY_PAGES)
    if total_pages <= 1:
        return properties

    by_id: Dict[str, Dict[str, Any]] = {}
    for property_item in properties:
        by_id[_property_identity(property_item)] = property_item

    for page in range(2, total_pages + 1):
        page_url = _with_query_params(request_url, {"page": page})
        try:
            page_payload = _fetch_payload(page_url)
        except (requests.RequestException, ValueError) as error:
            print(f"Error fetching property page {page} from {page_url}: {error}")
            break

        page_properties = _extract_properties(page_payload)
        if not page_properties:
            break

        for property_item in page_properties:
            by_id[_property_identity(property_item)] = property_item

    return list(by_id.values())


if __name__ == "__main__":
    properties = fetch_properties()

    if properties:
        print("Keys in first property:")
        print(properties[0].keys())
    else:
        print("No properties returned from API")
