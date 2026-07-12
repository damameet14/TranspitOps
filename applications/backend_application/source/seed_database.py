"""Seed database with demo data for TransitOps.

Creates:
- 4 users (one per role) with known passwords
- 10 vehicles across all statuses, types, and regions
- 10 drivers including one suspended and one with expired license

Usage:
    docker-compose exec backend python -m source.seed_database
    OR
    python -m source.seed_database  (if running locally)
"""

import sys
import os
from datetime import date, datetime, timezone

# Add the backend app root to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from source.application_startup.database_connection import DatabaseSessionFactory, database_engine, DatabaseBaseModel
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus, VehicleType
from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.modules.user_authentication.authenticate_user_credentials import hash_password


def seed_users(session):
    """Create 4 demo users, one per role."""
    users = [
        UserAccount(
            email="fleet@transitops.io",
            hashed_password=hash_password("fleet123"),
            full_name="Priya Sharma",
            role=UserRole.FLEET_MANAGER,
        ),
        UserAccount(
            email="driver@transitops.io",
            hashed_password=hash_password("driver123"),
            full_name="Raj Patel",
            role=UserRole.DRIVER,
        ),
        UserAccount(
            email="safety@transitops.io",
            hashed_password=hash_password("safety123"),
            full_name="Anita Desai",
            role=UserRole.SAFETY_OFFICER,
        ),
        UserAccount(
            email="finance@transitops.io",
            hashed_password=hash_password("finance123"),
            full_name="Vikram Mehta",
            role=UserRole.FINANCIAL_ANALYST,
        ),
    ]
    for user in users:
        existing = session.query(UserAccount).filter(UserAccount.email == user.email).first()
        if existing is None:
            session.add(user)
    session.commit()
    print("✓ Users seeded")


def seed_vehicles(session):
    """Create 10 vehicles across different types, statuses, and regions."""
    vehicles = [
        Vehicle(
            registration_number="GJ-01-TR-1001",
            name_model="Tata Ace Gold",
            type=VehicleType.TRUCK,
            max_load_capacity_kg=750,
            odometer_km=45200,
            acquisition_cost=600000,
            status=VehicleStatus.AVAILABLE,
            region="Ahmedabad West",
        ),
        Vehicle(
            registration_number="GJ-01-TR-1002",
            name_model="Mahindra Bolero Pickup",
            type=VehicleType.TRUCK,
            max_load_capacity_kg=1500,
            odometer_km=72300,
            acquisition_cost=850000,
            status=VehicleStatus.AVAILABLE,
            region="Ahmedabad East",
        ),
        Vehicle(
            registration_number="GJ-01-VN-2001",
            name_model="Maruti Suzuki Eeco Cargo",
            type=VehicleType.VAN,
            max_load_capacity_kg=450,
            odometer_km=31500,
            acquisition_cost=450000,
            status=VehicleStatus.AVAILABLE,
            region="Ahmedabad West",
        ),
        Vehicle(
            registration_number="GJ-01-VN-2002",
            name_model="Tata Winger",
            type=VehicleType.VAN,
            max_load_capacity_kg=1000,
            odometer_km=58700,
            acquisition_cost=720000,
            status=VehicleStatus.ON_TRIP,
            region="Gandhinagar",
        ),
        # Van-05: used in the demo scenario
        Vehicle(
            registration_number="GJ-01-VN-2005",
            name_model="Force Traveller 3350",
            type=VehicleType.VAN,
            max_load_capacity_kg=800,
            odometer_km=22100,
            acquisition_cost=550000,
            status=VehicleStatus.AVAILABLE,
            region="Ahmedabad West",
        ),
        Vehicle(
            registration_number="GJ-01-BK-3001",
            name_model="Bajaj Maxima Cargo",
            type=VehicleType.BIKE,
            max_load_capacity_kg=150,
            odometer_km=18900,
            acquisition_cost=180000,
            status=VehicleStatus.AVAILABLE,
            region="Ahmedabad East",
        ),
        Vehicle(
            registration_number="GJ-01-TR-1003",
            name_model="Ashok Leyland Dost",
            type=VehicleType.TRUCK,
            max_load_capacity_kg=2500,
            odometer_km=98400,
            acquisition_cost=950000,
            status=VehicleStatus.IN_SHOP,
            region="Ahmedabad West",
        ),
        Vehicle(
            registration_number="GJ-01-VN-2003",
            name_model="Mahindra Supro Van",
            type=VehicleType.VAN,
            max_load_capacity_kg=600,
            odometer_km=41200,
            acquisition_cost=500000,
            status=VehicleStatus.RETIRED,
            region="Gandhinagar",
        ),
        Vehicle(
            registration_number="GJ-01-OT-4001",
            name_model="Piaggio Ape Xtra",
            type=VehicleType.OTHER,
            max_load_capacity_kg=500,
            odometer_km=12800,
            acquisition_cost=250000,
            status=VehicleStatus.AVAILABLE,
            region="Ahmedabad East",
        ),
        Vehicle(
            registration_number="GJ-01-TR-1004",
            name_model="Eicher Pro 2049",
            type=VehicleType.TRUCK,
            max_load_capacity_kg=4500,
            odometer_km=132000,
            acquisition_cost=1800000,
            status=VehicleStatus.AVAILABLE,
            region="Rajkot",
        ),
    ]
    for vehicle in vehicles:
        existing = session.query(Vehicle).filter(
            Vehicle.registration_number == vehicle.registration_number
        ).first()
        if existing is None:
            session.add(vehicle)
    session.commit()
    print("✓ Vehicles seeded (10 vehicles, 4 types, 4 statuses)")


