# Maintenance Tracking

## Purpose
Manages vehicle maintenance records — creating new records, closing completed maintenance, and auto-updating vehicle availability status.

## Owned Responsibilities
- Creating maintenance records (sets vehicle to In Shop)
- Closing maintenance records (restores vehicle to Available, unless Retired)
- Listing and retrieving maintenance records

## Not Owned
- Vehicle CRUD (owned by vehicle_registry)
- Trip lifecycle (owned by trip_lifecycle_management)
- Expense tracking for maintenance costs (owned by fuel_and_expense_tracking)

## Business Rules Enforced
- **Rule 9:** Creating an Active maintenance record → vehicle.status = In Shop
- **Rule 10:** Closing a maintenance record → vehicle.status = Available (unless Retired)

## Public Operations
| Operation | File | Contract In | Contract Out |
|-----------|------|------------|-------------|
| create_maintenance_record | create_maintenance_record.py | CreateMaintenanceRecordRequest | MaintenanceLog |
| close_maintenance_record | close_maintenance_record.py | maintenance_id | MaintenanceLog |
| retrieve_all_maintenance_records | retrieve_maintenance_records.py | filters? | list[MaintenanceLog] |
| retrieve_maintenance_record_by_id | retrieve_maintenance_records.py | maintenance_id | MaintenanceLog |

## Dependencies
- shared_infrastructure/database_models (MaintenanceLog, Vehicle)
- shared_infrastructure/standard_error_responses

## Transport
- `maintenance_tracking_transport.py` — 4 HTTP endpoints under `/api/maintenance`
