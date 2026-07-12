"""Business authorization rules for driver-owned trip data and actions."""

from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.standard_error_responses import (
    DriverAccountNotLinkedError,
    DriverTripOwnershipError,
)
<<<<<<< HEAD
from fastapi import HTTPException
from sqlalchemy.orm import Session
from source.shared_infrastructure.database_models.driver_model import Driver
=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407


def require_trip_driver_ownership(user: UserAccount, trip_driver_id: int) -> None:
    """Allow managers globally while restricting a driver login to its linked driver."""
    if user.role != UserRole.DRIVER:
        return
    if user.driver_id is None:
        raise DriverAccountNotLinkedError()
    if user.driver_id != trip_driver_id:
        raise DriverTripOwnershipError(trip_driver_id)
<<<<<<< HEAD


def require_fleet_manager_trip_scope(database_session: Session, user: UserAccount, trip_driver_id: int) -> None:
    """Restrict a fleet manager to trips owned by a driver on their team."""
    if user.role != UserRole.FLEET_MANAGER:
        return
    if not database_session.query(Driver.id).filter(Driver.id == trip_driver_id, Driver.fleet_manager_id == user.id).first():
        raise HTTPException(status_code=403, detail={"detail": "This trip belongs to another fleet manager's team.", "code": "FLEET_MANAGER_SCOPE_VIOLATION"})
=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
