"""SQLAlchemy model for drivers in the fleet."""

import enum
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from source.application_startup.database_connection import DatabaseBaseModel


class DriverStatus(str, enum.Enum):
    AVAILABLE = "available"
    ON_TRIP = "on_trip"
    OFF_DUTY = "off_duty"
    SUSPENDED = "suspended"


class Driver(DatabaseBaseModel):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    license_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    license_category: Mapped[str] = mapped_column(String(50), nullable=False)
    license_expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
    contact_number: Mapped[str] = mapped_column(String(20), nullable=False)
    safety_score: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    status: Mapped[DriverStatus] = mapped_column(
        Enum(DriverStatus), nullable=False, default=DriverStatus.AVAILABLE
    )
    fleet_manager_id: Mapped[int | None] = mapped_column(
        ForeignKey("user_accounts.id"), nullable=True, index=True
    )
    current_location_id: Mapped[int | None] = mapped_column(
        ForeignKey("service_locations.id"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
