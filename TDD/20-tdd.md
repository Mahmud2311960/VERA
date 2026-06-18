# Technical Design Document (TDD) — VERA

**Document:** 20-tdd.md
**Project:** VERA — Volunteer Emergency Response Alliance
**Course:** CSE307 — System Analysis and Design, Section 02
**Author:** [Your Name] — SRS & TDD module owner

## 1. Introduction

### 1.1 Purpose
This Technical Design Document (TDD) describes how VERA is built: its architecture, data model, interfaces, and the engineering decisions behind them. Where the SRS (`17-srs.md`) defines *what* the system must do, this TDD defines *how* it does it, grounded directly in the current implementation under `backend/app` and `frontend/src`.

### 1.2 Scope
This document covers the application architecture, the relational data model, the REST API contract, security design, error handling, deployment topology, and a brief testing/roadmap outlook. It consolidates and cross-references four supporting documents: `18-erd.md`, `19-system-design.md`, `21-database-design.md`, and `22-api-design.md`.

### 1.3 Design Goals
- **Statelessness:** authentication via JWT, not server sessions, so the API can scale horizontally.
- **Separation of concerns:** models, schemas, routers, and services are kept in distinct modules so each can evolve independently.
- **Engine portability:** the data layer is accessed exclusively through SQLAlchemy's ORM so the underlying database can move from SQLite to PostgreSQL without touching business logic.
- **Explicit role enforcement:** every state-changing endpoint declares which roles may call it, centralized in a single `require_roles` dependency rather than scattered ad-hoc checks.

## 2. Architecture Overview

VERA is a three-tier system: a Next.js/React frontend, a FastAPI backend exposing a versioned JSON REST API, and a relational database accessed through SQLAlchemy. The full component breakdown, the authentication sequence, the blood-request notification workflow, and the deployment topology (local dev vs. planned AWS production) are detailed in **`19-system-design.md`**.

## 3. Data Design

VERA's data model spans 14 entities — users, emergency requests, blood requests, resources, NGO coordination, donations, fundraising campaigns, notifications, shelters, incident reports, volunteer opportunities, volunteer applications, certificates, and disaster coverage. The conceptual entity-relationship model and cardinality narrative are in **`18-erd.md`**; the exact physical schema — column types, constraints, defaults, and indexes — is in **`21-database-design.md`**.

Key data-design decisions:
- Role and status fields use native database enums, not free-text strings, to prevent invalid states from ever being persisted.
- A user's "role" can change over time (e.g., a Citizen becoming a Donor) rather than requiring a separate account per role, keeping one identity per real person.
- Several foreign keys (`assigned_volunteer_id`, `campaign_id`, `managed_by`) are intentionally nullable because those associations form after the base record is created.

## 4. Interface Design

VERA's only integration surface is its REST API. All 30+ endpoints — grouped by module (auth, emergencies, blood, volunteers/verification, resources/coordination, donations/campaigns, notifications, shelters/incidents, opportunities/applications/certificates, coverage, search, reports/stats, health) — are fully specified with method, path, required role, request shape, and response shape in **`22-api-design.md`**.

The frontend never queries the database directly; `src/lib/api.ts` is the single client-side integration point, attaching the bearer token to every authenticated call and normalizing backend errors into a typed `ApiError` for the UI to display.

## 5. Security Design

| Concern | Mechanism |
|---|---|
| Password storage | bcrypt hashing (`passlib`), never plaintext |
| Authentication | OAuth2 password flow issuing a signed JWT (HS256), 24-hour expiry |
| Authorization | Per-endpoint role gating via `require_roles()`; Admin always passes |
| Cross-origin access | Explicit `CORS_ORIGINS` allow-list, not a wildcard |
| Data exposure | Donor contact info and ID-verification fields are only returned through authenticated, purpose-specific endpoints |

A known hardening item — the registration endpoint technically accepts a `role` of `admin` in the request payload even though the frontend UI never offers it — is documented as an open risk in `14-non-functional-requirements.md` (NFR-SEC6) rather than left undocumented, since identifying such gaps is part of responsible technical design.

## 6. Error Handling & Validation

- **Input validation** is enforced declaratively through Pydantic schemas (e.g., minimum password length, blood-units range, non-empty descriptions); invalid input returns HTTP 422 with field-level detail before any database write occurs.
- **Domain errors** (resource not found, insufficient role, invalid credentials) are raised as explicit `HTTPException`s with 404/403/401 status codes and a human-readable `detail` message.
- **Client-side handling**: the frontend's shared `request()` helper catches non-2xx responses, extracts the `detail` message, and throws a typed `ApiError` that UI components display directly to the user instead of a raw network error.

## 7. Deployment & Configuration

| Setting | Dev value | Production approach |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./vera.db` | PostgreSQL connection string |
| `SECRET_KEY` | dev placeholder | securely generated secret, injected via environment/secret manager |
| `CORS_ORIGINS` | `http://localhost:3000` | the deployed frontend's real origin(s) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | the deployed backend's real origin |

Local development is started with `npm run setup` (installs dependencies and creates env files) followed by `npm run dev` (runs frontend and backend concurrently), as documented in the project README. The planned production topology — containerized backend instances behind a load balancer, with PostgreSQL as the data store — is diagrammed in `19-system-design.md`, Section 6.

## 8. Testing Approach (Outlook)

The current MVP does not yet include an automated test suite. For a system coordinating real emergencies, the recommended minimum before any production use would be: unit tests around the donor-matching query and the opportunity slot-filling logic (both have non-trivial conditional behavior), integration tests covering the full register → login → create-emergency flow, and a manual test pass against each role's permission boundaries (e.g., confirming a Citizen genuinely cannot create a shelter).

## 9. Future Technical Roadmap

Carried over from `01-project-overview.md`, Section 13, with technical framing:

1. Introduce Alembic for versioned schema migrations ahead of the SQLite → PostgreSQL move.
2. Integrate a real Maps/geocoding API so coordinates are captured automatically instead of manually supplied.
3. Add an SMS/email notification gateway so alerts reach users who are not actively browsing the app — important given the disaster scenarios this system targets.
4. Build a mobile application against the existing REST API, which was designed to be client-agnostic from the start.
5. Investigate offline/low-connectivity support patterns for disaster scenarios where networks degrade.

## 10. Document Map

| Document | Covers |
|---|---|
| `18-erd.md` | Conceptual data model and relationships |
| `19-system-design.md` | Architecture, components, sequence diagrams, deployment |
| `21-database-design.md` | Physical schema: tables, columns, constraints, indexes |
| `22-api-design.md` | Full REST API contract |

---
*This TDD is the fourth and final documentation phase for VERA, following the Project Idea & Business Analysis, PRD, and SRS phases.*
