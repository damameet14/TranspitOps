"""Route registration for the TransitOps backend application.

Mounts all module transport routers onto the FastAPI application
under the /api prefix.
"""

from fastapi import FastAPI


def register_all_routes(application: FastAPI) -> None:
    """Mount all module routers. Import is deferred to avoid circular dependencies."""

    # Phase 2: Authentication, Vehicles, Drivers
    from source.modules.user_authentication.user_authentication_transport import (
        user_authentication_router,
    )
    from source.modules.vehicle_registry.vehicle_registry_transport import (
        vehicle_registry_router,
    )
    from source.modules.vehicle_registry.vehicle_document_transport import vehicle_document_router
    from source.modules.driver_management.driver_management_transport import (
        driver_management_router,
    )

    application.include_router(user_authentication_router, prefix="/api")
    from source.modules.user_administration.user_administration_transport import user_administration_router
    application.include_router(user_administration_router, prefix="/api")
    application.include_router(vehicle_registry_router, prefix="/api")
    application.include_router(vehicle_document_router, prefix="/api")
    application.include_router(driver_management_router, prefix="/api")

    # Phase 3: Trips, Maintenance
    from source.modules.trip_lifecycle_management.trip_lifecycle_transport import (
        trip_lifecycle_router,
    )
    from source.modules.maintenance_tracking.maintenance_tracking_transport import (
        maintenance_tracking_router,
    )

    application.include_router(trip_lifecycle_router, prefix="/api")
    application.include_router(maintenance_tracking_router, prefix="/api")
    from source.modules.location_catalog.location_catalog_transport import location_catalog_router
    application.include_router(location_catalog_router, prefix="/api")

    # Phase 4: Fuel/Expenses, Dashboard, Reports, Route Optimization
    from source.modules.fuel_and_expense_tracking.fuel_and_expense_transport import (
        fuel_and_expense_router,
    )
    from source.modules.operational_dashboard.operational_dashboard_transport import (
        operational_dashboard_router,
    )
    from source.modules.reporting_and_analytics.reporting_transport import (
        reporting_router,
    )
    from source.modules.route_optimization.route_optimization_transport import (
        route_optimization_router,
    )

    application.include_router(fuel_and_expense_router, prefix="/api")
    application.include_router(operational_dashboard_router, prefix="/api")
    application.include_router(reporting_router, prefix="/api")
    application.include_router(route_optimization_router, prefix="/api")
