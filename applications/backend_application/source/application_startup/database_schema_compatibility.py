"""Idempotent compatibility upgrades for installations created before migrations existed."""

from sqlalchemy import Engine, text


def ensure_database_schema_compatibility(database_engine: Engine) -> None:
    """Add the driver email contract to an existing PostgreSQL database safely."""
    if database_engine.dialect.name != "postgresql":
        return

    with database_engine.begin() as connection:
        connection.execute(text("ALTER TABLE drivers ADD COLUMN IF NOT EXISTS email VARCHAR(255)"))
        connection.execute(text(
            "UPDATE drivers SET email = 'driver-' || id || '@transitops.local' WHERE email IS NULL"
        ))
        connection.execute(text("ALTER TABLE drivers ALTER COLUMN email SET NOT NULL"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_drivers_email ON drivers (email)"))
