"""Pydantic contracts for maintenance tracking requests and responses."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CreateMaintenanceRecordRequest(BaseModel):
    """Request body for POST /maintenance."""
    vehicle_id: int = Field(..., gt=0)
    type: str = Field(..., min_length=1, max_length=100, description="E.g. oil_change, tire_replacement, brake_service")
    cost: float = Field(..., ge=0)
    description: Optional[str] = None


class MaintenanceRecordResponse(BaseModel):
    """Single maintenance record in API responses."""
    id: int
    vehicle_id: int
    type: str
    cost: float
    description: Optional[str]
    status: str
    created_at: datetime
    closed_at: Optional[datetime]

    # Denormalized vehicle info
    vehicle_registration_number: Optional[str] = None
    vehicle_name_model: Optional[str] = None

    model_config = {"from_attributes": True}
