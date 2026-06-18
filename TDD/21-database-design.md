# Database Design — VERA

**Document:** 21-database-design.md
**Phase:** Technical Design Document (TDD)
**Project:** VERA — Volunteer Emergency Response Alliance
**Author:** [Your Name] — SRS & TDD module owner

## 1. Purpose

This document specifies the physical database schema implemented via SQLAlchemy ORM models in `backend/app/models/__init__.py`: every table, column, type, constraint, default, and index. It is the implementation-level companion to the conceptual model in `18-erd.md`.

## 2. Engine & Configuration

| Environment | Engine | Configured via |
|---|---|---|
| Development | SQLite (`vera.db` file) | `DATABASE_URL=sqlite:///./vera.db` (default in `core/config.py`) |
| Production (target) | PostgreSQL | `DATABASE_URL` environment variable, no code change required |

Tables are currently created automatically at application startup via `Base.metadata.create_all()`; the roadmap calls for replacing this with versioned Alembic migrations before production deployment.

## 3. Table: `users`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| email | VARCHAR(255) | UNIQUE, indexed, not null |
| full_name | VARCHAR(255) | not null |
| phone | VARCHAR(32) | nullable |
| hashed_password | VARCHAR(255) | not null |
| role | ENUM(UserRole) | not null, default `citizen` |
| organization_name | VARCHAR(255) | nullable |
| address | VARCHAR(500) | nullable |
| latitude | FLOAT | nullable |
| longitude | FLOAT | nullable |
| blood_group | ENUM(BloodGroup) | nullable |
| available_for_donation | BOOLEAN | default `false` |
| id_document_type | ENUM(DocumentType) | nullable |
| id_document_number | VARCHAR(64) | nullable |
| is_active | BOOLEAN | default `true` |
| is_verified | BOOLEAN | default `false` |
| verification_status | ENUM(VerificationStatus) | default `pending` |
| created_at | DATETIME | default = now (UTC) |

## 4. Table: `emergency_requests`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| requester_id | INTEGER | FK → `users.id`, not null |
| title | VARCHAR(255) | not null |
| description | TEXT | not null |
| emergency_type | ENUM(EmergencyType) | not null |
| status | ENUM(EmergencyStatus) | default `open` |
| location | VARCHAR(500) | nullable |
| latitude | FLOAT | nullable |
| longitude | FLOAT | nullable |
| contact_phone | VARCHAR(32) | nullable |
| assigned_volunteer_id | INTEGER | FK → `users.id`, nullable |
| is_verified | BOOLEAN | default `false` |
| created_at | DATETIME | default = now |
| updated_at | DATETIME | default = now, updates on change |

## 5. Table: `blood_requests`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| requester_id | INTEGER | FK → `users.id`, not null |
| patient_name | VARCHAR(255) | not null |
| blood_group | ENUM(BloodGroup) | not null |
| units_needed | INTEGER | default 1 (1–10 enforced at API layer) |
| hospital_name | VARCHAR(255) | nullable |
| location | VARCHAR(500) | nullable |
| contact_phone | VARCHAR(32) | not null |
| notes | TEXT | nullable |
| status | ENUM(EmergencyStatus) | default `open` |
| is_urgent | BOOLEAN | default `true` |
| created_at | DATETIME | default = now |

## 6. Table: `resources`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| organization_id | INTEGER | FK → `users.id`, not null |
| name | VARCHAR(255) | not null |
| resource_type | ENUM(ResourceType) | not null |
| quantity | INTEGER | default 0 |
| unit | VARCHAR(32) | default `"units"` |
| location | VARCHAR(500) | nullable |
| latitude | FLOAT | nullable |
| longitude | FLOAT | nullable |
| notes | TEXT | nullable |
| created_at | DATETIME | default = now |

## 7. Table: `ngo_coordinations`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| requester_id | INTEGER | FK → `users.id`, not null |
| title | VARCHAR(255) | not null |
| message | TEXT | not null |
| volunteers_needed | INTEGER | default 0 |
| location | VARCHAR(500) | nullable |
| status | ENUM(CoordinationStatus) | default `open` |
| created_at | DATETIME | default = now |

## 8. Table: `donations`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| donor_id | INTEGER | FK → `users.id`, not null |
| campaign_id | INTEGER | FK → `fundraising_campaigns.id`, nullable |
| donation_type | ENUM(DonationType) | not null |
| amount | FLOAT | nullable (used for monetary donations) |
| item_description | TEXT | nullable (used for in-kind donations) |
| allocated_to | VARCHAR(255) | nullable, auto-set to campaign title when linked |
| created_at | DATETIME | default = now |

