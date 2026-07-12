"""SQLAlchemy model for vehicles in the fleet registry."""

import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from source.application_startup.database_connection import DatabaseBaseModel


class VehicleType(str, enum.Enum):
    TRUCK = "truck"
    VAN = "van"
    BIKE = "bike"
    OTHER = "other"


class VehicleStatus(str, enum.Enum):
    AVAILABLE = "available"
    ON_TRIP = "on_trip"
    IN_SHOP = "in_shop"
    RETIRED = "retired"


class Vehicle(DatabaseBaseModel):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    registration_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    name_model: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[VehicleType] = mapped_column(Enum(VehicleType), nullable=False)
    max_load_capacity_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    odometer_km: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    acquisition_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    status: Mapped[VehicleStatus] = mapped_column(
        Enum(VehicleStatus), nullable=False, default=VehicleStatus.AVAILABLE
    )
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
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
