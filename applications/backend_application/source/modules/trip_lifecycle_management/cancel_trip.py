"""Cancel a trip: Draft → Cancelled or Dispatched → Cancelled.

Business rule 8:
    - From Dispatched: set vehicle.status = Available, driver.status = Available
    - From Draft: no status changes needed (vehicle/driver were not yet assigned)
"""

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus
from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.standard_error_responses import (
    InvalidTripStateTransitionError,
    ResourceNotFoundError,
)


def cancel_trip(
    database_session: Session,
    trip_id: int,
) -> Trip:
    """Transition trip to Cancelled from Draft or Dispatched.

    Side effects (from Dispatched only):
        - Vehicle status → Available
        - Driver status → Available

    Raises InvalidTripStateTransitionError if trip is already Completed or Cancelled.
    """
    trip = database_session.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise ResourceNotFoundError("Trip", trip_id)

    if trip.status not in (TripStatus.DRAFT, TripStatus.DISPATCHED):
        raise InvalidTripStateTransitionError(trip_id, trip.status.value, TripStatus.CANCELLED.value)

    # If trip was dispatched, release vehicle and driver
    if trip.status == TripStatus.DISPATCHED:
        vehicle = database_session.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        if vehicle is not None:
            vehicle.status = VehicleStatus.AVAILABLE

        driver = database_session.query(Driver).filter(Driver.id == trip.driver_id).first()
        if driver is not None:
            driver.status = DriverStatus.AVAILABLE

    trip.status = TripStatus.CANCELLED

    database_session.commit()
    database_session.refresh(trip)

    return trip
