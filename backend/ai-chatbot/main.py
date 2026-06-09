import os
import re
from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.property_service import fetch_properties, get_property_service_info
from utils.area_formatter import format_areas_for_ai
from utils.location_utils import (
    detect_intent_mode,
    filter_properties_for_location,
    resolve_requested_location,
)
from utils.property_formatter import build_public_property_url, format_properties_for_ai

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - optional local dependency
    load_dotenv = None

if load_dotenv:
    load_dotenv()

# Legacy startup behavior kept for reference:
# from dotenv import load_dotenv
# load_dotenv()
# print("GEMINI_API_KEY loaded:", bool(os.getenv("GEMINI_API_KEY")))
# from crewai import LLM
# from agents.property_agent import create_property_agent
# from tasks.property_task import create_property_task
# from crew_runner import run_property_crew
# llm = LLM(
#     model="gemini/gemini-2.5-flash",
#     api_key=os.getenv("GEMINI_API_KEY"),
# )

try:
    from crewai import LLM
    from agents.property_agent import create_property_agent
    from crew_runner import run_property_crew
    from tasks.property_task import create_property_task

    CREWAI_IMPORT_ERROR = None
except Exception as import_error:  # pragma: no cover - depends on deployment env
    LLM = None
    create_property_agent = None
    create_property_task = None
    run_property_crew = None
    CREWAI_IMPORT_ERROR = import_error

app = FastAPI(title="JameenWallah AI Property Chatbot")


