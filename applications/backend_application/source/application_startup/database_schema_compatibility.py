"""Idempotent compatibility upgrades for installations created before migrations existed."""

from sqlalchemy import Engine, text


def ensure_database_schema_compatibility(database_engine: Engine) -> None:
    """Apply small idempotent upgrades to installations without Alembic."""
    if database_engine.dialect.name != "postgresql":
        return

    with database_engine.begin() as connection:
        connection.execute(text("ALTER TABLE drivers ADD COLUMN IF NOT EXISTS email VARCHAR(255)"))
        connection.execute(text(
            "UPDATE drivers SET email = 'driver-' || id || '@transitops.local' WHERE email IS NULL"
        ))
        connection.execute(text("ALTER TABLE drivers ALTER COLUMN email SET NOT NULL"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_drivers_email ON drivers (email)"))
        connection.execute(text("ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS driver_id INTEGER"))
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
