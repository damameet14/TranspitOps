"""Seed database with rich demo data for TransitOps.

Creates:
- 1 admin + 2 fleet managers + 1 safety officer + 1 financial analyst
- 12 vehicles across all statuses and types
- 10 drivers split across both fleet managers
- 10 trips across all lifecycle statuses
- Route suggestions for completed trips
- 12 service locations across 5 states
- Maintenance records, fuel logs, expenses

Usage:
    docker-compose exec backend python -m source.seed_database
"""

import sys
import os
from datetime import date, datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from source.application_startup.database_connection import DatabaseSessionFactory, database_engine, DatabaseBaseModel
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus, VehicleType
from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.database_models.maintenance_log_model import MaintenanceLog, MaintenanceStatus
from source.shared_infrastructure.database_models.fuel_log_model import FuelLog
from source.shared_infrastructure.database_models.expense_model import Expense
from source.shared_infrastructure.database_models.route_suggestion_model import RouteSuggestion, RouteProvider
from source.shared_infrastructure.database_models.service_location_model import ServiceLocation
from source.modules.user_authentication.authenticate_user_credentials import hash_password


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _get(session, model, **filters):
    return session.query(model).filter_by(**filters).first()


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

def seed_users(session):
    """Create admin, 2 fleet managers, safety officer, financial analyst."""
    users = [
        UserAccount(
            email="admin@transitops.io",
            hashed_password=hash_password("Admin@2026"),
            full_name="System Administrator",
            role=UserRole.ADMIN,
            is_active=True,
        ),
        UserAccount(
            email="fleet1@transitops.io",
            hashed_password=hash_password("Fleet@2026"),
            full_name="Priya Sharma",
            role=UserRole.FLEET_MANAGER,
            is_active=True,
        ),
        UserAccount(
            email="fleet2@transitops.io",
            hashed_password=hash_password("Fleet@2026"),
            full_name="Karan Mehta",
            role=UserRole.FLEET_MANAGER,
            is_active=True,
        ),
        UserAccount(
            email="safety@transitops.io",
            hashed_password=hash_password("Safety@2026"),
            full_name="Anita Desai",
            role=UserRole.SAFETY_OFFICER,
            is_active=True,
        ),
        UserAccount(
            email="finance@transitops.io",
            hashed_password=hash_password("Finance@2026"),
            full_name="Vikram Mehta",
            role=UserRole.FINANCIAL_ANALYST,
            is_active=True,
        ),
    ]
    for user in users:
        if not session.query(UserAccount.id).filter(UserAccount.email == user.email).first():
            session.add(user)
    session.commit()
    print("✓ Users seeded (1 admin, 2 fleet managers, 1 safety, 1 finance)")


# ---------------------------------------------------------------------------
# Service Locations
# ---------------------------------------------------------------------------

def seed_service_locations(session):
    """Seed 12 cities across 5 states."""
    locations = [
        ("Ahmedabad", "Gujarat"),
        ("Gandhinagar", "Gujarat"),
        ("Vadodara", "Gujarat"),
        ("Rajkot", "Gujarat"),
        ("Surat", "Gujarat"),
        ("Anand", "Gujarat"),
        ("Mumbai", "Maharashtra"),
        ("Pune", "Maharashtra"),
        ("Nagpur", "Maharashtra"),
        ("Udaipur", "Rajasthan"),
        ("Jaipur", "Rajasthan"),
        ("Indore", "Madhya Pradesh"),
    ]
    for city, state in locations:
        if not session.query(ServiceLocation.id).filter(
            ServiceLocation.city == city, ServiceLocation.state == state
        ).first():
            session.add(ServiceLocation(city=city, state=state))
    session.commit()
    print("✓ Service locations seeded (12 cities across 5 states)")


# ---------------------------------------------------------------------------
# Vehicles
# ---------------------------------------------------------------------------

