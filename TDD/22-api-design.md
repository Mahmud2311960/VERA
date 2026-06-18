# API Design — VERA

**Document:** 22-api-design.md
**Phase:** Technical Design Document (TDD)
**Project:** VERA — Volunteer Emergency Response Alliance
**Author:** [Your Name] — SRS & TDD module owner

## 1. Purpose

This document specifies VERA's REST API contract as implemented in `backend/app/api/routes`. It is the authoritative reference for every endpoint, its access rules, and its request/response shape.

## 2. Conventions

- **Base URL (dev):** `http://localhost:8000`
- **Versioned prefix:** all endpoints below `/api/v1` except `/health`.
- **Format:** JSON request/response bodies, except `/auth/login` which uses `application/x-www-form-urlencoded` (OAuth2 password flow).
- **Authentication:** `Authorization: Bearer <jwt>` header, obtained from `/auth/login`. Tokens expire after 24 hours (`access_token_expire_minutes = 1440`).
- **Authorization:** role checks are applied per-endpoint; an Admin can always perform role-gated actions in addition to the listed roles.
- **Errors:** validation failures return `422` with a Pydantic-style `detail` array; domain errors return `401` (invalid/missing token), `403` (insufficient role), or `404` (not found) with `{"detail": "<message>"}`.

## 3. Authentication

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/api/v1/auth/register` | None | `UserCreate` (email, full_name, password ≥8 chars, role, phone?, organization_name?, address?, latitude?, longitude?, blood_group?) | `201` `UserRead` |
| POST | `/api/v1/auth/login` | None | form: `username` (email), `password` | `200` `{access_token, token_type: "bearer"}` |
| GET | `/api/v1/auth/me` | Bearer | — | `200` `UserRead` |

## 4. Emergency Requests

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/emergencies` | Any authenticated user | query: `status_filter?`, `type_filter?` | `200` `EmergencyRequestRead[]` |
| POST | `/api/v1/emergencies` | Any authenticated user | `EmergencyRequestCreate` (title ≥3, description ≥10, emergency_type, location?, lat?, lon?, contact_phone?) | `201` `EmergencyRequestRead` |
| GET | `/api/v1/emergencies/{id}` | Any authenticated user | — | `200` `EmergencyRequestRead` / `404` |
| PATCH | `/api/v1/emergencies/{id}` | Volunteer, NGO, Hospital, Admin | `EmergencyRequestUpdate` (status?, is_verified?, assigned_volunteer_id?) | `200` `EmergencyRequestRead` |

## 5. Blood Requests & Donors

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/blood/requests` | Any authenticated user | query: `status_filter?`, `blood_group?` | `200` `BloodRequestRead[]` |
| POST | `/api/v1/blood/requests` | Any authenticated user | `BloodRequestCreate` (patient_name, blood_group, units_needed 1–10, hospital_name?, location?, contact_phone, notes?, is_urgent) | `201` `BloodRequestRead` — also notifies matching available donors |
| PATCH | `/api/v1/blood/requests/{id}` | Donor, Hospital, Volunteer, Admin | `BloodRequestUpdate` (status?) | `200` `BloodRequestRead` |
| GET | `/api/v1/blood/donors` | Any authenticated user | query: `blood_group` (required) | `200` `[{id, full_name, phone, blood_group, address}]` |

## 6. Volunteers, Verification & Donor Registration

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| POST | `/api/v1/volunteers/verification` | Volunteer | `VolunteerVerificationRequest` (id_document_type, id_document_number 5–64 chars) | `200` `UserRead` (status → pending) |
| PATCH | `/api/v1/volunteers/{user_id}/verification` | Admin | `VerificationReview` (status) | `200` `UserRead` — notifies the volunteer |
| POST | `/api/v1/donors/register` | Any authenticated user | `BecomeDonorRequest` (blood_group, available_for_donation, phone?, address?) | `200` `UserRead` (role → donor) |

## 7. Resources & NGO Coordination

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/resources` | Any authenticated user | — | `200` `ResourceRead[]` |
| POST | `/api/v1/resources` | NGO, Hospital, Admin | `ResourceCreate` (name, resource_type, quantity ≥0, unit, location?, lat?, lon?, notes?) | `201` `ResourceRead` |
| GET | `/api/v1/coordination` | Any authenticated user | — | `200` `CoordinationRead[]` |
| POST | `/api/v1/coordination` | NGO, Hospital, Admin | `CoordinationCreate` (title, message, volunteers_needed ≥0, location?) | `201` `CoordinationRead` |
| PATCH | `/api/v1/coordination/{id}` | NGO, Volunteer, Admin | `CoordinationUpdate` (status?) | `200` `CoordinationRead` |

