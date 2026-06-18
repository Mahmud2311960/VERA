# Software Requirements Specification (SRS) — VERA

**Document:** 17-srs.md
**Project:** VERA — Volunteer Emergency Response Alliance
**Course:** CSE307 — System Analysis and Design, Section 02
**Author:** [Your Name] — SRS & TDD module owner

## 1. Introduction

### 1.1 Purpose
This SRS specifies the requirements for VERA, a web-based emergency assistance and resource coordination platform for Bangladesh. It is intended for the development team, the course instructor, and any future contributor who needs an authoritative description of what the system does and the qualities it must meet.

### 1.2 Scope
VERA covers: user registration and role-based accounts; emergency and blood request submission and tracking; volunteer verification, opportunities, and certificates; NGO/Hospital resource and coordination management; donations and fundraising campaigns; shelter and incident-report management; disaster coverage monitoring; location-based search; and notifications and reporting. It does not, in the current MVP, cover SMS/email delivery, live map rendering, or offline operation — these are roadmap items (see `01-project-overview.md`, Section 13).

### 1.3 Definitions, Acronyms, Abbreviations

| Term | Meaning |
|---|---|
| SRS | Software Requirements Specification |
| FR / NFR | Functional Requirement / Non-Functional Requirement |
| JWT | JSON Web Token, used for authentication |
| NGO | Non-Governmental Organization |
| NID | National Identity Card (Bangladesh) |
| MVP | Minimum Viable Product |

### 1.4 References
- `01-project-overview.md` through `06-surveys.md` — Project Idea & Business Analysis phase
- `08-prd.md` through `12-acceptance-criteria.md` — Product Requirement Document
- `13-functional-requirements.md`, `14-non-functional-requirements.md`, `15-use-cases.md`, `16-dfd.md` — this SRS's supporting documents
- VERA source repository: `backend/app` and `frontend/src`

### 1.5 Overview
The remainder of this document describes the system from a high level (Section 2), summarizes its requirements with pointers to the detailed companion documents (Section 3), and specifies its external interfaces (Section 4).

## 2. Overall Description

### 2.1 Product Perspective
VERA is a new, standalone full-stack web application — not an extension of an existing system. It replaces the informal, fragmented coordination currently done over social media and personal calls (per the Problem Statement in `02-problem-statement.md`) with a structured client-server platform: a Next.js single-page frontend communicating with a FastAPI REST backend over JSON/HTTPS.

### 2.2 Product Functions (Summary)
The system's functions are organized into eleven modules, fully enumerated in `13-functional-requirements.md`:

1. Authentication & user management
2. Volunteer verification
3. Emergency request management
4. Blood request & donor management
5. Resources & NGO coordination
6. Donations & fundraising
7. Notifications
8. Shelters & incident reporting
9. Volunteer opportunities & certificates
10. Disaster coverage monitoring
11. Location-based search & admin reporting

### 2.3 User Classes and Characteristics
Six user classes interact with VERA: Citizen, Volunteer, Donor, NGO, Hospital, and Admin. Their goals, permissions, and representative end-to-end interactions are detailed in `15-use-cases.md`. Citizens and Volunteers are expected to access the system primarily via mobile browsers during stressful, time-sensitive situations; NGOs, Hospitals, and Admins are expected to use it more deliberately from desktop browsers for management tasks.

### 2.4 Operating Environment
- **Client:** Any modern web browser (desktop or mobile) capable of running a Next.js 16 / React 19 application.
- **Server:** Python 3.11+ runtime hosting a FastAPI application; SQLite for local development, PostgreSQL targeted for production.
- **Network:** Standard HTTPS; the backend exposes a versioned REST API under `/api/v1`.

### 2.5 Design and Implementation Constraints
- Authentication must use stateless JWT bearer tokens (no server-side session store), to support horizontal scaling.
- The data layer must remain accessible through SQLAlchemy's ORM so the underlying database engine can change without rewriting business logic.
- The frontend reads the API base URL from the `NEXT_PUBLIC_API_URL` environment variable, and the backend reads its CORS allow-list from `CORS_ORIGINS`, so both can be redeployed independently.

### 2.6 Assumptions and Dependencies
- Users have access to a smartphone or computer with internet connectivity; full offline support is out of scope for the current phase.
- The volunteer verification process relies on Admins to manually review submitted ID documents; there is no automated identity-verification service integrated yet.
- Location-based features assume users or organizations supply reasonably accurate latitude/longitude; no live geocoding service is integrated yet.

## 3. Specific Requirements

### 3.1 Functional Requirements
See `13-functional-requirements.md` for the complete, numbered list (FR-1.x through FR-12.x) covering every module summarized in Section 2.2.

### 3.2 Non-Functional Requirements
See `14-non-functional-requirements.md` for performance, scalability, security, reliability, usability, maintainability, portability, and data-integrity requirements, including known gaps identified during analysis (e.g., the registration endpoint's role field needing production hardening).

### 3.3 Use Case Model
See `15-use-cases.md` for the actor list, the actor × use-case matrix, and detailed specifications for the platform's most significant flows (emergency submission, blood-request donor matching, volunteer verification, opportunity application, fundraising, coverage reporting, and nearby search).

### 3.4 Data Flow Model
See `16-dfd.md` for the Context (Level 0) and Level 1 data flow diagrams showing how data moves between external entities, the seven major processing functions, and the underlying data stores.

## 4. External Interface Requirements

### 4.1 User Interfaces
The frontend currently implements the following screens, each mapped to one or more functional modules: Home, Login, Register, Dashboard, Emergencies, Blood, Resources, Donations, Shelters, Incidents, Volunteers, Coverage, Search, Notifications, and an Admin panel.

### 4.2 Hardware Interfaces
None beyond a standard client device (phone/computer) with a camera/keyboard for data entry and a server capable of running a containerized or virtual-machine Python/Node deployment. No specialized hardware is required.

### 4.3 Software Interfaces
- **REST API:** JSON over HTTP(S), versioned at `/api/v1`, documented in full in `22-api-design.md`.
- **Authentication:** OAuth2 password flow issuing JWT bearer tokens (`/api/v1/auth/login`).
- **Database:** SQLAlchemy ORM over SQLite (dev) / PostgreSQL (production target).

### 4.4 Communication Interfaces
All client-server communication occurs over HTTP(S) with JSON payloads; Cross-Origin Resource Sharing (CORS) is restricted to configured frontend origins. Future phases plan to add SMS and email notification channels (see roadmap in `01-project-overview.md`).

## 5. Appendices
- Appendix A — Functional Requirements: `13-functional-requirements.md`
- Appendix B — Non-Functional Requirements: `14-non-functional-requirements.md`
- Appendix C — Use Cases: `15-use-cases.md`
- Appendix D — Data Flow Diagrams: `16-dfd.md`

---
*This SRS is the third of four documentation phases for VERA, following the Project Idea & Business Analysis and PRD phases, and preceding the Technical Design Document (`20-tdd.md`).*