def seed_vehicles(session):
    """12 vehicles across 4 types and all 4 statuses."""
    vehicles = [
        # Trucks
        Vehicle(registration_number="GJ-01-TR-1001", name_model="Tata Ace Gold",
                type=VehicleType.TRUCK, max_load_capacity_kg=750, odometer_km=45200,
                acquisition_cost=600000, status=VehicleStatus.AVAILABLE, region="Ahmedabad West"),
        Vehicle(registration_number="GJ-01-TR-1002", name_model="Mahindra Bolero Pickup",
                type=VehicleType.TRUCK, max_load_capacity_kg=1500, odometer_km=72300,
                acquisition_cost=850000, status=VehicleStatus.AVAILABLE, region="Ahmedabad East"),
        Vehicle(registration_number="GJ-01-TR-1003", name_model="Ashok Leyland Dost",
                type=VehicleType.TRUCK, max_load_capacity_kg=2500, odometer_km=98400,
                acquisition_cost=950000, status=VehicleStatus.IN_SHOP, region="Ahmedabad West"),
        Vehicle(registration_number="GJ-01-TR-1004", name_model="Eicher Pro 2049",
                type=VehicleType.TRUCK, max_load_capacity_kg=4500, odometer_km=132000,
                acquisition_cost=1800000, status=VehicleStatus.AVAILABLE, region="Rajkot"),
        Vehicle(registration_number="MH-01-TR-2001", name_model="Tata LPT 1613",
                type=VehicleType.TRUCK, max_load_capacity_kg=8000, odometer_km=210000,
                acquisition_cost=2500000, status=VehicleStatus.AVAILABLE, region="Mumbai"),
        # Vans
        Vehicle(registration_number="GJ-01-VN-2001", name_model="Maruti Suzuki Eeco Cargo",
                type=VehicleType.VAN, max_load_capacity_kg=450, odometer_km=31500,
                acquisition_cost=450000, status=VehicleStatus.AVAILABLE, region="Ahmedabad West"),
        Vehicle(registration_number="GJ-01-VN-2002", name_model="Tata Winger",
                type=VehicleType.VAN, max_load_capacity_kg=1000, odometer_km=58700,
                acquisition_cost=720000, status=VehicleStatus.ON_TRIP, region="Gandhinagar"),
        # demo vehicle
        Vehicle(registration_number="GJ-01-VN-2005", name_model="Force Traveller 3350",
                type=VehicleType.VAN, max_load_capacity_kg=800, odometer_km=22100,
                acquisition_cost=550000, status=VehicleStatus.AVAILABLE, region="Ahmedabad West"),
        Vehicle(registration_number="GJ-01-VN-2003", name_model="Mahindra Supro Van",
                type=VehicleType.VAN, max_load_capacity_kg=600, odometer_km=41200,
                acquisition_cost=500000, status=VehicleStatus.RETIRED, region="Gandhinagar"),
        # Bikes
        Vehicle(registration_number="GJ-01-BK-3001", name_model="Bajaj Maxima Cargo",
                type=VehicleType.BIKE, max_load_capacity_kg=150, odometer_km=18900,
                acquisition_cost=180000, status=VehicleStatus.AVAILABLE, region="Ahmedabad East"),
        # Other
        Vehicle(registration_number="GJ-01-OT-4001", name_model="Piaggio Ape Xtra",
                type=VehicleType.OTHER, max_load_capacity_kg=500, odometer_km=12800,
                acquisition_cost=250000, status=VehicleStatus.AVAILABLE, region="Ahmedabad East"),
        Vehicle(registration_number="MH-01-OT-4002", name_model="Mahindra Treo Zor",
                type=VehicleType.OTHER, max_load_capacity_kg=550, odometer_km=8400,
                acquisition_cost=310000, status=VehicleStatus.AVAILABLE, region="Pune"),
    ]
    for v in vehicles:
        if not session.query(Vehicle.id).filter(Vehicle.registration_number == v.registration_number).first():
            session.add(v)
    session.commit()
    print("✓ Vehicles seeded (12 vehicles)")


# ---------------------------------------------------------------------------
# Drivers
# ---------------------------------------------------------------------------

