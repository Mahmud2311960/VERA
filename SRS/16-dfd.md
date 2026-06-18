# Data Flow Diagrams (DFD) — VERA

**Document:** 16-dfd.md
**Phase:** Software Requirements Specification (SRS)
**Project:** VERA — Volunteer Emergency Response Alliance
**Author:** [Your Name] — SRS & TDD module owner

## 1. Purpose

This document models how data moves through VERA: which external entities send/receive data, which processes transform it, and which data stores persist it. Diagrams use standard DFD conventions: rectangles for external entities, rounded nodes for processes, and cylinder shapes for data stores.

## 2. Context Diagram (Level 0)

The context diagram treats VERA as a single process and shows all external entities that interact with it.

```mermaid
flowchart TB
    Citizen[Citizen]
    Volunteer[Volunteer]
    Donor[Donor]
    NGO[NGO]
    Hospital[Hospital]
    Admin[Admin]

    System((0.0
VERA System))

    Citizen -- "registration data, emergency/blood requests, donations" --> System
    System -- "confirmations, status updates, notifications" --> Citizen

    Volunteer -- "verification docs, applications, coverage reports" --> System
    System -- "verification status, opportunity matches, certificates" --> Volunteer

    Donor -- "availability, blood group" --> System
    System -- "blood request alerts" --> Donor

    NGO -- "resources, opportunities, campaigns, coordination requests" --> System
    System -- "applicant lists, donation totals, underserved-area alerts" --> NGO

    Hospital -- "blood/medical requests, resource data" --> System
    System -- "matching donor lists" --> Hospital

    Admin -- "verification decisions, queries" --> System
    System -- "system-wide reports" --> Admin
```

## 3. Level 1 DFD — Major Process Decomposition

Level 1 decomposes the single system process into seven major processes and the data stores they read from or write to.

```mermaid
flowchart TB
    Citizen[Citizen]
    Volunteer[Volunteer]
    Donor[Donor]
    NGO[NGO]
    Hospital[Hospital]
    Admin[Admin]

    P1((1.0
Manage Users
& Verification))
    P2((2.0
Manage Emergency
& Blood Requests))
    P3((3.0
Manage Resources
& Coordination))
    P4((4.0
Manage Donations
& Campaigns))
    P5((5.0
Manage Volunteer
Engagement))
    P6((6.0
Manage Shelters,
Incidents & Coverage))
    P7((7.0
Notify & Report))

    D1[("D1 Users")]
    D2[("D2 Emergency /
Blood Requests")]
    D3[("D3 Resources /
Coordination")]
    D4[("D4 Donations /
Campaigns")]
    D5[("D5 Opportunities /
Applications /
Certificates")]
    D6[("D6 Shelters /
Incidents /
Coverage")]
    D7[("D7 Notifications")]

    Citizen --> P1
    Volunteer --> P1
    NGO --> P1
    Hospital --> P1
    Admin -- "review decisions" --> P1
    P1 <--> D1

    Citizen --> P2
    Hospital --> P2
    Volunteer -- "status updates" --> P2
    P2 <--> D2
    P2 -- "donor match request" --> D1
    P2 -- "trigger alert" --> P7

    NGO --> P3
    Hospital --> P3
    P3 <--> D3

    Citizen --> P4
    NGO --> P4
    P4 <--> D4

    Volunteer --> P5
    NGO --> P5
    P5 <--> D5
    P5 -- "trigger alert" --> P7

    Citizen --> P6
    Volunteer --> P6
    NGO --> P6
    P6 <--> D6
    P6 -- "underserved alert" --> P7

    P7 <--> D7
    P7 -- "system report" --> Admin
    P7 -- "notifications" --> Citizen
    P7 -- "notifications" --> Volunteer
    P7 -- "notifications" --> Donor
    P7 -- "notifications" --> NGO
```

## 4. Process Descriptions

| Process | Description | Implements |
|---|---|---|
| 1.0 Manage Users & Verification | Registration, login, profile retrieval, donor self-registration, volunteer ID verification submission and Admin review | `auth.py`, parts of `features.py` |
| 2.0 Manage Emergency & Blood Requests | Create/list/update emergency requests; create/list/update blood requests; donor matching | `emergencies.py`, `blood.py` |
| 3.0 Manage Resources & Coordination | NGO/Hospital resource registration; NGO coordination requests and status updates | `features.py` (resources, coordination) |
| 4.0 Manage Donations & Campaigns | Recording donations, linking to campaigns, updating raised amounts, campaign creation | `features.py` (donations, campaigns) |
| 5.0 Manage Volunteer Engagement | Opportunity posting, applications, approval, certificate issuance and verification | `features.py` (opportunities, applications, certificates) |
| 6.0 Manage Shelters, Incidents & Coverage | Shelter registration, incident reports, disaster coverage status reporting | `features.py` (shelters, incidents, coverage) |
| 7.0 Notify & Report | Generates notifications triggered by other processes; aggregates dashboard stats and Admin reports | `services/notifications.py`, `stats.py`, `reports.py` |

## 5. Data Store Reference

| Store | Physical Table(s) |
|---|---|
| D1 Users | `users` |
| D2 Emergency / Blood Requests | `emergency_requests`, `blood_requests` |
| D3 Resources / Coordination | `resources`, `ngo_coordinations` |
| D4 Donations / Campaigns | `donations`, `fundraising_campaigns` |
| D5 Opportunities / Applications / Certificates | `volunteer_opportunities`, `volunteer_applications`, `certificates` |
| D6 Shelters / Incidents / Coverage | `shelters`, `incident_reports`, `disaster_coverage` |
| D7 Notifications | `notifications` |

Full column-level detail for each table is documented in `21-database-design.md`.

## 6. Traceability Note

Each process above corresponds to one or more functional requirement modules in `13-functional-requirements.md`, and each data store corresponds to one or more entities in `18-erd.md`.
