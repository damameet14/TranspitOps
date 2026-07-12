"""Pydantic contracts for driver management requests and responses."""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class CreateDriverRequest(BaseModel):
    """Request body for POST /drivers."""
    name: str = Field(..., min_length=1, max_length=255)
    license_number: str = Field(..., min_length=1, max_length=50)
    license_category: str = Field(..., min_length=1, max_length=50)
    license_expiry_date: date
    contact_number: str = Field(..., min_length=1, max_length=20)
    safety_score: int = Field(default=100, ge=0, le=100)


class UpdateDriverRequest(BaseModel):
    """Request body for PUT /drivers/{driver_id}."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    license_number: Optional[str] = Field(None, min_length=1, max_length=50)
    license_category: Optional[str] = None
    license_expiry_date: Optional[date] = None
    contact_number: Optional[str] = None
    safety_score: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[str] = None


class DriverResponse(BaseModel):
    """Single driver in API responses."""
    id: int
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: int
    status: str
    is_license_expired: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