def seed_drivers(session):
    """10 drivers split across both fleet managers."""
    fleet1 = _get(session, UserAccount, email="fleet1@transitops.io")
    fleet2 = _get(session, UserAccount, email="fleet2@transitops.io")
    ahmedabad_loc = session.query(ServiceLocation.id).filter(ServiceLocation.city == "Ahmedabad").scalar()
    mumbai_loc = session.query(ServiceLocation.id).filter(ServiceLocation.city == "Mumbai").scalar()

    drivers = [
        # Fleet 1 drivers
        Driver(name="Amit Kumar", email="amit.kumar@transitops.io",
               license_number="GJ-DL-2020-001", license_category="LMV-TR",
               license_expiry_date=date(2027, 6, 15), contact_number="+91-9876543210",
               safety_score=92, status=DriverStatus.AVAILABLE,
               fleet_manager_id=fleet1.id if fleet1 else None,
               current_location_id=ahmedabad_loc),
        Driver(name="Suresh Yadav", email="suresh.yadav@transitops.io",
               license_number="GJ-DL-2019-002", license_category="HMV",
               license_expiry_date=date(2027, 3, 20), contact_number="+91-9876543211",
               safety_score=85, status=DriverStatus.AVAILABLE,
               fleet_manager_id=fleet1.id if fleet1 else None,
               current_location_id=ahmedabad_loc),
        Driver(name="Alex Fernandez", email="alex.fernandez@transitops.io",  # demo driver
               license_number="GJ-DL-2021-003", license_category="LMV-TR",
               license_expiry_date=date(2028, 1, 10), contact_number="+91-9876543212",
               safety_score=95, status=DriverStatus.AVAILABLE,
               fleet_manager_id=fleet1.id if fleet1 else None,
               current_location_id=ahmedabad_loc),
        Driver(name="Ramesh Patel", email="ramesh.patel@transitops.io",
               license_number="GJ-DL-2018-004", license_category="HMV",
               license_expiry_date=date(2027, 9, 30), contact_number="+91-9876543213",
               safety_score=78, status=DriverStatus.ON_TRIP,
               fleet_manager_id=fleet1.id if fleet1 else None,
               current_location_id=ahmedabad_loc),
        Driver(name="Kiran Joshi", email="kiran.joshi@transitops.io",  # suspended
               license_number="GJ-DL-2019-005", license_category="LMV-TR",
               license_expiry_date=date(2027, 4, 15), contact_number="+91-9876543215",
               safety_score=35, status=DriverStatus.SUSPENDED,
               fleet_manager_id=fleet1.id if fleet1 else None,
               current_location_id=ahmedabad_loc),
        # Fleet 2 drivers
        Driver(name="Mohammed Shaikh", email="mohammed.shaikh@transitops.io",
               license_number="GJ-DL-2020-006", license_category="LMV",
               license_expiry_date=date(2027, 12, 1), contact_number="+91-9876543214",
               safety_score=88, status=DriverStatus.AVAILABLE,
               fleet_manager_id=fleet2.id if fleet2 else None,
               current_location_id=mumbai_loc),
        Driver(name="Deepak Verma", email="deepak.verma@transitops.io",  # expired license
               license_number="GJ-DL-2017-007", license_category="HMV",
               license_expiry_date=date(2024, 11, 30), contact_number="+91-9876543216",
               safety_score=72, status=DriverStatus.AVAILABLE,
               fleet_manager_id=fleet2.id if fleet2 else None,
               current_location_id=mumbai_loc),
        Driver(name="Nilesh Shah", email="nilesh.shah@transitops.io",
               license_number="GJ-DL-2021-008", license_category="LMV",
               license_expiry_date=date(2028, 7, 20), contact_number="+91-9876543217",
               safety_score=90, status=DriverStatus.OFF_DUTY,
               fleet_manager_id=fleet2.id if fleet2 else None,
               current_location_id=mumbai_loc),
        Driver(name="Prakash Solanki", email="prakash.solanki@transitops.io",
               license_number="GJ-DL-2020-009", license_category="LMV-TR",
               license_expiry_date=date(2027, 8, 10), contact_number="+91-9876543218",
               safety_score=82, status=DriverStatus.AVAILABLE,
               fleet_manager_id=fleet2.id if fleet2 else None,
               current_location_id=mumbai_loc),
        Driver(name="Sanjay Thakur", email="sanjay.thakur@transitops.io",
               license_number="GJ-DL-2022-010", license_category="HMV",
               license_expiry_date=date(2029, 2, 28), contact_number="+91-9876543219",
               safety_score=96, status=DriverStatus.AVAILABLE,
               fleet_manager_id=fleet2.id if fleet2 else None,
               current_location_id=mumbai_loc),
    ]
    for driver in drivers:
        existing = session.query(Driver).filter(
            (Driver.license_number == driver.license_number) | (Driver.email == driver.email)
        ).first()
        if existing is None:
            session.add(driver)
        else:
            existing.email = driver.email
            existing.fleet_manager_id = driver.fleet_manager_id
            existing.current_location_id = driver.current_location_id
    session.commit()
    print("✓ Drivers seeded (10 drivers, 5 per fleet manager)")


