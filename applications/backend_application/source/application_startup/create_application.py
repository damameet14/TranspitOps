"""FastAPI application factory for the TransitOps backend.

Creates the application, configures CORS, creates database tables on startup,
and registers all module routes.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from source.application_startup.database_connection import DatabaseBaseModel, database_engine
from source.application_startup.database_schema_compatibility import ensure_database_schema_compatibility


@asynccontextmanager
async def application_lifespan(application: FastAPI):
    """Create all database tables on startup (hackathon speed — no Alembic)."""
    # Import all models so SQLAlchemy registers them with the metadata
    import source.shared_infrastructure.database_models.user_account_model  # noqa: F401
    import source.shared_infrastructure.database_models.vehicle_model  # noqa: F401
    import source.shared_infrastructure.database_models.driver_model  # noqa: F401
    import source.shared_infrastructure.database_models.trip_model  # noqa: F401
    import source.shared_infrastructure.database_models.maintenance_log_model  # noqa: F401
    import source.shared_infrastructure.database_models.fuel_log_model  # noqa: F401
    import source.shared_infrastructure.database_models.expense_model  # noqa: F401
    import source.shared_infrastructure.database_models.route_suggestion_model  # noqa: F401
    import source.shared_infrastructure.database_models.vehicle_document_model  # noqa: F401

    DatabaseBaseModel.metadata.create_all(bind=database_engine)
    ensure_database_schema_compatibility(database_engine)
    yield


def create_transit_ops_application() -> FastAPI:
    """Build and configure the TransitOps FastAPI application."""
    transit_ops_application = FastAPI(
        title="TransitOps API",
        description="Smart Transport Operations Platform — vehicle, driver, dispatch, maintenance, and expense management.",
        version="1.0.0",
        lifespan=application_lifespan,
    )

    # CORS — allow all origins for hackathon LAN access (tighten in production)
    transit_ops_application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check endpoint
    @transit_ops_application.get("/api/health")
    def health_check():
        return {"status": "healthy", "application": "TransitOps"}

    # Register all module routes
    from source.application_startup.register_routes import register_all_routes
    register_all_routes(transit_ops_application)

    return transit_ops_application


application = create_transit_ops_application()