## 8. Donations & Fundraising

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/donations` | Any authenticated user (own only, unless Admin) | — | `200` `DonationRead[]` |
| POST | `/api/v1/donations` | Any authenticated user | `DonationCreate` (donation_type, amount?, item_description?, campaign_id?) | `201` `DonationRead` |
| GET | `/api/v1/campaigns` | Any authenticated user | — | `200` `CampaignRead[]` |
| POST | `/api/v1/campaigns` | NGO, Admin | `CampaignCreate` (title, description, cause, goal_amount > 0) | `201` `CampaignRead` |

## 9. Notifications

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/notifications` | Any authenticated user (own only) | — | `200` `NotificationRead[]` |
| PATCH | `/api/v1/notifications/{id}/read` | Any authenticated user (own only) | — | `200` `NotificationRead` |

## 10. Shelters & Incidents

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/shelters` | Any authenticated user | — | `200` `ShelterRead[]` (active only) |
| POST | `/api/v1/shelters` | NGO, Admin | `ShelterCreate` (name, address, capacity >0, available_beds ≥0, contact_phone, lat?, lon?) | `201` `ShelterRead` |
| GET | `/api/v1/incidents` | Any authenticated user | — | `200` `IncidentRead[]` |
| POST | `/api/v1/incidents` | Any authenticated user | `IncidentCreate` (title, description, disaster_type, severity, location, lat?, lon?) | `201` `IncidentRead` |

## 11. Volunteer Opportunities, Applications & Certificates

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/opportunities` | Any authenticated user | — | `200` `OpportunityRead[]` |
| POST | `/api/v1/opportunities` | NGO, Admin | `OpportunityCreate` (title, description, location, slots ≥1, start_date?, end_date?) | `201` `OpportunityRead` |
| POST | `/api/v1/opportunities/{id}/apply` | Volunteer | — | `201` `ApplicationRead` (only if opportunity is open) |
| PATCH | `/api/v1/applications/{id}/review` | NGO, Admin | query: `status` (ApplicationStatus) | `200` `ApplicationRead` — approval auto-fills slots |
| GET | `/api/v1/certificates` | Any authenticated user (own only, unless Admin/NGO) | — | `200` `CertificateRead[]` |
| POST | `/api/v1/certificates` | NGO, Admin | `CertificateCreate` (volunteer_id, program_name) | `201` `CertificateRead` — auto-generates `certificate_code`, notifies volunteer |
| GET | `/api/v1/certificates/verify/{code}` | **Public — no auth required** | — | `200` `CertificateRead` / `404` |

## 12. Disaster Coverage

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/coverage` | Any authenticated user | — | `200` `CoverageRead[]` |
| POST | `/api/v1/coverage` | NGO, Volunteer, Admin | `CoverageCreate` (area_name, latitude, longitude, coverage_status, notes?) | `201` `CoverageRead` — notifies all NGOs if status is Underserved/Critical |

## 13. Search

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/search/nearby` | Any authenticated user | query: `latitude`, `longitude`, `radius_km` (default 25, max 200), `search_type?` (volunteer/hospital/ngo/donor/shelter/resource/emergency) | `200` `NearbySearchResult[]` sorted by `distance_km` |

## 14. Reports & Stats

| Method | Path | Auth / Roles | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/reports/admin` | Admin | — | `200` `AdminReport` (counts by role/status, totals, active opportunities, open incidents) |
| GET | `/api/v1/stats/dashboard` | Any authenticated user | — | `200` `DashboardStats` (users, open emergencies, open blood requests, verified volunteers, active campaigns, open shelters, underserved areas, unread notifications) |

## 15. Health

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/health` | None | `200 {"status": "ok", "service": "vera-api"}` |

## 16. Sample Payloads

**Register (`POST /api/v1/auth/register`):**
```json
{
  "email": "rina@example.com",
  "full_name": "Rina Akter",
  "phone": "+8801712345678",
  "role": "volunteer",
  "password": "SecurePass123"
}
```

**Login response (`POST /api/v1/auth/login`):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Create blood request (`POST /api/v1/blood/requests`):**
```json
{
  "patient_name": "Abdul Karim",
  "blood_group": "B+",
  "units_needed": 2,
  "hospital_name": "Dhaka Medical College Hospital",
  "location": "Dhaka",
  "contact_phone": "+8801812345678",
  "is_urgent": true
}
```

**Certificate verification (public, `GET /api/v1/certificates/verify/VERA-A1B2C3D4E5`):**
```json
{
  "id": 12,
  "volunteer_id": 4,
  "organization_id": 7,
  "program_name": "Flood Relief Drive 2026",
  "certificate_code": "VERA-A1B2C3D4E5",
  "issue_date": "2026-05-10T09:00:00",
  "is_verified": true
}
```

## 17. Traceability Note

Every endpoint above directly implements one or more functional requirements from `13-functional-requirements.md` and operates on the schema defined in `21-database-design.md`.