def link_demo_driver_account(session):
    """Bind the demo driver login to Alex's driver record."""
    # Only link if a demo driver@transitops.io account happens to exist (legacy)
    driver_user = session.query(UserAccount).filter(UserAccount.email == "driver@transitops.io").first()
    alex_driver = session.query(Driver).filter(Driver.license_number == "GJ-DL-2021-003").first()
    if driver_user and alex_driver:
        driver_user.driver_id = alex_driver.id
        session.commit()
    print("✓ Demo driver account linked")


# ---------------------------------------------------------------------------
# Trips
# ---------------------------------------------------------------------------

def seed_trips(session):
    """10 trips across all lifecycle statuses with structured location references."""
    if session.query(Trip).count() > 0:
        print("✓ Trips already seeded, skipping")
        return

    now = datetime.now(timezone.utc)

    # Look up locations
    def loc(city): return session.query(ServiceLocation).filter(ServiceLocation.city == city).first()

    ahmedabad = loc("Ahmedabad")
    vadodara = loc("Vadodara")
    surat = loc("Surat")
    rajkot = loc("Rajkot")
    gandhinagar = loc("Gandhinagar")
    mumbai = loc("Mumbai")
    pune = loc("Pune")
    anand = loc("Anand")
    nagpur = loc("Nagpur")
    indore = loc("Indore")

    # Look up vehicles
    def veh(reg): return session.query(Vehicle).filter(Vehicle.registration_number == reg).first()
    truck_01 = veh("GJ-01-TR-1001")
    truck_02 = veh("GJ-01-TR-1002")
    truck_04 = veh("GJ-01-TR-1004")
    truck_mh = veh("MH-01-TR-2001")
    van_02   = veh("GJ-01-VN-2002")
    van_05   = veh("GJ-01-VN-2005")
    bike_01  = veh("GJ-01-BK-3001")
    piaggio  = veh("GJ-01-OT-4001")

    # Look up drivers
    def drv(lic): return session.query(Driver).filter(Driver.license_number == lic).first()
    amit    = drv("GJ-DL-2020-001")
    suresh  = drv("GJ-DL-2019-002")
    alex    = drv("GJ-DL-2021-003")
    ramesh  = drv("GJ-DL-2018-004")
    mohammed = drv("GJ-DL-2020-006")
    nilesh  = drv("GJ-DL-2021-008")
    prakash = drv("GJ-DL-2020-009")
    sanjay  = drv("GJ-DL-2022-010")

    trips = []

    # 1. COMPLETED — Truck-01 + Amit: Ahmedabad → Vadodara
    if truck_01 and amit and ahmedabad and vadodara:
        trips.append(Trip(
            source="Ahmedabad", destination="Vadodara",
            source_location_id=ahmedabad.id, destination_location_id=vadodara.id,
            source_street_address="GIDC Estate, Odhav", destination_street_address="Makarpura GIDC",
            trip_date=(now - timedelta(days=6)).date(),
            vehicle_id=truck_01.id, driver_id=amit.id,
            cargo_weight_kg=500, planned_distance_km=112, actual_distance_km=118,
            revenue=15000, status=TripStatus.COMPLETED,
            final_odometer_km=45318, fuel_consumed_liters=14.5,
            dispatched_at=now - timedelta(days=5),
            completed_at=now - timedelta(days=5) + timedelta(hours=8),
            created_at=now - timedelta(days=6),
        ))

    # 2. COMPLETED — Truck-02 + Suresh: Gandhinagar → Rajkot
    if truck_02 and suresh and gandhinagar and rajkot:
        trips.append(Trip(
            source="Gandhinagar", destination="Rajkot",
            source_location_id=gandhinagar.id, destination_location_id=rajkot.id,
            source_street_address="Sector-21 Warehouse", destination_street_address="Aji GIDC",
            trip_date=(now - timedelta(days=4)).date(),
            vehicle_id=truck_02.id, driver_id=suresh.id,
            cargo_weight_kg=1200, planned_distance_km=215, actual_distance_km=220,
            revenue=28000, status=TripStatus.COMPLETED,
            final_odometer_km=72520, fuel_consumed_liters=28,
            dispatched_at=now - timedelta(days=3),
            completed_at=now - timedelta(days=2),
            created_at=now - timedelta(days=4),
        ))

    # 3. COMPLETED — Truck-04 + Sanjay: Rajkot → Surat (heavy, long haul)
    if truck_04 and sanjay and rajkot and surat:
        trips.append(Trip(
            source="Rajkot", destination="Surat",
            source_location_id=rajkot.id, destination_location_id=surat.id,
            source_street_address="Aji GIDC Phase 2", destination_street_address="Sachin GIDC",
            trip_date=(now - timedelta(days=11)).date(),
            vehicle_id=truck_04.id, driver_id=sanjay.id,
            cargo_weight_kg=4000, planned_distance_km=340, actual_distance_km=348,
            revenue=55000, status=TripStatus.COMPLETED,
            final_odometer_km=132348, fuel_consumed_liters=52,
            dispatched_at=now - timedelta(days=10),
            completed_at=now - timedelta(days=9),
            created_at=now - timedelta(days=11),
        ))

    # 4. COMPLETED — MH Truck + Nilesh: Mumbai → Pune
    if truck_mh and nilesh and mumbai and pune:
        trips.append(Trip(
            source="Mumbai", destination="Pune",
            source_location_id=mumbai.id, destination_location_id=pune.id,
            source_street_address="Bhiwandi Warehouse Cluster", destination_street_address="Chakan MIDC",
            trip_date=(now - timedelta(days=8)).date(),
            vehicle_id=truck_mh.id, driver_id=nilesh.id,
            cargo_weight_kg=6500, planned_distance_km=150, actual_distance_km=155,
            revenue=42000, status=TripStatus.COMPLETED,
            final_odometer_km=210155, fuel_consumed_liters=40,
            dispatched_at=now - timedelta(days=7),
            completed_at=now - timedelta(days=7) + timedelta(hours=6),
            created_at=now - timedelta(days=8),
        ))

    # 5. COMPLETED — Piaggio + Prakash: Ahmedabad → Anand (short delivery)
    if piaggio and prakash and ahmedabad and anand:
        trips.append(Trip(
            source="Ahmedabad", destination="Anand",
            source_location_id=ahmedabad.id, destination_location_id=anand.id,
            source_street_address="SG Highway Depot", destination_street_address="Anand Milk Union Road",
            trip_date=(now - timedelta(days=7)).date(),
            vehicle_id=piaggio.id, driver_id=prakash.id,
            cargo_weight_kg=200, planned_distance_km=68, actual_distance_km=70,
            revenue=8000, status=TripStatus.COMPLETED,
            final_odometer_km=12870, fuel_consumed_liters=6,
            dispatched_at=now - timedelta(days=7),
            completed_at=now - timedelta(days=7) + timedelta(hours=3),
            created_at=now - timedelta(days=7) - timedelta(hours=2),
        ))

    # 6. DISPATCHED — Van-02 + Ramesh: Gandhinagar → Ahmedabad (currently active)
    if van_02 and ramesh and gandhinagar and ahmedabad:
        trips.append(Trip(
            source="Gandhinagar", destination="Ahmedabad",
            source_location_id=gandhinagar.id, destination_location_id=ahmedabad.id,
            source_street_address="Sector-28 Hub", destination_street_address="Naroda GIDC",
            trip_date=now.date(),
            vehicle_id=van_02.id, driver_id=ramesh.id,
            cargo_weight_kg=750, planned_distance_km=25,
            revenue=5000, status=TripStatus.DISPATCHED,
            dispatched_at=now - timedelta(hours=4),
            created_at=now - timedelta(hours=6),
        ))

    # 7. DRAFT — Van-05 + Alex: Ahmedabad → Vadodara (ready to dispatch)
    if van_05 and alex and ahmedabad and vadodara:
        trips.append(Trip(
            source="Ahmedabad", destination="Vadodara",
            source_location_id=ahmedabad.id, destination_location_id=vadodara.id,
            source_street_address="Odhav Industrial Estate", destination_street_address="Waghodia GIDC",
            trip_date=(now + timedelta(days=1)).date(),
            vehicle_id=van_05.id, driver_id=alex.id,
            cargo_weight_kg=600, planned_distance_km=112,
            revenue=14000, status=TripStatus.DRAFT,
            created_at=now - timedelta(hours=1),
        ))

    # 8. DRAFT — Bike-01 + Mohammed: Ahmedabad → Surat
    if bike_01 and mohammed and ahmedabad and surat:
        trips.append(Trip(
            source="Ahmedabad", destination="Surat",
            source_location_id=ahmedabad.id, destination_location_id=surat.id,
            source_street_address="Maninagar Depot", destination_street_address="Katargam Hub",
            trip_date=(now + timedelta(days=2)).date(),
            vehicle_id=bike_01.id, driver_id=mohammed.id,
            cargo_weight_kg=80, planned_distance_km=265,
            revenue=12000, status=TripStatus.DRAFT,
            created_at=now - timedelta(hours=3),
        ))

    # 9. CANCELLED — Truck-01 + Amit: Vadodara → Nagpur (cancelled en route)
    if truck_01 and amit and vadodara and nagpur:
        trips.append(Trip(
            source="Vadodara", destination="Nagpur",
            source_location_id=vadodara.id, destination_location_id=nagpur.id,
            source_street_address="Makarpura GIDC", destination_street_address="Butibori MIDC",
            trip_date=(now - timedelta(days=14)).date(),
            vehicle_id=truck_01.id, driver_id=amit.id,
            cargo_weight_kg=800, planned_distance_km=650,
            revenue=75000, status=TripStatus.CANCELLED,
            created_at=now - timedelta(days=15),
        ))

    # 10. CANCELLED — Piaggio + Prakash: Pune → Indore
    if piaggio and prakash and pune and indore:
        trips.append(Trip(
            source="Pune", destination="Indore",
            source_location_id=pune.id, destination_location_id=indore.id,
            source_street_address="Hinjawadi IT Park", destination_street_address="Pithampur MIDC",
            trip_date=(now - timedelta(days=20)).date(),
            vehicle_id=piaggio.id, driver_id=prakash.id,
            cargo_weight_kg=300, planned_distance_km=550,
            revenue=35000, status=TripStatus.CANCELLED,
            created_at=now - timedelta(days=21),
        ))

    for trip in trips:
        session.add(trip)
    session.commit()
    print(f"✓ Trips seeded ({len(trips)} trips)")


