"""SQLAlchemy model for route optimization suggestions."""

import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from source.application_startup.database_connection import DatabaseBaseModel


class RouteProvider(str, enum.Enum):
    RULE_BASED = "rule_based"
    GOOGLE = "google"


class RouteSuggestion(DatabaseBaseModel):
    __tablename__ = "route_suggestions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id"), nullable=True)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    provider: Mapped[RouteProvider] = mapped_column(Enum(RouteProvider), nullable=False)
    suggested_distance_km: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    suggested_duration_minutes: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    raw_response: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