def seed_drivers(session):
    """Create 10 drivers with varying statuses and license validity."""
    drivers = [
        Driver(
            name="Amit Kumar",
            license_number="GJ-DL-2020-001",
            license_category="LMV-TR",
            license_expiry_date=date(2027, 6, 15),
            contact_number="+91-9876543210",
            safety_score=92,
            status=DriverStatus.AVAILABLE,
        ),
        Driver(
            name="Suresh Yadav",
            license_number="GJ-DL-2019-002",
            license_category="HMV",
            license_expiry_date=date(2027, 3, 20),
            contact_number="+91-9876543211",
            safety_score=85,
            status=DriverStatus.AVAILABLE,
        ),
        # Alex — used in Van-05 demo scenario
        Driver(
            name="Alex Fernandez",
            license_number="GJ-DL-2021-003",
            license_category="LMV-TR",
            license_expiry_date=date(2028, 1, 10),
            contact_number="+91-9876543212",
            safety_score=95,
            status=DriverStatus.AVAILABLE,
        ),
        Driver(
            name="Ramesh Patel",
            license_number="GJ-DL-2018-004",
            license_category="HMV",
            license_expiry_date=date(2027, 9, 30),
            contact_number="+91-9876543213",
            safety_score=78,
            status=DriverStatus.ON_TRIP,
        ),
        Driver(
            name="Mohammed Shaikh",
            license_number="GJ-DL-2020-005",
            license_category="LMV",
            license_expiry_date=date(2027, 12, 1),
            contact_number="+91-9876543214",
            safety_score=88,
            status=DriverStatus.AVAILABLE,
        ),
        # Suspended driver — demonstrates rule enforcement
        Driver(
            name="Kiran Joshi",
            license_number="GJ-DL-2019-006",
            license_category="LMV-TR",
            license_expiry_date=date(2027, 4, 15),
            contact_number="+91-9876543215",
            safety_score=35,
            status=DriverStatus.SUSPENDED,
        ),
        # Expired license — demonstrates rule enforcement
        Driver(
            name="Deepak Verma",
            license_number="GJ-DL-2017-007",
            license_category="HMV",
            license_expiry_date=date(2024, 11, 30),
            contact_number="+91-9876543216",
            safety_score=72,
            status=DriverStatus.AVAILABLE,
        ),
        Driver(
            name="Nilesh Shah",
            license_number="GJ-DL-2021-008",
            license_category="LMV",
            license_expiry_date=date(2028, 7, 20),
            contact_number="+91-9876543217",
            safety_score=90,
            status=DriverStatus.OFF_DUTY,
        ),
        Driver(
            name="Prakash Solanki",
            license_number="GJ-DL-2020-009",
            license_category="LMV-TR",
            license_expiry_date=date(2027, 8, 10),
            contact_number="+91-9876543218",
            safety_score=82,
            status=DriverStatus.AVAILABLE,
        ),
        Driver(
            name="Sanjay Thakur",
            license_number="GJ-DL-2022-010",
            license_category="HMV",
            license_expiry_date=date(2029, 2, 28),
            contact_number="+91-9876543219",
            safety_score=96,
            status=DriverStatus.AVAILABLE,
        ),
    ]
    for driver in drivers:
        existing = session.query(Driver).filter(
            Driver.license_number == driver.license_number
        ).first()
        if existing is None:
            session.add(driver)
    session.commit()
    print("✓ Drivers seeded (10 drivers, including 1 suspended + 1 expired license)")


def run_seed():
    """Run all seed operations."""
    # Import all models to register them
    import source.shared_infrastructure.database_models.user_account_model  # noqa: F401
    import source.shared_infrastructure.database_models.vehicle_model  # noqa: F401
    import source.shared_infrastructure.database_models.driver_model  # noqa: F401
    import source.shared_infrastructure.database_models.trip_model  # noqa: F401
    import source.shared_infrastructure.database_models.maintenance_log_model  # noqa: F401
    import source.shared_infrastructure.database_models.fuel_log_model  # noqa: F401
    import source.shared_infrastructure.database_models.expense_model  # noqa: F401
    import source.shared_infrastructure.database_models.route_suggestion_model  # noqa: F401

    # Create tables
    DatabaseBaseModel.metadata.create_all(bind=database_engine)
    print("✓ Database tables created")

    session = DatabaseSessionFactory()
    try:
        seed_users(session)
        seed_vehicles(session)
        seed_drivers(session)

        print("\n" + "=" * 50)
        print("  TransitOps — Demo credentials")
        print("=" * 50)
        print(f"  Fleet Manager:     fleet@transitops.io / fleet123")
        print(f"  Driver:            driver@transitops.io / driver123")
        print(f"  Safety Officer:    safety@transitops.io / safety123")
        print(f"  Financial Analyst: finance@transitops.io / finance123")
        print("=" * 50)
        print("\n  Van-05 demo scenario:")
        print("  Vehicle: GJ-01-VN-2005 (Force Traveller 3350)")
        print("  Driver:  Alex Fernandez (GJ-DL-2021-003)")
        print("=" * 50 + "\n")
    finally:
        session.close()


if __name__ == "__main__":
    run_seed()
