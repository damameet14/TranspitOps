"""Pydantic contracts for trip lifecycle management requests and responses."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CreateTripRequest(BaseModel):
    """Request body for POST /trips — create a new trip in Draft status."""
    source: str = Field(..., min_length=1, max_length=255)
    destination: str = Field(..., min_length=1, max_length=255)
    vehicle_id: int = Field(..., gt=0)
    driver_id: int = Field(..., gt=0)
    cargo_weight_kg: float = Field(..., gt=0)
    planned_distance_km: float = Field(..., gt=0)
    revenue: float = Field(default=0, ge=0)


class DispatchTripRequest(BaseModel):
    """Request body for POST /trips/{trip_id}/dispatch — optional override fields."""
    pass


class CompleteTripRequest(BaseModel):
    """Request body for POST /trips/{trip_id}/complete — requires odometer and fuel."""
    final_odometer_km: float = Field(..., gt=0)
    fuel_consumed_liters: float = Field(..., gt=0)
    actual_distance_km: Optional[float] = Field(None, gt=0)


class TripResponse(BaseModel):
    """Single trip in API responses."""
    id: int
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight_kg: float
    planned_distance_km: float
    actual_distance_km: Optional[float]
    revenue: float
    status: str
    final_odometer_km: Optional[float]
    fuel_consumed_liters: Optional[float]
    dispatched_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    # Denormalized vehicle and driver info for convenience
    vehicle_registration_number: Optional[str] = None
    vehicle_name_model: Optional[str] = None
    driver_name: Optional[str] = None

    model_config = {"from_attributes": True}