## 9. Table: `fundraising_campaigns`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| creator_id | INTEGER | FK → `users.id`, not null |
| title | VARCHAR(255) | not null |
| description | TEXT | not null |
| cause | VARCHAR(255) | not null |
| goal_amount | FLOAT | not null, > 0 enforced at API layer |
| raised_amount | FLOAT | default 0, incremented on linked donations |
| status | ENUM(CampaignStatus) | default `active` |
| created_at | DATETIME | default = now |

## 10. Table: `notifications`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| user_id | INTEGER | FK → `users.id`, not null |
| title | VARCHAR(255) | not null |
| message | TEXT | not null |
| link | VARCHAR(255) | nullable |
| is_read | BOOLEAN | default `false` |
| created_at | DATETIME | default = now |

## 11. Table: `shelters`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| name | VARCHAR(255) | not null |
| address | VARCHAR(500) | not null |
| capacity | INTEGER | not null, > 0 enforced at API layer |
| available_beds | INTEGER | not null, ≥ 0 enforced at API layer |
| contact_phone | VARCHAR(32) | not null |
| latitude | FLOAT | nullable |
| longitude | FLOAT | nullable |
| managed_by | INTEGER | FK → `users.id`, nullable |
| is_active | BOOLEAN | default `true` |
| created_at | DATETIME | default = now |

## 12. Table: `incident_reports`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| reporter_id | INTEGER | FK → `users.id`, not null |
| title | VARCHAR(255) | not null |
| description | TEXT | not null |
| disaster_type | VARCHAR(64) | not null |
| severity | VARCHAR(32) | default `"medium"` |
| location | VARCHAR(500) | not null |
| latitude | FLOAT | nullable |
| longitude | FLOAT | nullable |
| status | ENUM(EmergencyStatus) | default `open` |
| created_at | DATETIME | default = now |

## 13. Table: `volunteer_opportunities`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| organization_id | INTEGER | FK → `users.id`, not null |
| title | VARCHAR(255) | not null |
| description | TEXT | not null |
| location | VARCHAR(500) | not null |
| slots | INTEGER | default 1, ≥ 1 enforced at API layer |
| filled_slots | INTEGER | default 0 |
| start_date | VARCHAR(32) | nullable |
| end_date | VARCHAR(32) | nullable |
| status | ENUM(OpportunityStatus) | default `open` |
| created_at | DATETIME | default = now |

## 14. Table: `volunteer_applications`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| opportunity_id | INTEGER | FK → `volunteer_opportunities.id`, not null |
| volunteer_id | INTEGER | FK → `users.id`, not null |
| status | ENUM(ApplicationStatus) | default `pending` |
| created_at | DATETIME | default = now |

## 15. Table: `certificates`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| volunteer_id | INTEGER | FK → `users.id`, not null |
| organization_id | INTEGER | FK → `users.id`, not null |
| program_name | VARCHAR(255) | not null |
| certificate_code | VARCHAR(64) | UNIQUE, indexed, not null — generated as `VERA-<10 hex chars>` |
| issue_date | DATETIME | default = now |
| is_verified | BOOLEAN | default `true` |

## 16. Table: `disaster_coverage`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, indexed |
| area_name | VARCHAR(255) | not null |
| latitude | FLOAT | not null |
| longitude | FLOAT | not null |
| coverage_status | ENUM(CoverageStatus) | not null |
| notes | TEXT | nullable |
| reported_by | INTEGER | FK → `users.id`, not null |
| updated_at | DATETIME | default = now, updates on change |

## 17. Indexing Summary

| Table.Column | Index Type | Reason |
|---|---|---|
| `users.id` | Primary key index | Row identity |
| `users.email` | Unique index | Login lookup, prevents duplicate accounts |
| `certificates.certificate_code` | Unique index | Public certificate-verification lookup |
| All other `id` columns | Primary key index | Row identity, default ORM behavior |

## 18. Schema Hardening Notes (for production)

- **Migrations:** replace `create_all()` with Alembic migrations so schema changes are versioned and reversible.
- **Cascade behavior:** define explicit `ON DELETE` behavior for foreign keys (e.g., what happens to a volunteer's applications if their account is deactivated) rather than relying on default no-action behavior.
- **Composite indexes:** consider adding a composite index on `(blood_group, available_for_donation, is_active)` on `users` to speed up the donor-matching query as data volume grows, and on `(latitude, longitude)` for tables used in nearby search.

## 19. Traceability Note

This schema implements the entities and relationships modeled conceptually in `18-erd.md` and is exposed to clients through the endpoints documented in `22-api-design.md`.
