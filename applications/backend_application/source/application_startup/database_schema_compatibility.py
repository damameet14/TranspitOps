"""Idempotent compatibility upgrades for installations created before migrations existed."""

from sqlalchemy import Engine, text


def ensure_database_schema_compatibility(database_engine: Engine) -> None:
    """Apply small idempotent upgrades to installations without Alembic."""
    if database_engine.dialect.name != "postgresql":
        return

    with database_engine.begin() as connection:
<<<<<<< HEAD
        connection.execute(text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ADMIN'"))
=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
        connection.execute(text("ALTER TABLE drivers ADD COLUMN IF NOT EXISTS email VARCHAR(255)"))
        connection.execute(text(
            "UPDATE drivers SET email = 'driver-' || id || '@transitops.local' WHERE email IS NULL"
        ))
        connection.execute(text("ALTER TABLE drivers ALTER COLUMN email SET NOT NULL"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_drivers_email ON drivers (email)"))
        connection.execute(text("ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS driver_id INTEGER"))
<<<<<<< HEAD
        connection.execute(text("ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE"))
        connection.execute(text("ALTER TABLE drivers ADD COLUMN IF NOT EXISTS fleet_manager_id INTEGER"))
        connection.execute(text("ALTER TABLE drivers ADD COLUMN IF NOT EXISTS current_location_id INTEGER"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_drivers_fleet_manager_id ON drivers (fleet_manager_id)"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_drivers_current_location_id ON drivers (current_location_id)"))
        connection.execute(text("ALTER TABLE trips ADD COLUMN IF NOT EXISTS source_street_address VARCHAR(255)"))
        connection.execute(text("ALTER TABLE trips ADD COLUMN IF NOT EXISTS destination_street_address VARCHAR(255)"))
        connection.execute(text("ALTER TABLE trips ADD COLUMN IF NOT EXISTS source_location_id INTEGER"))
        connection.execute(text("ALTER TABLE trips ADD COLUMN IF NOT EXISTS destination_location_id INTEGER"))
        connection.execute(text("ALTER TABLE trips ADD COLUMN IF NOT EXISTS trip_date DATE"))
        connection.execute(text("UPDATE trips SET trip_date = created_at::date WHERE trip_date IS NULL"))
        connection.execute(text("ALTER TABLE trips ALTER COLUMN trip_date SET NOT NULL"))
=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
        connection.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_user_accounts_driver_id "
            "ON user_accounts (driver_id) WHERE driver_id IS NOT NULL"
        ))
        connection.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'fk_user_accounts_driver_id'
                ) THEN
                    ALTER TABLE user_accounts
                    ADD CONSTRAINT fk_user_accounts_driver_id
                    FOREIGN KEY (driver_id) REFERENCES drivers(id);
                END IF;
            END $$
        """))
