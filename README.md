<p align="center">
  <h1 align="center">TransitOps</h1>
  <p align="center">
    Smart Transport Operations Platform
    <br />
    <em>Fleet management, trip dispatch, maintenance tracking, and financial analytics — in one unified system.</em>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.12+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

TransitOps is a full-stack transport operations management platform built for fleet operators, logistics teams, and transport companies. It replaces fragmented spreadsheets and manual record-keeping with a unified system that manages vehicles, drivers, trips, maintenance schedules, fuel consumption, and operating expenses — all from a single dashboard.

Built as a modular monolith with a FastAPI backend and a React 19 frontend, TransitOps provides role-based workspaces for Fleet Managers, Drivers, Safety Officers, and Financial Analysts. The platform enforces business rules at every layer: vehicle and driver availability validation, trip lifecycle state machines, automated maintenance status propagation, and transactional email notifications on every status change.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Backend Modules](#backend-modules)
- [Documentation](#documentation)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Development Workflow](#development-workflow)
- [Security](#security)
- [Screenshots](#screenshots)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)

---

## Project Overview

Transport companies operating fleets of 10 to 500 vehicles face a common problem: operational data lives in disconnected spreadsheets, WhatsApp groups, and handwritten logs. Vehicle availability is tracked mentally, driver assignments are coordinated over phone calls, maintenance is scheduled reactively after breakdowns, and fuel costs are reconciled at month-end — if at all.

**TransitOps eliminates this chaos.** The platform provides a single source of truth for every operational dimension:

- **Vehicle Registry** tracks the entire fleet with real-time status propagation (`available` → `on_trip` → `under_maintenance` → `retired`).
- **Trip Lifecycle** enforces a validated state machine (`scheduled` → `dispatched` → `in_progress` → `completed` / `cancelled`) with automatic resource locking and email notifications.
- **Maintenance Tracking** automatically marks vehicles as unavailable when service is scheduled and restores them on completion.
- **Financial Tracking** captures fuel logs and categorized expenses at the vehicle level, feeding into aggregate reports with PDF export.
- **Operational Dashboard** surfaces real-time KPIs — active trips, available vehicles, 30-day costs, and recent activity — in a single view.

The result is a platform where a Fleet Manager can dispatch a trip, a Driver receives an email notification, a Safety Officer monitors maintenance compliance, and a Financial Analyst generates cost reports — each from their own role-scoped workspace.

---

## Key Features

### Fleet Management
- **Vehicle Registry** — Full CRUD with registration number, type, load capacity, odometer, acquisition cost, region, and real-time status tracking (`available` → `on_trip` → `in_shop` → `retired`)
- **Vehicle Documents** — Upload and manage insurance, registration, permits, and fitness certificates (PDF/PNG/JPEG, max 5MB) with expiry date tracking
- **Driver Registry** — Driver profiles with license category, safety score (0–100), license expiry validation, and computed `is_license_expired` field
- **License Expiry Reminders** — Automated email notifications for drivers with approaching or expired licenses
- **Availability Engine** — Real-time vehicle and driver availability based on trip assignments, maintenance status, and license validity

### Trip Operations
- **Trip Lifecycle Management** — Full state machine with enforced transitions: `draft` → `dispatched` → `completed` / `cancelled`
- **Resource Validation** — Trips require available vehicle and driver, valid license, and cargo weight within vehicle capacity
- **Automatic Status Propagation** — Vehicle and driver statuses update automatically on dispatch, completion, and cancellation
- **Concurrent Safety** — PostgreSQL row-level locking (`SELECT FOR UPDATE`) prevents race conditions during dispatch and completion
- **Odometer Tracking** — Trip completion updates vehicle odometer with regression protection
- **Route Optimization** — Rule-based route provider with preconfigured Gujarat/Ahmedabad route matrix (19 routes), extensible provider architecture

### Maintenance & Compliance
- **Maintenance Scheduling** — Create maintenance records with automatic vehicle status change to `under_maintenance`
- **Completion Workflow** — Mark records complete to automatically restore vehicle to `available` status
- **Document Expiry Tracking** — Monitor insurance, permits, and fitness certificates approaching expiration

### Financial Tracking
- **Fuel Log Management** — Record fuel consumption with liters and cost per vehicle; auto-generated on trip completion
- **Expense Categorization** — Track expenses with free-text type categorization per vehicle
- **Cost Aggregation** — View total and per-vehicle costs with optional vehicle, region, and date range filters

### Reporting & Analytics
- **Trip Summary Report** — Trip metrics grouped by vehicle with distance, revenue, and fuel data
- **Expense Breakdown Report** — Categorized expense analysis with per-vehicle cost attribution
- **Driver Performance Report** — Trips completed, distance covered, revenue generated, fuel efficiency (km/L), and safety score per driver
- **Maintenance Cost Report** — Maintenance spending by vehicle with service type breakdown
- **Vehicle Profitability Report** — Revenue vs. operational costs per vehicle with net profit and ROI calculation
- **PDF & CSV Export** — All five report types exportable as formatted PDF documents and CSV files

### Operational Dashboard
- **Real-Time KPIs** — Fleet utilization %, active trips, revenue, fuel/maintenance/expense totals, drivers with expired licenses
- **Fleet & Driver Status** — Breakdown by status category (available, on_trip, in_shop, retired / available, on_trip, off_duty, suspended)
- **Data Visualization** — Interactive charts powered by Chart.js with vehicle type, status, and region filters

### Role-Based Access Control

| Role | Workspace |
|---|---|
| **Fleet Manager** | Full access — vehicles, drivers, trips, maintenance, fuel, expenses, reports |
| **Driver** | Dashboard and assigned trips |
| **Safety Officer** | Drivers, vehicle documents, maintenance, reports |
| **Financial Analyst** | Fuel logs, expenses, reports |

### Email Notifications
- Transactional emails via Brevo on trip status changes (dispatched, in progress, completed, cancelled)
- Welcome email on user registration
- Graceful degradation when email service is unconfigured

---

## System Architecture

TransitOps follows a **Modular Monolith** architecture with three deployment tiers orchestrated by Docker Compose:

```
┌─────────────────────────────────────────────────────────┐
│                     Client Tier                         │
│          React 19 + TypeScript + Vite SPA               │
│     Three.js · GSAP · Motion · Chart.js · Lottie        │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (/api proxy)
┌──────────────────────▼──────────────────────────────────┐
│                  Application Tier                       │
│                FastAPI + Uvicorn                         │
│  ┌─────────────┬──────────────┬────────────────────┐    │
│  │  User Auth  │ Vehicle Reg. │ Driver Management  │    │
│  ├─────────────┼──────────────┼────────────────────┤    │
│  │ Trip Lifecy.│ Maintenance  │ Fuel & Expense     │    │
│  ├─────────────┼──────────────┼────────────────────┤    │
│  │  Dashboard  │  Reporting   │ Route Optimization │    │
│  └─────────────┴──────────────┴────────────────────┘    │
│           Shared: RBAC · Email · Error Handling         │
└──────────────────────┬──────────────────────────────────┘
                       │ SQLAlchemy ORM
┌──────────────────────▼──────────────────────────────────┐
│                   Data Tier                             │
│               PostgreSQL 16                             │
│     8 tables · Foreign key relationships                │
└─────────────────────────────────────────────────────────┘
```

Each backend module follows a strict **4-layer internal architecture**: Transport (routes) → Service (business logic) → Repository (data access) → Database Models. Modules communicate exclusively through the shared infrastructure layer — there are no direct inter-module imports.

> For detailed architecture documentation, see [`docs/architecture/`](docs/architecture/).

---

## Project Structure

```
TransitOps/
├── applications/
│   ├── backend_application/
│   │   ├── source/
│   │   │   ├── application_startup/       # App factory, DB connection, route registration
│   │   │   ├── modules/
│   │   │   │   ├── user_authentication/   # Login, registration, JWT, role management
│   │   │   │   ├── vehicle_registry/      # Vehicle CRUD, documents, availability
│   │   │   │   ├── driver_management/     # Driver CRUD, license validation
│   │   │   │   ├── trip_lifecycle_management/  # Trip state machine, dispatch
│   │   │   │   ├── maintenance_tracking/  # Service records, status propagation
│   │   │   │   ├── fuel_and_expense_tracking/  # Fuel logs, categorized expenses
│   │   │   │   ├── operational_dashboard/ # Aggregated KPIs
│   │   │   │   ├── reporting_and_analytics/    # Reports + PDF export
│   │   │   │   └── route_optimization/    # Rule-based route provider
│   │   │   ├── shared_infrastructure/     # RBAC, email service, DB models, errors
│   │   │   └── seed_database.py           # Demo data seeder
│   │   ├── tests/                         # Unit and integration tests
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── web_application/
│       ├── src/
│       │   ├── pages/                     # 12 page components
│       │   ├── components/
│       │   │   ├── motion/                # 20 animation components (GSAP, Motion, Lottie)
│       │   │   └── webgl/                 # Three.js 3D scenes
│       │   ├── animation/                 # Animation registry, scroll manager, motion tokens
│       │   ├── shared/                    # Auth context, API client, RBAC, layout
│       │   └── assets/                    # SVG illustrations, Lottie JSON files
│       ├── Dockerfile
│       ├── package.json
│       └── vite.config.ts
├── docs/
│   ├── architecture/                      # System, module, and database documentation
│   └── system/                            # Business workflow flowcharts
├── automated_scripts/                     # LAN IP detection for dev environments
├── docker-compose.yml                     # 3-service orchestration
└── .env.example                           # Environment variable template
```

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.12+ | Runtime language |
| **FastAPI** | 0.115 | REST API framework with automatic OpenAPI docs |
| **SQLAlchemy** | 2.0 | ORM with mapped column type annotations |
| **PostgreSQL** | 16 | Primary relational database |
| **Pydantic** | 2.11 | Request/response validation and serialization |
| **python-jose** | 3.4 | JWT token generation and verification |
| **passlib + bcrypt** | — | Password hashing |
| **ReportLab** | 4.4 | PDF report generation |
| **Brevo API** | — | Transactional email delivery |
| **Uvicorn** | 0.34 | ASGI server |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI component framework |
| **TypeScript** | 6.0 | Type-safe JavaScript |
| **Vite** | 8.1 | Build tool and dev server with HMR |
| **React Router DOM** | 7.18 | Client-side routing with protected routes |
| **Chart.js** | 4.5 | Dashboard and report data visualization |
| **Three.js** | 0.185 | 3D WebGL graphics on landing page |
| **@react-three/fiber** | 9.6 | React renderer for Three.js |
| **GSAP** | 3.15 | Advanced timeline animations |
| **Motion (Framer Motion)** | 12.42 | Declarative component animations |
| **Anime.js** | 4.5 | Keyframe animation engine |
| **Lottie React** | 2.4 | Lottie JSON animation playback |
| **AOS** | 2.3 | Scroll-triggered animations |
| **Lenis** | 1.3 | Smooth scrolling |
| **Axios** | 1.18 | HTTP client with JWT interceptor |

### Infrastructure

| Technology | Purpose |
|---|---|
| **Docker Compose** | Multi-service orchestration (backend, frontend, database) |
| **Docker** | Containerized builds for backend and frontend |

---

## Backend Modules

| Module | Purpose | Key Capabilities |
|---|---|---|
| **User Authentication** | Identity and access management | Login, JWT issuance (HS256, 12h expiry), login email notifications |
| **Vehicle Registry** | Fleet asset management | Vehicle CRUD, document upload (PDF/PNG/JPEG), availability queries, region filtering |
| **Driver Management** | Driver workforce management | Driver CRUD, license expiry reminders, safety scoring, availability computation |
| **Trip Lifecycle Management** | Dispatch and operations | State machine (draft → dispatched → completed/cancelled), cargo validation, row-level locking, email notifications |
| **Maintenance Tracking** | Service and compliance | Schedule maintenance, auto-set vehicle status to `in_shop`, completion restores `available` |
| **Fuel & Expense Tracking** | Cost recording | Manual and auto-generated fuel logs, free-text expense categorization |
| **Operational Dashboard** | Real-time operations view | Fleet utilization %, revenue, cost aggregates, status breakdowns, filterable by vehicle type/region |
| **Reporting & Analytics** | Business intelligence | 5 report types (trip summary, expense, driver, maintenance, profitability) + PDF & CSV export |
| **Route Optimization** | Trip planning assistance | Rule-based Gujarat route matrix (19 routes), suggestion persistence, extensible provider architecture |

---

## Documentation

The `docs/` directory contains structured documentation for the platform:

| Document | Description |
|---|---|
| [`01-system-architecture.md`](docs/architecture/01-system-architecture.md) | Layered architecture, module communication, and deployment topology |
| [`02-backend-module-architecture.md`](docs/architecture/02-backend-module-architecture.md) | Internal module structure, service patterns, and dependency rules |
| [`03-database-er-diagram.md`](docs/architecture/03-database-er-diagram.md) | Entity-relationship diagram with all 8 tables and foreign keys |
| [`01-system-business-flowchart.md`](docs/system/01-system-business-flowchart.md) | End-to-end business workflows for all six core operations |

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed
- Git

### Quick Start (Docker Compose)

**1. Clone the repository**

```bash
git clone https://github.com/your-org/TransitOps.git
cd TransitOps
```

**2. Configure environment**

```bash
cp .env.example .env
# Edit .env with your configuration (see Configuration section)
```

**3. Start all services**

```bash
docker compose up --build
```

This starts three containers:
- **PostgreSQL** on port `5432`
- **Backend (FastAPI)** on port `8000`
- **Frontend (Vite)** on port `5173`

**4. Access the application**

| Service | URL |
|---|---|
| Web Application | [http://localhost:5173](http://localhost:5173) |
| API Documentation | [http://localhost:8000/docs](http://localhost:8000/docs) |
| Health Check | [http://localhost:8000/api/health](http://localhost:8000/api/health) |

**5. Login with demo credentials**

The database is automatically seeded with demo accounts on first run:

| Role | Email | Password |
|---|---|---|
| Fleet Manager | `fleet@transitops.io` | `fleet123` |
| Driver | `driver@transitops.io` | `driver123` |
| Safety Officer | `safety@transitops.io` | `safety123` |
| Financial Analyst | `finance@transitops.io` | `finance123` |

---

### Manual Setup (Without Docker)

<details>
<summary>Expand for manual installation steps</summary>

#### Backend

```bash
cd applications/backend_application
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables (see Configuration section)
export DATABASE_URL=postgresql://user:password@localhost:5432/transitops
export JWT_SECRET_KEY=your-secret-key

# Start the backend
uvicorn source.application_startup.create_application:application --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

```bash
cd applications/web_application
npm install
npm run dev
```

#### Database

Ensure PostgreSQL 16 is running. Tables are created automatically on backend startup — no migration tool is required.

</details>

---

## Configuration

TransitOps is configured through environment variables. Copy `.env.example` to `.env` and set the values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Yes | Secret key for JWT signing (change from default in production) |
| `POSTGRES_USER` | Yes | PostgreSQL username |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password |
| `POSTGRES_DB` | Yes | PostgreSQL database name |
| `BREVO_API_KEY` | No | Brevo API key for transactional emails |
| `BREVO_SENDER_EMAIL` | No | Verified sender email address in Brevo |
| `BREVO_SENDER_NAME` | No | Sender display name (default: `TransitOps`) |
| `FRONTEND_URL` | No | Frontend URL for email links (default: `http://localhost:5173`) |
| `ROUTE_PROVIDER` | No | Route optimization provider (default: `rule_based`) |
| `DEFAULT_FUEL_PRICE_PER_LITER` | No | Default fuel price when not specified (default: `100`) |
| `VITE_API_URL` | No | Frontend API base path (default: `/api`) |
| `VITE_PROXY_TARGET` | No | Backend URL for Vite proxy (default: `http://backend:8000`) |

> **Security Note:** Never commit `.env` files with real credentials. The `.env.example` file contains only placeholder values.

---

## API Documentation

FastAPI provides automatic, interactive API documentation:

- **Swagger UI** — [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc** — [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON** — [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

All endpoints are prefixed with `/api` and organized by module:

| Prefix | Module | Auth |
|---|---|---|
| `/api/user-authentication` | User Authentication | Public (login) / Authenticated (profile) |
| `/api/vehicles` | Vehicle Registry | Role-restricted |
| `/api/vehicle-documents` | Vehicle Documents | Role-restricted |
| `/api/drivers` | Driver Management | Role-restricted |
| `/api/trips` | Trip Lifecycle | Role-restricted (drivers see own trips only) |
| `/api/maintenance` | Maintenance Tracking | Role-restricted |
| `/api/fuel-logs` | Fuel Tracking | Role-restricted |
| `/api/expenses` | Expense Tracking | Role-restricted |
| `/api/dashboard` | Operational Dashboard | Authenticated |
| `/api/reports` | Reporting & Analytics (JSON, CSV, PDF) | Role-restricted |
| `/api/routes` | Route Optimization | Authenticated |
| `/api/health` | Health Check | Public |

---

## Development Workflow

```bash
# 1. Clone and configure
git clone https://github.com/your-org/TransitOps.git
cd TransitOps
cp .env.example .env

# 2. Start development environment
docker compose up --build

# 3. Backend runs with --reload (auto-restart on code changes)
# 4. Frontend runs with Vite HMR (instant updates in browser)

# 5. Run backend tests
docker compose exec backend python -m pytest tests/ -v

# 6. Run frontend linting
docker compose exec frontend npm run lint

# 7. Build frontend for production
docker compose exec frontend npm run build
```

### Backend Development

The backend auto-reloads on file changes via Uvicorn's `--reload` flag. Source code is volume-mounted from `applications/backend_application/`.

### Frontend Development

Vite provides Hot Module Replacement (HMR). Source code is volume-mounted from `applications/web_application/`. The Vite dev server proxies `/api` requests to the backend container.

---

## Security

| Layer | Implementation |
|---|---|
| **Authentication** | JWT bearer tokens (HS256, 12-hour expiry) |
| **Password Storage** | bcrypt hashing via passlib (no plaintext storage) |
| **Authorization** | Role-based access control enforced at route level on both backend and frontend |
| **Input Validation** | Pydantic models validate all request payloads with type coercion and constraint enforcement |
| **CORS** | Configurable origin policy (permissive in dev, restrict in production) |
| **SQL Injection** | Prevented by SQLAlchemy's parameterized queries |
| **Token Security** | Expiration validation, user existence verification on every request |

---

## Screenshots

> Screenshots will be added here. The application includes the following views:

| View | Description |
|---|---|
| **Landing Page** | 3D WebGL truck scene, scroll animations, feature showcase |
| **Dashboard** | Real-time KPIs, Chart.js visualizations, recent activity feeds |
| **Vehicle Management** | Fleet table with status indicators, CRUD operations |
| **Trip Management** | Trip lifecycle with status transitions, dispatch workflow |
| **Reports** | Interactive charts with date filtering and PDF export |
| **Login** | Role-selector with demo credentials, animated transitions |

---

## Future Roadmap

- **Live GPS Tracking** — Real-time vehicle location with map visualization
- **Predictive Maintenance** — ML-based maintenance scheduling from historical data
- **Multi-Tenant Organizations** — Isolated fleet data for multiple transport companies
- **Odoo Integration** — Sync vehicles, trips, and expenses with Odoo ERP
- **Mobile Application** — React Native companion app for drivers
- **Real-Time Notifications** — WebSocket-based live status updates
- **Advanced Route Optimization** — Integration with Google Maps or OSRM for real-world routing
- **Alembic Migrations** — Production-grade database schema management

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. **Fork** the repository and create a feature branch from `main`.
2. **Follow** the existing code conventions — descriptive naming, module-scoped changes, Pydantic contracts for all data boundaries.
3. **Write tests** for new functionality. Tests live in `applications/backend_application/tests/`.
4. **Document** any new API endpoints or configuration changes.
5. **Open a pull request** with a clear description of the change and its business justification.

### Development Conventions

- Backend modules follow the `Transport → Service → Repository` pattern. Do not add cross-module imports.
- Frontend pages go in `src/pages/`, reusable components in `src/components/`.
- All API contracts use Pydantic models — no raw dicts in route handlers.
- Environment variables must have defaults or be documented in `.env.example`.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Authors

Built by the **TransitOps Team** for the Odoo Hackathon.

<p align="center">
  <sub>Built with FastAPI, React, and PostgreSQL.</sub>
</p>
