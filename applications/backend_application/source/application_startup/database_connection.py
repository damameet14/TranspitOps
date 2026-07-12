"""Database connection management for TransitOps.

Provides the SQLAlchemy engine, session factory, and a FastAPI dependency
for injecting database sessions into route handlers.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from typing import Generator


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://transitops:transitops_dev_2026@localhost:5432/transitops",
)

database_engine = create_engine(DATABASE_URL, pool_pre_ping=True)

DatabaseSessionFactory = sessionmaker(
    bind=database_engine,
    autocommit=False,
    autoflush=False,
)


class DatabaseBaseModel(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models in TransitOps."""
    pass


def get_database_session() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session and closes it after use."""
    session = DatabaseSessionFactory()
    try:
        yield session
    finally:
        session.close()
