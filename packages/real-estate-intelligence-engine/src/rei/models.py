from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class Coordinates:
    lat: float | None = None
    lng: float | None = None


@dataclass
class Price:
    starting: int | None = None
    ending: int | None = None
    minimum_price: int | None = None
    maximum_price: int | None = None
    price_per_sqft: int | None = None
    raw: str = ""
    crores: float | None = None
    lakhs: float | None = None
    payment_plans: list[str] = field(default_factory=list)
    booking_amount: int | None = None
    plc_charges: str = ""
    maintenance_charges: str = ""
    gst_information: str = ""


@dataclass
class UnitConfiguration:
    configuration: str = ""
    unit_type: str = ""
    size_sqft: float | None = None
    carpet_area: float | None = None
    super_area: float | None = None
    builtup_area: float | None = None
    balcony_count: int | None = None
    bathroom_count: int | None = None
    servant_room: bool | None = None
    study_room: bool | None = None
    terrace: bool | None = None
    private_lift: bool | None = None
    facing: str = ""
    floor_number: str = ""
    tower_name: str = ""
    unit_availability: str = ""
    raw: dict[str, Any] = field(default_factory=dict)


@dataclass
class MediaAsset:
    url: str
    asset_type: str = "unknown"
    local_path: str = ""
    sha256: str = ""
    width: int | None = None
    height: int | None = None
    alt: str = ""
    caption: str = ""
    source_url: str = ""
    mime_type: str = ""
    is_duplicate: bool = False


@dataclass
class VideoAsset:
    url: str = ""
    provider: str = ""
    title: str = ""
    description: str = ""
    thumbnail_url: str = ""
    embed_code: str = ""
    source_url: str = ""


@dataclass
class DocumentAsset:
    url: str = ""
    document_type: str = "brochure"
    local_path: str = ""
    title: str = ""
    text: str = ""
    sha256: str = ""
    source_url: str = ""


@dataclass
class BuilderDetails:
    name: str = ""
    canonical_name: str = ""
    website: str = ""
    logo_url: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    description: str = ""
    rera_registered: str = ""
    raw: dict[str, Any] = field(default_factory=dict)


@dataclass
class NearbyPlace:
    name: str = ""
    category: str = ""
    distance_text: str = ""
    travel_time_text: str = ""
    lat: float | None = None
    lng: float | None = None


@dataclass
class PropertyProject:
    project_name: str = ""
    builder_name: str = ""
    project_slug: str = ""
    project_type: str = ""
    category: str = ""
    luxury_category: str = ""
    project_status: str = ""
    new_launch_status: str = ""
    under_construction_status: str = ""
    ready_to_move_status: str = ""
    rera_number: str = ""
    launch_date: str = ""
    possession_date: str = ""
    project_description: str = ""
    short_description: str = ""
    long_description: str = ""
    project_highlights: list[str] = field(default_factory=list)
    project_tagline: str = ""
    project_overview: str = ""
    faqs: list[dict[str, str]] = field(default_factory=list)
    brochure_text: str = ""
    country: str = "India"
    state: str = ""
    city: str = ""
    locality: str = ""
    sector: str = ""
    area: str = ""
    address: str = ""
    pincode: str = ""
    coordinates: Coordinates = field(default_factory=Coordinates)
    nearby_landmarks: list[str] = field(default_factory=list)
    nearby_schools: list[NearbyPlace] = field(default_factory=list)
    nearby_hospitals: list[NearbyPlace] = field(default_factory=list)
    nearby_malls: list[NearbyPlace] = field(default_factory=list)
    nearby_airports: list[NearbyPlace] = field(default_factory=list)
    nearby_metro: list[NearbyPlace] = field(default_factory=list)
    nearby_business_hubs: list[NearbyPlace] = field(default_factory=list)
    connectivity_text: str = ""
    price: Price = field(default_factory=Price)
    configurations: list[UnitConfiguration] = field(default_factory=list)
    amenities: list[str] = field(default_factory=list)
    gallery_images: list[MediaAsset] = field(default_factory=list)
    floor_plans: list[MediaAsset] = field(default_factory=list)
    master_plan_images: list[MediaAsset] = field(default_factory=list)
    logo_images: list[MediaAsset] = field(default_factory=list)
    videos: list[VideoAsset] = field(default_factory=list)
    brochures: list[DocumentAsset] = field(default_factory=list)
    virtual_tours: list[str] = field(default_factory=list)
    location_advantages: list[str] = field(default_factory=list)
    nearby_places: list[NearbyPlace] = field(default_factory=list)
    builder_details: BuilderDetails = field(default_factory=BuilderDetails)
    project_url: str = ""
    source_name: str = ""
    source_url: str = ""
    canonical_key: str = ""
    seo_title: str = ""
    seo_description: str = ""
    investment_summary: str = ""
    luxury_score: float | None = None
    appreciation_potential: str = ""
    raw: dict[str, Any] = field(default_factory=dict)
    extracted_at: str = field(default_factory=utc_now_iso)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class CrawlResult:
    url: str
    status_code: int
    html: str = ""
    final_url: str = ""
    content_type: str = ""
    network_payloads: list[dict[str, Any]] = field(default_factory=list)
    screenshot_path: str = ""
    error: str = ""


@dataclass
class ChangeEvent:
    event_type: str
    canonical_key: str
    project_name: str
    source_url: str
    before: dict[str, Any] = field(default_factory=dict)
    after: dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=utc_now_iso)