# ---------------------------------------------------------------------------
# Route Suggestions
# ---------------------------------------------------------------------------

def seed_route_suggestions(session):
    """Seed route suggestions for all completed trips."""
    if session.query(RouteSuggestion).count() > 0:
        print("✓ Route suggestions already seeded, skipping")
        return

    completed_trips = session.query(Trip).filter(Trip.status == TripStatus.COMPLETED).all()

    # Rule-based distances (km → minutes at avg 60 km/h)
    _routes = {
        ("Ahmedabad", "Vadodara"):   (112, 115),
        ("Gandhinagar", "Rajkot"):   (215, 225),
        ("Rajkot", "Surat"):         (340, 360),
        ("Mumbai", "Pune"):          (150, 165),
        ("Ahmedabad", "Anand"):      (68, 72),
    }

    suggestions = []
    for trip in completed_trips:
        key = (trip.source, trip.destination)
        if key in _routes:
            dist_km, dur_min = _routes[key]
            suggestions.append(RouteSuggestion(
                trip_id=trip.id,
                source=trip.source,
                destination=trip.destination,
                provider=RouteProvider.RULE_BASED,
                suggested_distance_km=dist_km,
                suggested_duration_minutes=dur_min,
                raw_response={"waypoints": [trip.source, trip.destination], "method": "rule_based"},
            ))

    for s in suggestions:
        session.add(s)
    session.commit()
    print(f"✓ Route suggestions seeded ({len(suggestions)} entries)")


