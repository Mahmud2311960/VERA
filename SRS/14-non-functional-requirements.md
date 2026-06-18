# Non-Functional Requirements — VERA

**Document:** 14-non-functional-requirements.md
**Phase:** Software Requirements Specification (SRS)
**Project:** VERA — Volunteer Emergency Response Alliance
**Author:** [Ridwan Hasan Khandakar] — SRS & TDD module owner

## 1. Purpose

This document defines the quality attributes VERA must satisfy — how the system performs its functions, not just what it does. Categories follow the ISO/IEC 25010 quality model. Each requirement notes how it is currently satisfied in the implementation and, where relevant, what is still outstanding (tracked against the roadmap in `01-project-overview.md`).

## 2. Performance

| ID | Requirement |
|----|-------------|
| NFR-P1 | The system shall return list endpoints (emergencies, blood requests, resources, etc.) for typical data volumes (hundreds of records) within 500 ms under normal load. |
| NFR-P2 | The nearby-search endpoint shall compute distance (Haversine formula) and return results within 1 second for a radius of up to 200 km. |
| NFR-P3 | Dashboard statistics shall be computed on demand from the database; for large datasets this should move to cached/aggregated counters (future optimization). |

## 3. Scalability

| ID | Requirement |
|----|-------------|
| NFR-S1 | The backend shall be stateless (JWT-based auth, no server-side session), allowing multiple API instances to run behind a load balancer. |
| NFR-S2 | The data layer shall be swappable from SQLite (development) to PostgreSQL (production) purely via the `DATABASE_URL` environment variable, with no application code changes, since access is through SQLAlchemy's ORM layer. |
| NFR-S3 | The system shall be deployable to a cloud host (e.g., AWS) to absorb load spikes during large-scale disaster events, per the risk noted in the project overview ("System overload during disasters"). |

## 4. Security

| ID | Requirement |
|----|-------------|
| NFR-SEC1 | Passwords shall never be stored in plaintext; the system uses bcrypt password hashing (`passlib`). |
| NFR-SEC2 | All authenticated endpoints shall require a valid JWT bearer token (HS256), expiring after 24 hours. |
| NFR-SEC3 | Role-based authorization shall restrict sensitive write operations (issuing resources, shelters, campaigns, certificates, verification review) to the appropriate roles; Admin shall always be permitted. |
| NFR-SEC4 | Cross-origin requests shall be restricted to an explicit allow-list of frontend origins (`CORS_ORIGINS`), not a wildcard, in production. |
| NFR-SEC5 | The production deployment shall replace the default `SECRET_KEY` placeholder with a securely generated secret, since JWT integrity depends entirely on it. |
| NFR-SEC6 (gap to address) | **Current limitation:** the registration endpoint accepts an arbitrary `role` value in the request body, including `admin`, even though the frontend UI only offers Citizen/Volunteer/Donor/NGO/Hospital. A hardened deployment should explicitly reject self-registration as Admin at the API layer, not rely on the UI alone. This is flagged here as a known risk rather than hidden, since identifying it is part of the SRS security analysis. |

## 5. Reliability & Availability

| ID | Requirement |
|----|-------------|
| NFR-A1 | The API shall expose a `/health` endpoint for uptime monitoring and load-balancer health checks. |
| NFR-A2 | The system shall target 99% uptime once deployed to production hosting, recognizing that emergency-coordination use cases are time-critical. |
| NFR-A3 | Database writes for critical flows (creating a blood/emergency request) shall be transactional — a failed downstream step (e.g., notification dispatch) must not silently lose the original record. |

## 6. Usability

| ID | Requirement |
|----|-------------|
| NFR-U1 | The web interface shall be usable by non-technical citizens during stressful situations, favoring simple forms over complex multi-step flows. |
| NFR-U2 | Error messages returned by the API (e.g., validation failures) shall be surfaced to the user in plain language by the frontend, not raw stack traces. |
| NFR-U3 | Given Bangladesh's varying digital literacy levels (per the risk register in the project overview), future iterations should support Bangla-language UI and simplified flows for low-literacy users. |

## 7. Maintainability

| ID | Requirement |
|----|-------------|
| NFR-M1 | The backend shall remain organized by clear separation of concerns: models, schemas, API routes, and services, to keep each module independently testable. |
| NFR-M2 | Database schema changes shall move from `create_all()` auto-creation (current dev setup) to versioned Alembic migrations before production rollout, as already listed in the project roadmap. |
| NFR-M3 | Each new feature module (e.g., fundraising, certificates) shall be added as its own router/schema group rather than growing a single monolithic file, to limit merge conflicts in a multi-contributor team. |

## 8. Portability / Compatibility

| ID | Requirement |
|----|-------------|
| NFR-PO1 | The frontend shall run on evergreen browsers supporting modern JavaScript (Next.js 16 / React 19 baseline). |
| NFR-PO2 | The backend shall run on any platform supporting Python 3.11+ and the listed `requirements.txt` dependencies, with no OS-specific code. |
| NFR-PO3 | The API base URL shall be configurable via `NEXT_PUBLIC_API_URL`, allowing the same frontend build to target local, staging, or production backends. |

## 9. Data Integrity & Privacy

| ID | Requirement |
|----|-------------|
| NFR-D1 | Sensitive identity data (NID/passport numbers submitted for volunteer verification) shall be accessible only to the user themselves and Admins. |
| NFR-D2 | Donor contact details (phone, address) shall only be exposed through the authenticated donor-search endpoint, not in any public/unauthenticated response. |
| NFR-D3 | Foreign-key relationships (e.g., a donation referencing a deleted campaign) shall be validated at the application layer to avoid orphaned or inconsistent records. |

## 10. Constraints

- Development currently uses SQLite, a single-file embedded database; this is acceptable for the MVP/course-project stage but does not support concurrent high-write production load — migration to PostgreSQL is a prerequisite for real-world deployment.
- Notifications are in-app only; SMS/email gateways are not yet integrated (listed as a future roadmap item), which limits reach during actual low-connectivity disaster scenarios.
- Map-based location features currently rely on manually supplied latitude/longitude rather than a live Maps API/geocoding integration.

## 11. Traceability Note

These quality attributes apply across all functional modules in `13-functional-requirements.md` and inform the architectural decisions documented in `19-system-design.md` and `20-tdd.md`.
