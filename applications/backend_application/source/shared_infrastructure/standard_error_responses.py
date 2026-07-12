"""Standard error response shapes for consistent API error handling.

All business-rule violations and validation errors use this shape so the
frontend can rely on a single error format: {"detail": "...", "code": "..."}.
"""

from fastapi import HTTPException


class TransitOpsError(HTTPException):
    """Base error for all TransitOps business-rule violations."""

    def __init__(self, status_code: int, detail: str, error_code: str):
        super().__init__(
            status_code=status_code,
            detail={"detail": detail, "code": error_code},
        )


class DuplicateRegistrationNumberError(TransitOpsError):
    def __init__(self, registration_number: str):
        super().__init__(
            status_code=409,
            detail=f"Vehicle with registration number '{registration_number}' already exists.",
            error_code="DUPLICATE_REGISTRATION_NUMBER",
        )


class VehicleNotAvailableForDispatchError(TransitOpsError):
    def __init__(self, vehicle_id: int, current_status: str):
        super().__init__(
            status_code=409,
            detail=f"Vehicle {vehicle_id} is currently '{current_status}' and cannot be assigned to a trip.",
            error_code="VEHICLE_NOT_AVAILABLE",
        )


class VehicleHasTripHistoryError(TransitOpsError):
    def __init__(self, vehicle_id: int):
        super().__init__(
            status_code=409,
            detail=(
                f"Vehicle {vehicle_id} cannot be deleted because it is referenced by trip history. "
                "Keep the vehicle record to preserve operational history."
            ),
            error_code="VEHICLE_HAS_TRIP_HISTORY",
        )


class VehicleNotEligibleForMaintenanceError(TransitOpsError):
    def __init__(self, vehicle_id: int, reason: str):
        super().__init__(
            status_code=409,
            detail=f"Vehicle {vehicle_id} cannot enter maintenance: {reason}.",
            error_code="VEHICLE_NOT_ELIGIBLE_FOR_MAINTENANCE",
        )


class FinalOdometerRegressionError(TransitOpsError):
    def __init__(self, vehicle_id: int, current_odometer_km: float, final_odometer_km: float):
        super().__init__(
            status_code=422,
            detail=(
                f"Vehicle {vehicle_id} final odometer {final_odometer_km} km cannot be below "
                f"its current odometer {current_odometer_km} km."
            ),
            error_code="FINAL_ODOMETER_REGRESSION",
        )


class DriverNotEligibleForTripError(TransitOpsError):
    def __init__(self, driver_id: int, reason: str):
        super().__init__(
            status_code=409,
            detail=f"Driver {driver_id} cannot be assigned: {reason}.",
            error_code="DRIVER_NOT_ELIGIBLE",
        )


class DriverHasTripHistoryError(TransitOpsError):
    def __init__(self, driver_id: int):
        super().__init__(
            status_code=409,
            detail=(
                f"Driver {driver_id} cannot be deleted because they are referenced by trip history. "
                "Keep the driver record to preserve operational history."
            ),
            error_code="DRIVER_HAS_TRIP_HISTORY",
        )


class CargoWeightExceedsCapacityError(TransitOpsError):
    def __init__(self, cargo_weight_kg: float, max_capacity_kg: float):
        super().__init__(
            status_code=422,
            detail=(
                f"Cargo weight {cargo_weight_kg} kg exceeds vehicle maximum "
                f"load capacity of {max_capacity_kg} kg."
            ),
            error_code="CARGO_EXCEEDS_CAPACITY",
        )


class InvalidTripStateTransitionError(TransitOpsError):
    def __init__(self, trip_id: int, current_status: str, attempted_status: str):
        super().__init__(
            status_code=409,
            detail=(
                f"Trip {trip_id} cannot transition from '{current_status}' "
                f"to '{attempted_status}'."
            ),
            error_code="INVALID_TRIP_STATE_TRANSITION",
        )


class ResourceNotFoundError(TransitOpsError):
    def __init__(self, resource_type: str, resource_id: int):
        super().__init__(
            status_code=404,
            detail=f"{resource_type} with ID {resource_id} not found.",
            error_code="RESOURCE_NOT_FOUND",
        )


class InsufficientPermissionsError(TransitOpsError):
    def __init__(self):
        super().__init__(
            status_code=403,
            detail="You do not have permission to perform this action.",
            error_code="INSUFFICIENT_PERMISSIONS",
        )


class DriverAccountNotLinkedError(TransitOpsError):
    def __init__(self):
        super().__init__(
            status_code=403,
            detail="This driver login is not linked to a driver record. Contact a fleet manager.",
            error_code="DRIVER_ACCOUNT_NOT_LINKED",
        )


class DriverTripOwnershipError(TransitOpsError):
    def __init__(self, trip_driver_id: int):
        super().__init__(
            status_code=403,
            detail=f"Drivers can only manage trips assigned to their own driver record, not driver {trip_driver_id}.",
            error_code="DRIVER_TRIP_OWNERSHIP_REQUIRED",
        )


class ManagedStatusTransitionError(TransitOpsError):
    def __init__(self, resource_type: str, status: str):
        super().__init__(
            status_code=409,
            detail=f"{resource_type} status '{status}' is controlled by trip or maintenance workflows and cannot be set manually.",
            error_code="STATUS_CONTROLLED_BY_WORKFLOW",
        )