# ---------------------------------------------------------------------------
# Maintenance Records
# ---------------------------------------------------------------------------

def seed_maintenance_records(session):
    if session.query(MaintenanceLog).count() > 0:
        print("✓ Maintenance records already seeded, skipping")
        return

    now = datetime.now(timezone.utc)
    truck_in_shop = session.query(Vehicle).filter(Vehicle.registration_number == "GJ-01-TR-1003").first()
    truck_01 = session.query(Vehicle).filter(Vehicle.registration_number == "GJ-01-TR-1001").first()
    truck_04 = session.query(Vehicle).filter(Vehicle.registration_number == "GJ-01-TR-1004").first()

    records = []
    if truck_in_shop:
        records.append(MaintenanceLog(
            vehicle_id=truck_in_shop.id, type="brake_service", cost=15000,
            description="Complete brake pad replacement and drum inspection. Estimated 2 days.",
            status=MaintenanceStatus.ACTIVE, created_at=now - timedelta(days=1),
        ))
    if truck_01:
        records.append(MaintenanceLog(
            vehicle_id=truck_01.id, type="oil_change", cost=3500,
            description="Regular oil change and filter replacement at 45000 km service interval.",
            status=MaintenanceStatus.CLOSED,
            created_at=now - timedelta(days=10), closed_at=now - timedelta(days=9),
        ))
    if truck_04:
        records.append(MaintenanceLog(
            vehicle_id=truck_04.id, type="tire_replacement", cost=32000,
            description="Full set of 6 tires replaced at 130000 km. All axles serviced.",
            status=MaintenanceStatus.CLOSED,
            created_at=now - timedelta(days=15), closed_at=now - timedelta(days=13),
        ))

    for r in records:
        session.add(r)
    session.commit()
    print(f"✓ Maintenance records seeded ({len(records)} records)")


