"""Seed database with demo data for TransitOps.

Creates:
- 4 users (one per role) with known passwords
- 10 vehicles across all statuses, types, and regions
- 10 drivers including one suspended and one with expired license
- 8 trips across all lifecycle statuses (Draft, Dispatched, Completed, Cancelled)
- 2 maintenance records (1 Active, 1 Closed)
- Fuel logs and expenses
- Van-05 + Alex scenario data

Usage:
    docker-compose exec backend python -m source.seed_database
    OR
    python -m source.seed_database  (if running locally)
"""

import sys
import os
from datetime import date, datetime, timedelta, timezone

# Add the backend app root to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from source.application_startup.database_connection import DatabaseSessionFactory, database_engine, DatabaseBaseModel
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus, VehicleType
from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.database_models.maintenance_log_model import MaintenanceLog, MaintenanceStatus
from source.shared_infrastructure.database_models.fuel_log_model import FuelLog
from source.shared_infrastructure.database_models.expense_model import Expense
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
            email="amit.kumar@transitops.io",
            license_number="GJ-DL-2020-001",
            license_category="LMV-TR",
            license_expiry_date=date(2027, 6, 15),
            contact_number="+91-9876543210",
            safety_score=92,
            status=DriverStatus.AVAILABLE,
        ),
        Driver(
            name="Suresh Yadav",
            email="suresh.yadav@transitops.io",
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
            email="alex.fernandez@transitops.io",
            license_number="GJ-DL-2021-003",
            license_category="LMV-TR",
            license_expiry_date=date(2028, 1, 10),
            contact_number="+91-9876543212",
            safety_score=95,
            status=DriverStatus.AVAILABLE,
        ),
        Driver(
            name="Ramesh Patel",
            email="ramesh.patel@transitops.io",
            license_number="GJ-DL-2018-004",
            license_category="HMV",
            license_expiry_date=date(2027, 9, 30),
            contact_number="+91-9876543213",
            safety_score=78,
            status=DriverStatus.ON_TRIP,
        ),
        Driver(
            name="Mohammed Shaikh",
            email="mohammed.shaikh@transitops.io",
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
            email="kiran.joshi@transitops.io",
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
            email="deepak.verma@transitops.io",
            license_number="GJ-DL-2017-007",
            license_category="HMV",
            license_expiry_date=date(2024, 11, 30),
            contact_number="+91-9876543216",
            safety_score=72,
            status=DriverStatus.AVAILABLE,
        ),
        Driver(
            name="Nilesh Shah",
            email="nilesh.shah@transitops.io",
            license_number="GJ-DL-2021-008",
            license_category="LMV",
            license_expiry_date=date(2028, 7, 20),
            contact_number="+91-9876543217",
            safety_score=90,
            status=DriverStatus.OFF_DUTY,
        ),
        Driver(
            name="Prakash Solanki",
            email="prakash.solanki@transitops.io",
            license_number="GJ-DL-2020-009",
            license_category="LMV-TR",
            license_expiry_date=date(2027, 8, 10),
            contact_number="+91-9876543218",
            safety_score=82,
            status=DriverStatus.AVAILABLE,
        ),
        Driver(
            name="Sanjay Thakur",
            email="sanjay.thakur@transitops.io",
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
        else:
            existing.email = driver.email
    session.commit()
    print("✓ Drivers seeded (10 drivers, including 1 suspended + 1 expired license)")


def link_demo_driver_account(session):
    """Idempotently bind the driver demo login to Alex's driver record."""
    driver_user = session.query(UserAccount).filter(
        UserAccount.email == "driver@transitops.io"
    ).first()
    alex_driver = session.query(Driver).filter(
        Driver.email == "alex.fernandez@transitops.io"
    ).first()
    if driver_user is not None and alex_driver is not None:
        driver_user.driver_id = alex_driver.id
        session.commit()
    print("Driver login linked to its driver record")


def seed_trips(session):
    """Create trips across all lifecycle statuses.

    Requires vehicles and drivers to be seeded first.
    Uses direct ID references based on insertion order.
    """
    existing_trips = session.query(Trip).count()
    if existing_trips > 0:
        print("✓ Trips already seeded, skipping")
        return

    now = datetime.now(timezone.utc)

    # Lookup Van-05 and Alex for the demo scenario
    van_05 = session.query(Vehicle).filter(Vehicle.registration_number == "GJ-01-VN-2005").first()
    alex = session.query(Driver).filter(Driver.license_number == "GJ-DL-2021-003").first()
    truck_01 = session.query(Vehicle).filter(Vehicle.registration_number == "GJ-01-TR-1001").first()
    amit = session.query(Driver).filter(Driver.license_number == "GJ-DL-2020-001").first()
    truck_02 = session.query(Vehicle).filter(Vehicle.registration_number == "GJ-01-TR-1002").first()
    suresh = session.query(Driver).filter(Driver.license_number == "GJ-DL-2019-002").first()
    van_02 = session.query(Vehicle).filter(Vehicle.registration_number == "GJ-01-VN-2002").first()
    ramesh = session.query(Driver).filter(Driver.license_number == "GJ-DL-2018-004").first()
    bike_01 = session.query(Vehicle).filter(Vehicle.registration_number == "GJ-01-BK-3001").first()
    mohammed = session.query(Driver).filter(Driver.license_number == "GJ-DL-2020-005").first()
    piaggio = session.query(Vehicle).filter(Vehicle.registration_number == "GJ-01-OT-4001").first()
    prakash = session.query(Driver).filter(Driver.license_number == "GJ-DL-2020-009").first()
    eicher = session.query(Vehicle).filter(Vehicle.registration_number == "GJ-01-TR-1004").first()
    sanjay = session.query(Driver).filter(Driver.license_number == "GJ-DL-2022-010").first()

    trips = []

    # Trip 1: Completed trip — Truck-01 + Amit (historical)
    if truck_01 and amit:
        trips.append(Trip(
            source="Ahmedabad",
            destination="Vadodara",
            vehicle_id=truck_01.id,
            driver_id=amit.id,
            cargo_weight_kg=500,
            planned_distance_km=112,
            actual_distance_km=118,
            revenue=15000,
            status=TripStatus.COMPLETED,
            final_odometer_km=45318,
            fuel_consumed_liters=14.5,
            dispatched_at=now - timedelta(days=5),
            completed_at=now - timedelta(days=5, hours=-8),
            created_at=now - timedelta(days=6),
        ))

    # Trip 2: Completed trip — Truck-02 + Suresh (historical)
    if truck_02 and suresh:
        trips.append(Trip(
            source="Gandhinagar",
            destination="Rajkot",
            vehicle_id=truck_02.id,
            driver_id=suresh.id,
            cargo_weight_kg=1200,
            planned_distance_km=215,
            actual_distance_km=220,
            revenue=28000,
            status=TripStatus.COMPLETED,
            final_odometer_km=72520,
            fuel_consumed_liters=28,
            dispatched_at=now - timedelta(days=3),
            completed_at=now - timedelta(days=2),
            created_at=now - timedelta(days=4),
        ))

    # Trip 3: Dispatched trip — Van-02 + Ramesh (currently active)
    if van_02 and ramesh:
        trips.append(Trip(
            source="Gandhinagar",
            destination="Ahmedabad",
            vehicle_id=van_02.id,
            driver_id=ramesh.id,
            cargo_weight_kg=750,
            planned_distance_km=25,
            revenue=5000,
            status=TripStatus.DISPATCHED,
            dispatched_at=now - timedelta(hours=4),
            created_at=now - timedelta(hours=6),
        ))

    # Trip 4: Cancelled trip — Bike-01 + Mohammed (was a draft, cancelled)
    if bike_01 and mohammed:
        trips.append(Trip(
            source="Ahmedabad East",
            destination="Ahmedabad West",
            vehicle_id=bike_01.id,
            driver_id=mohammed.id,
            cargo_weight_kg=50,
            planned_distance_km=15,
            revenue=2000,
            status=TripStatus.CANCELLED,
            created_at=now - timedelta(days=2),
        ))

    # Trip 5: Completed trip — Piaggio + Prakash (small delivery)
    if piaggio and prakash:
        trips.append(Trip(
            source="SG Highway",
            destination="Satellite",
            vehicle_id=piaggio.id,
            driver_id=prakash.id,
            cargo_weight_kg=200,
            planned_distance_km=8,
            actual_distance_km=9,
            revenue=3500,
            status=TripStatus.COMPLETED,
            final_odometer_km=12809,
            fuel_consumed_liters=1.5,
            dispatched_at=now - timedelta(days=7),
            completed_at=now - timedelta(days=7, hours=-3),
            created_at=now - timedelta(days=8),
        ))

    # Trip 6: Completed trip — Eicher + Sanjay (heavy load, long distance)
    if eicher and sanjay:
        trips.append(Trip(
            source="Rajkot",
            destination="Surat",
            vehicle_id=eicher.id,
            driver_id=sanjay.id,
            cargo_weight_kg=4000,
            planned_distance_km=340,
            actual_distance_km=348,
            revenue=55000,
            status=TripStatus.COMPLETED,
            final_odometer_km=132348,
            fuel_consumed_liters=52,
            dispatched_at=now - timedelta(days=10),
            completed_at=now - timedelta(days=9),
            created_at=now - timedelta(days=11),
        ))

    for trip in trips:
        session.add(trip)
    session.commit()
    print(f"✓ Trips seeded ({len(trips)} trips across 4 statuses)")


def seed_maintenance_records(session):
    """Create maintenance records — 1 Active (In Shop), 1 Closed."""
    existing = session.query(MaintenanceLog).count()
    if existing > 0:
        print("✓ Maintenance records already seeded, skipping")
        return

    now = datetime.now(timezone.utc)

    # The truck that's currently In Shop (GJ-01-TR-1003)
    truck_in_shop = session.query(Vehicle).filter(
        Vehicle.registration_number == "GJ-01-TR-1003"
    ).first()

    # A vehicle that had a past maintenance (Truck-01)
    truck_01 = session.query(Vehicle).filter(
        Vehicle.registration_number == "GJ-01-TR-1001"
    ).first()

    records = []

    # Active maintenance — Ashok Leyland Dost is in shop for brake service
    if truck_in_shop:
        records.append(MaintenanceLog(
            vehicle_id=truck_in_shop.id,
            type="brake_service",
            cost=15000,
            description="Complete brake pad replacement and drum inspection. Estimated 2 days.",
            status=MaintenanceStatus.ACTIVE,
            created_at=now - timedelta(days=1),
        ))

    # Closed maintenance — Tata Ace Gold had an oil change last week
    if truck_01:
        records.append(MaintenanceLog(
            vehicle_id=truck_01.id,
            type="oil_change",
            cost=3500,
            description="Regular oil change + filter replacement at 45000 km.",
            status=MaintenanceStatus.CLOSED,
            created_at=now - timedelta(days=10),
            closed_at=now - timedelta(days=9),
        ))

    for record in records:
        session.add(record)
    session.commit()
    print(f"✓ Maintenance records seeded ({len(records)} records: 1 active, 1 closed)")


def seed_fuel_logs(session):
    """Create fuel log entries for completed trips."""
    existing = session.query(FuelLog).count()
    if existing > 0:
        print("✓ Fuel logs already seeded, skipping")
        return

    # Find completed trips
    completed_trips = session.query(Trip).filter(Trip.status == TripStatus.COMPLETED).all()

    logs = []
    for trip in completed_trips:
        if trip.fuel_consumed_liters and trip.fuel_consumed_liters > 0:
            logs.append(FuelLog(
                vehicle_id=trip.vehicle_id,
                trip_id=trip.id,
                liters=float(trip.fuel_consumed_liters),
                cost=float(trip.fuel_consumed_liters) * 100,  # ₹100/liter estimate
                log_date=trip.completed_at.date() if trip.completed_at else date.today(),
            ))

    for log in logs:
        session.add(log)
    session.commit()
    print(f"✓ Fuel logs seeded ({len(logs)} entries from completed trips)")


def seed_expenses(session):
    """Create sample expenses for vehicles."""
    existing = session.query(Expense).count()
    if existing > 0:
        print("✓ Expenses already seeded, skipping")
        return

    truck_01 = session.query(Vehicle).filter(
        Vehicle.registration_number == "GJ-01-TR-1001"
    ).first()
    van_05 = session.query(Vehicle).filter(
        Vehicle.registration_number == "GJ-01-VN-2005"
    ).first()
    eicher = session.query(Vehicle).filter(
        Vehicle.registration_number == "GJ-01-TR-1004"
    ).first()

    expenses = []

    if truck_01:
        expenses.append(Expense(
            vehicle_id=truck_01.id,
            type="insurance",
            amount=25000,
            expense_date=date.today() - timedelta(days=30),
            notes="Annual comprehensive insurance renewal",
        ))
        expenses.append(Expense(
            vehicle_id=truck_01.id,
            type="toll",
            amount=1200,
            expense_date=date.today() - timedelta(days=5),
            notes="Ahmedabad-Vadodara expressway toll",
        ))

    if van_05:
        expenses.append(Expense(
            vehicle_id=van_05.id,
            type="insurance",
            amount=18000,
            expense_date=date.today() - timedelta(days=60),
            notes="Annual insurance premium",
        ))

    if eicher:
        expenses.append(Expense(
            vehicle_id=eicher.id,
            type="tire_replacement",
            amount=32000,
            expense_date=date.today() - timedelta(days=15),
            notes="Full set of 6 tires replaced at 130000 km",
        ))
        expenses.append(Expense(
            vehicle_id=eicher.id,
            type="toll",
            amount=2800,
            expense_date=date.today() - timedelta(days=10),
            notes="Rajkot-Surat highway tolls",
        ))

    for expense in expenses:
        session.add(expense)
    session.commit()
    print(f"✓ Expenses seeded ({len(expenses)} entries)")


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
    import source.shared_infrastructure.database_models.vehicle_document_model  # noqa: F401

    # Create tables
    DatabaseBaseModel.metadata.create_all(bind=database_engine)
    print("✓ Database tables created")

    session = DatabaseSessionFactory()
    try:
        seed_users(session)
        seed_vehicles(session)
        seed_drivers(session)
        link_demo_driver_account(session)
        seed_trips(session)
        seed_maintenance_records(session)
        seed_fuel_logs(session)
        seed_expenses(session)

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
        print("  Both are Available — ready for trip creation/dispatch/complete flow")
        print("=" * 50)
        print("\n  Seed data summary:")
        print("  - 4 users, 10 vehicles, 10 drivers")
        print("  - 6 trips (4 completed, 1 dispatched, 1 cancelled)")
        print("  - 2 maintenance records (1 active, 1 closed)")
        print("  - Fuel logs for completed trips")
        print("  - 5 expenses across 3 vehicles")
        print("=" * 50 + "\n")
    finally:
        session.close()


if __name__ == "__main__":
    run_seed()
