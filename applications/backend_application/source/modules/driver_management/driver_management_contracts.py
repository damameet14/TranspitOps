"""Pydantic contracts for driver management requests and responses."""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field
from source.shared_infrastructure.database_models.driver_model import DriverStatus


class CreateDriverRequest(BaseModel):
    """Request body for POST /drivers."""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    license_number: str = Field(..., min_length=1, max_length=50)
    license_category: str = Field(..., min_length=1, max_length=50)
    license_expiry_date: date
    contact_number: str = Field(..., min_length=1, max_length=20)
    safety_score: int = Field(default=100, ge=0, le=100)


class UpdateDriverRequest(BaseModel):
    """Request body for PUT /drivers/{driver_id}."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    license_number: Optional[str] = Field(None, min_length=1, max_length=50)
    license_category: Optional[str] = None
    license_expiry_date: Optional[date] = None
    contact_number: Optional[str] = None
    safety_score: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[DriverStatus] = None


class DriverResponse(BaseModel):
    """Single driver in API responses."""
    id: int
    name: str
    email: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: int
    status: str
    is_license_expired: bool
    created_at: datetime
    updated_at: datetime
    fleet_manager_id: int | None = None
    current_location_id: int | None = None

    model_config = {"from_attributes": True}


class DriverRecommendationResponse(DriverResponse):
    recommendation_score: int
    recommendation_reason: str