# ---------------------------------------------------------------------------
# Fuel Logs
# ---------------------------------------------------------------------------

def seed_fuel_logs(session):
    if session.query(FuelLog).count() > 0:
        print("✓ Fuel logs already seeded, skipping")
        return

    completed_trips = session.query(Trip).filter(Trip.status == TripStatus.COMPLETED).all()
    logs = []
    for trip in completed_trips:
        if trip.fuel_consumed_liters and float(trip.fuel_consumed_liters) > 0:
            logs.append(FuelLog(
                vehicle_id=trip.vehicle_id,
                trip_id=trip.id,
                liters=float(trip.fuel_consumed_liters),
                cost=float(trip.fuel_consumed_liters) * 103,  # ₹103/liter
                log_date=trip.completed_at.date() if trip.completed_at else date.today(),
            ))

    for log in logs:
        session.add(log)
    session.commit()
    print(f"✓ Fuel logs seeded ({len(logs)} entries)")


# ---------------------------------------------------------------------------
# Expenses
# ---------------------------------------------------------------------------

def seed_expenses(session):
    if session.query(Expense).count() > 0:
        print("✓ Expenses already seeded, skipping")
        return

    def veh(reg): return session.query(Vehicle).filter(Vehicle.registration_number == reg).first()
    truck_01 = veh("GJ-01-TR-1001")
    truck_04 = veh("GJ-01-TR-1004")
    truck_mh = veh("MH-01-TR-2001")
    van_05   = veh("GJ-01-VN-2005")

    expenses = []
    if truck_01:
        expenses += [
            Expense(vehicle_id=truck_01.id, type="insurance", amount=25000,
                    expense_date=date.today() - timedelta(days=30),
                    notes="Annual comprehensive insurance renewal"),
            Expense(vehicle_id=truck_01.id, type="toll", amount=1200,
                    expense_date=date.today() - timedelta(days=5),
                    notes="Ahmedabad-Vadodara expressway toll"),
        ]
    if truck_04:
        expenses += [
            Expense(vehicle_id=truck_04.id, type="tire_replacement", amount=32000,
                    expense_date=date.today() - timedelta(days=15),
                    notes="Full set of 6 tires replaced at 130000 km"),
            Expense(vehicle_id=truck_04.id, type="toll", amount=2800,
                    expense_date=date.today() - timedelta(days=10),
                    notes="Rajkot-Surat highway tolls"),
        ]
    if truck_mh:
        expenses.append(Expense(vehicle_id=truck_mh.id, type="insurance", amount=48000,
                                expense_date=date.today() - timedelta(days=45),
                                notes="Annual insurance premium for MH-01-TR-2001"))
    if van_05:
        expenses.append(Expense(vehicle_id=van_05.id, type="insurance", amount=18000,
                                expense_date=date.today() - timedelta(days=60),
                                notes="Annual insurance premium"))

    for e in expenses:
        session.add(e)
    session.commit()
    print(f"✓ Expenses seeded ({len(expenses)} entries)")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def run_seed():
    """Run all seed operations."""
    import source.shared_infrastructure.database_models.user_account_model  # noqa: F401
    import source.shared_infrastructure.database_models.vehicle_model  # noqa: F401
    import source.shared_infrastructure.database_models.driver_model  # noqa: F401
    import source.shared_infrastructure.database_models.trip_model  # noqa: F401
    import source.shared_infrastructure.database_models.maintenance_log_model  # noqa: F401
    import source.shared_infrastructure.database_models.fuel_log_model  # noqa: F401
    import source.shared_infrastructure.database_models.expense_model  # noqa: F401
    import source.shared_infrastructure.database_models.route_suggestion_model  # noqa: F401
    import source.shared_infrastructure.database_models.vehicle_document_model  # noqa: F401
    import source.shared_infrastructure.database_models.service_location_model  # noqa: F401

    DatabaseBaseModel.metadata.create_all(bind=database_engine)
    print("✓ Database tables created/verified")

    session = DatabaseSessionFactory()
    try:
        seed_users(session)
        seed_service_locations(session)
        seed_vehicles(session)
        seed_drivers(session)
        link_demo_driver_account(session)
        seed_trips(session)
        seed_route_suggestions(session)
        seed_maintenance_records(session)
        seed_fuel_logs(session)
        seed_expenses(session)

        print("\n" + "=" * 60)
        print("  TransitOps — Demo credentials")
        print("=" * 60)
        print("  Admin:             admin@transitops.io  /  Admin@2026")
        print("  Fleet Manager 1:   fleet1@transitops.io /  Fleet@2026   (Priya Sharma)")
        print("  Fleet Manager 2:   fleet2@transitops.io /  Fleet@2026   (Karan Mehta)")
        print("  Safety Officer:    safety@transitops.io /  Safety@2026")
        print("  Financial Analyst: finance@transitops.io / Finance@2026")
        print("=" * 60)
        print("\n  Key demo data:")
        print("  - Van-05 (GJ-01-VN-2005) + Alex Fernandez → DRAFT trip ready to dispatch")
        print("  - Van-02 (GJ-01-VN-2002) + Ramesh Patel   → DISPATCHED trip in progress")
        print("  - Truck-03 (GJ-01-TR-1003)                → IN_SHOP (brake service)")
        print("  - 5 completed trips with route suggestions and fuel logs")
        print("  - 12 locations: Gujarat, Maharashtra, Rajasthan, Madhya Pradesh")
        print("=" * 60 + "\n")
    finally:
        session.close()


if __name__ == "__main__":
    run_seed()
