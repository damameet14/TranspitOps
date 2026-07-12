"""Authenticated HTTP lookup for database-backed service locations."""

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.service_location_model import ServiceLocation
from source.shared_infrastructure.database_models.user_account_model import UserAccount
from source.shared_infrastructure.role_based_access_control import get_current_authenticated_user


class ServiceLocationResponse(BaseModel):
    id: int
    city: str
    state: str


location_catalog_router = APIRouter(prefix="/locations", tags=["location catalog"])


@location_catalog_router.get("", response_model=list[ServiceLocationResponse])
def list_service_locations(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> list[ServiceLocationResponse]:
    """Return all city/state choices in display order."""
    locations = database_session.query(ServiceLocation).order_by(ServiceLocation.state, ServiceLocation.city).all()
    return [ServiceLocationResponse(id=location.id, city=location.city, state=location.state) for location in locations]
