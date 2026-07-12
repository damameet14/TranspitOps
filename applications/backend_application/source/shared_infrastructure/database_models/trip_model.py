"""SQLAlchemy model for trips with lifecycle state tracking."""

import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from source.application_startup.database_connection import DatabaseBaseModel


class TripStatus(str, enum.Enum):
    DRAFT = "draft"
    DISPATCHED = "dispatched"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Trip(DatabaseBaseModel):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), nullable=False)
    cargo_weight_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    planned_distance_km: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    actual_distance_km: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    revenue: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    status: Mapped[TripStatus] = mapped_column(
        Enum(TripStatus), nullable=False, default=TripStatus.DRAFT
    )
    final_odometer_km: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    fuel_consumed_liters: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    dispatched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    vehicle = relationship("Vehicle", lazy="joined")
    driver = relationship("Driver", lazy="joined")