def _get_allowed_origins() -> List[str]:
    raw_origins = os.getenv("AI_CHATBOT_ALLOWED_ORIGINS", "*")
    if raw_origins.strip() == "*":
        return ["*"]
    return [
        origin.strip()
        for origin in raw_origins.split(",")
        if origin.strip()
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    # Legacy mutable default kept for reference:
    # history: list = []  # Added history field
    history: List[Dict[str, Any]] = Field(default_factory=list)


def _gemini_key_status() -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return "missing"
    if api_key.lower() in {"your_gemini_api_key", "your-api-key", "changeme"}:
        return "placeholder"
    return "configured"


def _get_llm() -> Any:
    if LLM is None:
        detail = str(CREWAI_IMPORT_ERROR) if CREWAI_IMPORT_ERROR else "not imported"
        raise RuntimeError(f"CrewAI is unavailable: {detail}")

    if _gemini_key_status() != "configured":
        raise RuntimeError("GEMINI_API_KEY is missing or still set to a placeholder.")

    model_name = os.getenv("GEMINI_MODEL", "gemini/gemini-2.5-flash")
    return LLM(model=model_name, api_key=os.getenv("GEMINI_API_KEY"))


def _collect_location_context(properties: List[Dict[str, Any]]) -> Dict[str, set]:
    known_cities = set()
    known_areas = set()

    for property_item in properties or []:
        location = (property_item or {}).get("location", {}) or {}
        city = location.get("city")
        area = location.get("area")

        if isinstance(city, dict) and city.get("name"):
            known_cities.add(city["name"])
        elif isinstance(city, str) and city.strip():
            known_cities.add(city.strip())

        if isinstance(area, dict) and area.get("name"):
            known_areas.add(area["name"])
        elif isinstance(area, str) and area.strip():
            known_areas.add(area.strip())

    return {
        "known_cities": known_cities,
        "known_areas": known_areas,
    }


def _prepare_chat_context(req: ChatRequest, properties: List[Dict[str, Any]]) -> Dict[str, Any]:
    location_context = _collect_location_context(properties)
    intent_mode = detect_intent_mode(req.message)
    resolved = resolve_requested_location(
        user_message=req.message,
        history=req.history or [],
        known_cities=location_context["known_cities"],
        known_areas=location_context["known_areas"],
    )

    filtered_properties = properties
    location_filter_applied = False
    area_context = ""
    property_context = ""

    if intent_mode == "properties":
        if resolved.get("filter_applied"):
            location_filter_applied = True
            filtered_properties = filter_properties_for_location(
                properties,
                city=resolved.get("city"),
                area=resolved.get("area"),
                raw=resolved.get("raw"),
            )
        property_context = format_properties_for_ai(filtered_properties)
    elif intent_mode == "areas":
        area_context = format_areas_for_ai(properties, city_filter=resolved.get("city"))
        if not area_context:
            area_context = format_areas_for_ai(properties, city_filter=None)

    history_lines = []
    for message in req.history or []:
        role = "User" if message.get("type") == "user" else "Assistant"
        history_lines.append(f"{role}: {message.get('text', '')}")

    return {
        "intent_mode": intent_mode,
        "resolved": resolved,
        "filtered_properties": filtered_properties,
        "location_filter_applied": location_filter_applied,
        "property_context": property_context,
        "area_context": area_context,
        "history": "\n".join(history_lines),
    }


def _clean_answer(raw_answer: Optional[str]) -> str:
    answer = raw_answer or ""
    answer = answer.replace("\r\n", "\n")
    answer = re.sub(r"^\s*\*\s+", "- ", answer, flags=re.MULTILINE)
    answer = re.sub(r"\*\*(.*?)\*\*", r"\1", answer)
    answer = re.sub(r"\*(.*?)\*", r"\1", answer)
    return answer.replace("*", "").strip()


def _property_title(property_item: Dict[str, Any]) -> str:
    description = property_item.get("description", {}) or {}
    if isinstance(description, dict):
        value = description.get("title")
        if isinstance(value, str) and value.strip():
            return value.strip()

    for key in ("title", "name", "propertyName", "projectName"):
        value = property_item.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return "Verified property"


def _property_url(property_item: Dict[str, Any]) -> Optional[str]:
    description = property_item.get("description", {}) or {}
    if isinstance(description, dict):
        slug = description.get("slug")
        if isinstance(slug, str) and slug.strip():
            return build_public_property_url(slug)

    for key in ("url", "slug", "propertyUrl"):
        value = property_item.get(key)
        if not isinstance(value, str) or not value.strip():
            continue
        value = value.strip()
        if value.startswith("http"):
            return value
        if value.startswith("/"):
            return value
        return build_public_property_url(value)
    return None


def _wants_all_properties(user_message: str) -> bool:
    normalized_message = user_message.lower()
    property_terms_present = any(
        term in normalized_message
        for term in ["property", "properties", "listing", "listings", "projects"]
    )
    all_terms_present = any(
        term in normalized_message
        for term in ["all", "every", "complete", "current", "newly added", "new added", "new", "latest"]
    )
    if property_terms_present and all_terms_present:
        return True

    return any(
        term in normalized_message
        for term in [
            "all properties",
            "all property",
            "all listings",
            "all listing",
            "every property",
            "every listing",
            "complete list",
            "current properties",
            "current listings",
            "newly added",
            "new added",
            "new properties",
            "latest properties",
            "latest listings",
        ]
    )


def _field_text(value: Any) -> str:
    if isinstance(value, str):
        return value.lower()
    if isinstance(value, (int, float)):
        return str(value).lower()
    if isinstance(value, dict):
        return " ".join(str(item).lower() for item in value.values() if item)
    return ""


def _property_category_text(property_item: Dict[str, Any]) -> str:
    description = property_item.get("description", {}) or {}
    if not isinstance(description, dict):
        return ""
    return " ".join(
        [
            _field_text(description.get("category")),
            _field_text(description.get("propertyType")),
            _field_text(description.get("title")),
        ]
    )


def _property_search_text(property_item: Dict[str, Any]) -> str:
    description = property_item.get("description", {}) or {}
    details = property_item.get("details", {}) or {}
    location = property_item.get("location", {}) or {}
    parts: List[str] = []

    for source in (description, details, location):
        if not isinstance(source, dict):
            continue
        for value in source.values():
            if isinstance(value, str):
                parts.append(value)
            elif isinstance(value, (int, float)):
                parts.append(str(value))
            elif isinstance(value, dict):
                parts.extend(str(item) for item in value.values() if item)

    amenities = property_item.get("amenities", [])
    if isinstance(amenities, list):
        parts.extend(
            amenity.get("title", "")
            for amenity in amenities
            if isinstance(amenity, dict)
        )

    return " ".join(parts).lower()


def _filter_properties_for_prompt(
    properties: List[Dict[str, Any]],
    user_message: str,
) -> List[Dict[str, Any]]:
    normalized_message = user_message.lower()
    requested_terms: List[str] = []
    category_terms: List[str] = []

    if "residential" in normalized_message:
        category_terms.append("residential")
    if "commercial" in normalized_message:
        category_terms.append("commercial")
    if "plot" in normalized_message or "plots" in normalized_message:
        requested_terms.append("plot")
    if "villa" in normalized_message or "villas" in normalized_message:
        requested_terms.append("villa")
    if "apartment" in normalized_message or "apartments" in normalized_message:
        requested_terms.append("apartment")
    if "retail" in normalized_message or "shop" in normalized_message or "shops" in normalized_message:
        requested_terms.extend(["retail", "shop"])
    if "office" in normalized_message or "offices" in normalized_message:
        requested_terms.append("office")

    scoped_properties = properties
    if category_terms:
        category_filtered = [
            property_item
            for property_item in scoped_properties
            if any(term in _property_category_text(property_item) for term in category_terms)
        ]
        if category_filtered:
            scoped_properties = category_filtered

    if not requested_terms:
        return scoped_properties

    filtered = [
        property_item
        for property_item in scoped_properties
        if any(term in _property_search_text(property_item) for term in requested_terms)
    ]
    return filtered or scoped_properties


def _format_property_list_answer(
    user_message: str,
    properties: List[Dict[str, Any]],
    *,
    include_refinement_hint: bool = True,
) -> str:
    scoped_properties = _filter_properties_for_prompt(properties, user_message)
    if not scoped_properties:
        return "I could not find matching verified properties in the live listing API."

    lines = [f"Here are {len(scoped_properties)} matching verified properties I can currently see:"]
    for property_item in scoped_properties:
        url = _property_url(property_item)
        title = _property_title(property_item)
        if url:
            lines.append(f"- {title}\n  URL: {url}")
        else:
            lines.append(f"- {title}")

    if include_refinement_hint:
        lines.append("- Share budget, preferred sector, BHK, or commercial use-case to narrow this further.")

    return "\n".join(lines)


def _fallback_answer(
    user_message: str,
    properties: List[Dict[str, Any]],
    context: Dict[str, Any],
    error: Optional[Exception] = None,
) -> str:
    normalized_message = user_message.lower()

    if any(term in normalized_message for term in ["who built", "who made", "chatbot", "website"]):
        return (
            "Akoode Technologies built this website and chatbot.\n"
            "- Akoode Technologies focuses on AI, digital platforms, and real estate technology.\n"
            "- Website: https://akoode.com\n"
            "- I can also help you shortlist properties by city, sector, budget, or property type."
        )

    if any(term in normalized_message for term in ["ram verma", "founder", "owner", "ceo"]):
        return (
            "Ram Verma is the Founder and CEO of BigCat Realty.\n"
            "- About page: https://www.bigcatrealty.com/about\n"
            "- He is associated with real estate advisory and property investment guidance."
        )

    if not properties:
        message = "The chatbot is running, but property data is not available right now."
        if error:
            message += " The AI provider also returned an error, so this is a safe fallback response."
        return (
            f"{message}\n"
            "- Please check the Node property API configured for the chatbot.\n"
            "- You can still ask about Gurgaon, Noida, budget range, BHK type, or investment intent.\n"
            "- Once the property API and Gemini key are healthy, live recommendations will use verified listings."
        )

    scoped_properties = context.get("filtered_properties") or properties
    if _wants_all_properties(user_message):
        return _format_property_list_answer(user_message, scoped_properties)

    # Legacy fallback list size kept for reference:
    # suggested_properties = scoped_properties[:5]
    return _format_property_list_answer(user_message, scoped_properties[:8])


def _public_error_message(error: Exception) -> str:
    error_text = str(error)
    if "API key expired" in error_text:
        return "Gemini API key expired."
    if "API Key not found" in error_text or "API_KEY_INVALID" in error_text:
        return "Gemini API key is invalid or missing."
    if "CrewAI is unavailable" in error_text:
        return error_text
    return "AI generation failed; fallback response returned."


def _chatbot_info() -> Dict[str, Any]:
    property_service_info = get_property_service_info()
    return {
        "name": "JameenWallah AI Property Chatbot",
        "purpose": "Answers real estate questions using verified JameenWallah property listings and Gemini via CrewAI.",
        "endpoints": {
            "health": "/health",
            "info": "/info",
            "chat": "/chat",
        },
        "engine": {
            "orchestration": "CrewAI",
            "model": os.getenv("GEMINI_MODEL", "gemini/gemini-2.5-flash"),
            "crewai_available": CREWAI_IMPORT_ERROR is None,
            "gemini_key_status": _gemini_key_status(),
        },
        "data_source": property_service_info,
        "fallbacks": [
            "Service starts even when CrewAI is not installed.",
            "Chat returns a safe real estate response instead of HTTP 500 when Gemini fails.",
            "Property API URL is environment configurable instead of hard-coded to port 5000.",
        ],
    }


@app.get("/")
def root() -> Dict[str, Any]:
    return _chatbot_info()


@app.get("/info")
def info() -> Dict[str, Any]:
    return _chatbot_info()


@app.get("/health")
def health() -> Dict[str, Any]:
    properties = fetch_properties()
    crewai_ready = CREWAI_IMPORT_ERROR is None
    gemini_ready = _gemini_key_status() == "configured"
    property_api_ready = len(properties) > 0
    status = "ok" if crewai_ready and gemini_ready and property_api_ready else "degraded"

    return {
        "status": status,
        "checks": {
            "crewai": {
                "ok": crewai_ready,
                "error": None if crewai_ready else str(CREWAI_IMPORT_ERROR),
            },
            "gemini_api_key": {
                "ok": gemini_ready,
                "status": _gemini_key_status(),
            },
            "property_api": {
                "ok": property_api_ready,
                "property_count": len(properties),
                **get_property_service_info(),
            },
        },
    }


# Legacy /chat implementation kept for reference:
# @app.post("/chat")
# def chat(req: ChatRequest):
#     properties = fetch_properties()
#     agent = create_property_agent(llm)
#     task = create_property_task(...)
#     response = run_property_crew(agent, task)
#     return {"answer": response.raw or ""}


@app.post("/chat")
def chat(req: ChatRequest) -> Dict[str, Any]:
    properties = fetch_properties()
    context = _prepare_chat_context(req, properties)

    if context["intent_mode"] == "properties" and _wants_all_properties(req.message):
        scoped_properties = context.get("filtered_properties") or properties
        answer = _format_property_list_answer(req.message, scoped_properties)
        return {
            "answer": answer,
            "meta": {
                "fallback": False,
                "property_count": len(properties),
                "matched_property_count": len(_filter_properties_for_prompt(scoped_properties, req.message)),
                "intent_mode": context["intent_mode"],
                "direct_live_list": True,
            },
        }

    try:
        llm = _get_llm()
        agent = create_property_agent(llm)
        task = create_property_task(
            agent=agent,
            user_query=req.message,
            property_context=context["property_context"],
            area_context=context["area_context"],
            history=context["history"],
            intent_mode=context["intent_mode"],
            location_filter_applied=context["location_filter_applied"],
            resolved_location=context["resolved"].get("label"),
            location_match_count=(
                len(context["filtered_properties"])
                if context["location_filter_applied"]
                else None
            ),
        )
        response = run_property_crew(agent, task)
        answer = _clean_answer(getattr(response, "raw", ""))

        return {
            "answer": answer,
            "meta": {
                "fallback": False,
                "property_count": len(properties),
                "intent_mode": context["intent_mode"],
            },
        }
    except Exception as error:
        return {
            "answer": _fallback_answer(req.message, properties, context, error),
            "meta": {
                "fallback": True,
                "error": _public_error_message(error),
                "property_count": len(properties),
                "intent_mode": context["intent_mode"],
            },
        }
