from pydantic import BaseModel, Field, model_validator
from typing import Optional, Literal, Dict, Any, List

class GPSLocation(BaseModel):
    lat: float
    lng: float

CategoryType = Literal[
    "overflowing_bin",
    "garbage_dump",
    "plastic_waste",
    "construction_debris",
    "organic_waste",
    "e_waste",
    "hazardous_waste",
    "drain_blockage"
]

VolumeType = Literal[
    "small",
    "medium",
    "large",
    "very_large"
]

StatusType = Literal[
    "submitted",
    "in_progress",
    "resolved"
]

class ComplaintBase(BaseModel):
    image_url: str
    category: str
    volume: str
    priority_score: float = Field(..., ge=0, le=100)
    status: str = "submitted"
    gps: GPSLocation
    address: str = ""
    timestamp: str
    comment: str = ""
    reporter_comment: str = ""
    recommended_action: str = ""
    is_duplicate: bool = False
    duplicate_of: Optional[str] = None
    assigned_team: Optional[str] = None
    ai_confidence: float = Field(0.0, ge=0, le=100)
    ai_reasoning: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    ward: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def sync_comments(cls, values: Any) -> Any:
        if isinstance(values, dict):
            comment = values.get("comment") or values.get("reporter_comment") or ""
            values["comment"] = comment
            values["reporter_comment"] = comment
        return values

class ComplaintResponse(ComplaintBase):
    id: str

class StatusUpdate(BaseModel):
    status: StatusType
    assigned_team: Optional[str] = None

class Hotspot(BaseModel):
    lat: float
    lng: float
    count: int
    avg_priority: float

class AnalyticsSummary(BaseModel):
    total: int
    by_status: Dict[str, int]
    by_category: Dict[str, int]
    urgent_count: int
    timeline: List[Dict[str, Any]] = []
    ward_performance: List[Dict[str, Any]] = []
