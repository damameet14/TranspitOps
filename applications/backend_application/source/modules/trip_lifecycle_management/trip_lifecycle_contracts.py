"""Pydantic contracts for trip lifecycle management requests and responses."""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class CreateTripRequest(BaseModel):
    """Request body for POST /trips — create a new trip in Draft status."""
    source: Optional[str] = Field(None, min_length=1, max_length=255)
    destination: Optional[str] = Field(None, min_length=1, max_length=255)
    source_street_address: Optional[str] = Field(None, min_length=2, max_length=255)
    destination_street_address: Optional[str] = Field(None, min_length=2, max_length=255)
    source_location_id: Optional[int] = Field(None, gt=0)
    destination_location_id: Optional[int] = Field(None, gt=0)
    trip_date: date = Field(default_factory=date.today)
    vehicle_id: int = Field(..., gt=0)
    driver_id: int = Field(..., gt=0)
    cargo_weight_kg: float = Field(..., gt=0)
    planned_distance_km: float = Field(..., gt=0)
    revenue: float = Field(default=0, ge=0)
    is_past_trip: bool = False
    final_odometer_km: Optional[float] = Field(None, gt=0)
    fuel_consumed_liters: Optional[float] = Field(None, gt=0)
    fuel_cost: Optional[float] = Field(None, gt=0)
    actual_distance_km: Optional[float] = Field(None, gt=0)

    @model_validator(mode="after")
    def validate_address_and_past_trip_fields(self):
        has_legacy_addresses = bool(self.source and self.destination)
        has_structured_addresses = bool(self.source_street_address and self.destination_street_address and self.source_location_id and self.destination_location_id)
        if not has_legacy_addresses and not has_structured_addresses:
            raise ValueError("Source and destination require a street address and city/state selection.")
        if not self.is_past_trip and self.trip_date < date.today():
            raise ValueError("Use Add Past Trip to enter a historical trip.")
        if self.is_past_trip:
            if self.trip_date >= date.today():
                raise ValueError("Past trips must use a date before today.")
            if not all((self.final_odometer_km, self.fuel_consumed_liters, self.actual_distance_km)):
                raise ValueError("Past trips require final odometer, fuel consumed, and actual distance.")
        return self


class DispatchTripRequest(BaseModel):
    """Request body for POST /trips/{trip_id}/dispatch — optional override fields."""
    pass


class CompleteTripRequest(BaseModel):
    """Request body for POST /trips/{trip_id}/complete — requires odometer and fuel."""
    final_odometer_km: float = Field(..., gt=0)
    fuel_consumed_liters: float = Field(..., gt=0)
    fuel_cost: Optional[float] = Field(None, gt=0)
    actual_distance_km: Optional[float] = Field(None, gt=0)


class TripResponse(BaseModel):
    """Single trip in API responses."""
    id: int
    source: str
    destination: str
    source_street_address: Optional[str] = None
    destination_street_address: Optional[str] = None
    source_location_id: Optional[int] = None
    destination_location_id: Optional[int] = None
    trip_date: date
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
