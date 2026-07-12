# Trip Lifecycle Management

## Purpose
Manages the full lifecycle of delivery trips — from creation through dispatch, completion, and cancellation — enforcing all business rules related to vehicle and driver availability.

## Owned Responsibilities
- Creating trips in Draft status with rule validation
- Dispatching trips (Draft → Dispatched) with vehicle/driver status sync
- Completing trips (Dispatched → Completed) with odometer, fuel, and auto-FuelLog
- Cancelling trips (Draft/Dispatched → Cancelled) with resource release
- Listing and retrieving trip records

## Not Owned
- Vehicle CRUD (owned by vehicle_registry)
- Driver CRUD (owned by driver_management)
- Fuel log CRUD beyond auto-creation (owned by fuel_and_expense_tracking)
- Dashboard KPI aggregation (owned by operational_dashboard)

## Business Rules Enforced
- **Rule 2:** Vehicle must be Available to create a trip
- **Rule 3:** Driver must be Available, not Suspended, license not expired
- **Rule 4:** Neither vehicle nor driver may have an active (Draft/Dispatched) trip
- **Rule 5:** Cargo weight must not exceed vehicle max_load_capacity_kg
- **Rule 6:** On dispatch → vehicle and driver status set to On Trip
- **Rule 7:** On completion → vehicle odometer updated, vehicle+driver set to Available, FuelLog auto-created
- **Rule 8:** On cancellation → if Dispatched, vehicle+driver set to Available

## Public Operations
| Operation | File | Contract In | Contract Out |
|-----------|------|------------|-------------|
| create_trip_as_draft | create_trip_as_draft.py | CreateTripRequest | Trip |
| dispatch_trip | dispatch_trip.py | trip_id | Trip |
| complete_trip | complete_trip.py | trip_id + CompleteTripRequest | Trip |
| cancel_trip | cancel_trip.py | trip_id | Trip |
| retrieve_all_trips | retrieve_trips.py | status_filter? | list[Trip] |
| retrieve_trip_by_id | retrieve_trips.py | trip_id | Trip |

## Dependencies
- shared_infrastructure/database_models (Trip, Vehicle, Driver, FuelLog)
- shared_infrastructure/standard_error_responses
- shared_infrastructure/role_based_access_control

## Transport
- `trip_lifecycle_transport.py` — 6 HTTP endpoints under `/api/trips`
