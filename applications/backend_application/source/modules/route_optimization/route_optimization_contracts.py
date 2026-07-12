"""Pydantic contracts for route optimization suggestions."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class RouteOptimizationRequest(BaseModel):
    """Request body for POST /routes/suggest."""
    source: str = Field(..., min_length=1, max_length=255)
    destination: str = Field(..., min_length=1, max_length=255)
    trip_id: Optional[int] = None


class RouteSuggestionResponse(BaseModel):
    """Single route suggestion in API responses."""
    id: int
    trip_id: Optional[int]
    source: str
    destination: str
    provider: str
    suggested_distance_km: float
    suggested_duration_minutes: float
    raw_response: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}
