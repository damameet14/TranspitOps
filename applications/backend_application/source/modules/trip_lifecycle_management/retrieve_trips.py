"""Retrieve trip records with optional filtering."""

from typing import Optional

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError


def retrieve_all_trips(
    database_session: Session,
    status_filter: Optional[str] = None,
    driver_id_filter: Optional[int] = None,
<<<<<<< HEAD
    driver_ids_filter: Optional[list[int]] = None,
=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
) -> list[Trip]:
    """Return all trips, optionally filtered by status."""
    query = database_session.query(Trip)
    if driver_id_filter is not None:
        query = query.filter(Trip.driver_id == driver_id_filter)
<<<<<<< HEAD
    if driver_ids_filter is not None:
        query = query.filter(Trip.driver_id.in_(driver_ids_filter))
=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
    if status_filter is not None:
        try:
            trip_status = TripStatus(status_filter)
            query = query.filter(Trip.status == trip_status)
        except ValueError:
            pass  # Ignore invalid status filter, return all
    return query.order_by(Trip.created_at.desc()).all()


def retrieve_trip_by_id(
    database_session: Session,
    trip_id: int,
) -> Trip:
    """Return a single trip by ID. Raises 404 if not found."""
    trip = database_session.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise ResourceNotFoundError("Trip", trip_id)
    return trip
