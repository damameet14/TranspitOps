"""Pydantic contracts for vehicle registry requests and responses."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CreateVehicleRequest(BaseModel):
    """Request body for POST /vehicles."""
    registration_number: str = Field(..., min_length=1, max_length=50)
    name_model: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., description="One of: truck, van, bike, other")
    max_load_capacity_kg: float = Field(..., gt=0)
    odometer_km: float = Field(default=0, ge=0)
    acquisition_cost: float = Field(default=0, ge=0)
    region: Optional[str] = None


class UpdateVehicleRequest(BaseModel):
    """Request body for PUT /vehicles/{vehicle_id}."""
    registration_number: Optional[str] = Field(None, min_length=1, max_length=50)
    name_model: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = None
    max_load_capacity_kg: Optional[float] = Field(None, gt=0)
    odometer_km: Optional[float] = Field(None, ge=0)
    acquisition_cost: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None
    region: Optional[str] = None


class VehicleResponse(BaseModel):
    """Single vehicle in API responses."""
    id: int
    registration_number: str
    name_model: str
    type: str
    max_load_capacity_kg: float
    odometer_km: float
    acquisition_cost: float
    status: str
    region: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
