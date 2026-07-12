"""Database-backed city and state choices used by trip addresses."""

from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from source.application_startup.database_connection import DatabaseBaseModel


class ServiceLocation(DatabaseBaseModel):
    __tablename__ = "service_locations"
    __table_args__ = (UniqueConstraint("city", "state", name="uq_service_location_city_state"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
