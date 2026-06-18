# Functional Requirements — VERA

**Document:** 13-functional-requirements.md
**Phase:** Software Requirements Specification (SRS)
**Project:** VERA — Volunteer Emergency Response Alliance
**Author:** [Your Name] — SRS & TDD module owner

## 1. Purpose

This document lists the functional requirements (FRs) of the VERA platform — the specific behaviors the system must support. Requirements are grouped by module and traced to the actors defined in `03-stakeholder-analysis.md` and the system roles implemented in the backend (`UserRole`: Citizen, Volunteer, Donor, NGO, Hospital, Admin). Each requirement is written so it can be tested against the existing implementation in `backend/app`.

## 2. Actors / User Roles

| Role | Description |
|------|-------------|
| Citizen | Default role; reports emergencies/incidents, requests blood, donates |
| Volunteer | Citizen who registers as Volunteer; can submit ID verification, apply to opportunities, accept coordination tasks |
| Donor | User who registers blood-donation availability and blood group |
| NGO | Organization account; manages resources, opportunities, campaigns, shelters, coordination requests |
| Hospital | Organization account; broadcasts blood/medical needs, manages resources |
| Admin | Full access; reviews verifications, views system-wide reports |

## 3. FR Module 1 — Authentication & User Management

| ID | Requirement |
|----|-------------|
| FR-1.1 | The system shall allow a new user to register with email, full name, password (min. 8 characters), and a selected role (Citizen, Volunteer, Donor, NGO, or Hospital). |
| FR-1.2 | The system shall reject registration if the supplied email is already in use. |
| FR-1.3 | The system shall hash passwords (bcrypt) before storing them; plaintext passwords are never persisted. |
| FR-1.4 | The system shall authenticate users via email and password and issue a JWT bearer access token valid for 24 hours. |
| FR-1.5 | The system shall expose the authenticated user's own profile (`GET /auth/me`). |
| FR-1.6 | The system shall restrict role-specific actions using role-based access control, so that, e.g., only NGOs/Hospitals/Admins can create resources or shelters. |
| FR-1.7 | NGO and Hospital accounts shall additionally capture an organization name during registration. |

## 4. FR Module 2 — Volunteer Verification

| ID | Requirement |
|----|-------------|
| FR-2.1 | A Volunteer shall be able to submit identity verification by providing a document type (NID, Passport, or Other) and document number. |
| FR-2.2 | Submitting verification shall set the volunteer's status to "Pending" until reviewed. |
| FR-2.3 | An Admin shall be able to approve or reject a pending volunteer verification. |
| FR-2.4 | The system shall mark a volunteer as `is_verified = true` only when an Admin approves the request. |
| FR-2.5 | The system shall send the volunteer a notification when their verification status changes. |

## 5. FR Module 3 — Emergency Request Management

| ID | Requirement |
|----|-------------|
| FR-3.1 | Any authenticated user shall be able to submit an emergency request with a title, description, emergency type (medical, blood, ambulance, food, shelter, rescue, transport, missing person, other), and optional location/coordinates/contact phone. |
| FR-3.2 | The system shall list emergency requests, filterable by status and by type. |
| FR-3.3 | The system shall allow retrieval of a single emergency request by ID. |
| FR-3.4 | Volunteers, NGOs, Hospitals, and Admins shall be able to update an emergency request's status (Open, In Progress, Verified, Resolved, Cancelled) and assign a volunteer to it. |
| FR-3.5 | The system shall track whether an emergency request has been verified by an authorized user. |

## 6. FR Module 4 — Blood Request & Donor Management

| ID | Requirement |
|----|-------------|
| FR-4.1 | Any authenticated user shall be able to submit a blood request specifying patient name, blood group, units needed (1–10), hospital name, location, and a contact phone number. |
| FR-4.2 | On creation of a blood request, the system shall automatically notify all active donors whose registered blood group matches and who are marked available for donation. |
| FR-4.3 | The system shall list blood requests, filterable by status and blood group. |
| FR-4.4 | Donors, Hospitals, Volunteers, and Admins shall be able to update a blood request's status. |
| FR-4.5 | The system shall allow any authenticated user to search for available donors by blood group, returning name, phone, blood group, and address. |
| FR-4.6 | A Citizen shall be able to register as a blood Donor by providing blood group, availability flag, and optional phone/address; this updates their account role to Donor. |

## 7. FR Module 5 — Resources & NGO Coordination

| ID | Requirement |
|----|-------------|
| FR-5.1 | NGOs, Hospitals, and Admins shall be able to register relief resources (food, medicine, clothing, equipment, other) with quantity, unit, and location. |
| FR-5.2 | Any authenticated user shall be able to view the list of registered resources. |
| FR-5.3 | NGOs, Hospitals, and Admins shall be able to create a coordination request (e.g., asking for a number of volunteers at a location). |
| FR-5.4 | NGOs, Volunteers, and Admins shall be able to update a coordination request's status (Open, Accepted, Completed, Cancelled). |

## 8. FR Module 6 — Donations & Fundraising

| ID | Requirement |
|----|-------------|
| FR-6.1 | Any authenticated user shall be able to record a donation (money, food, medicine, clothing, equipment, or other), optionally tied to a fundraising campaign. |
| FR-6.2 | When a monetary donation is linked to a campaign, the system shall automatically increase that campaign's raised amount. |
| FR-6.3 | A user shall be able to view their own donation history; Admins shall be able to view all donations. |
| FR-6.4 | NGOs and Admins shall be able to create fundraising campaigns with a title, description, cause, and goal amount. |
| FR-6.5 | Any authenticated user shall be able to view active/past fundraising campaigns and their progress toward the goal. |

## 9. FR Module 7 — Notifications

| ID | Requirement |
|----|-------------|
| FR-7.1 | The system shall generate an in-app notification for a user whenever an event relevant to them occurs (matching blood request, verification update, certificate issued, underserved-area alert). |
| FR-7.2 | A user shall be able to retrieve their own list of notifications, most recent first. |
| FR-7.3 | A user shall be able to mark a notification as read. |

## 10. FR Module 8 — Shelters & Incident Reporting

| ID | Requirement |
|----|-------------|
| FR-8.1 | NGOs and Admins shall be able to register a shelter with name, address, total capacity, available beds, and contact phone. |
| FR-8.2 | Any authenticated user shall be able to view the list of currently active shelters. |
| FR-8.3 | Any authenticated user shall be able to submit an incident report describing a disaster event, including disaster type, severity, and location. |
| FR-8.4 | Any authenticated user shall be able to view submitted incident reports. |

## 11. FR Module 9 — Volunteer Opportunities & Certificates

| ID | Requirement |
|----|-------------|
| FR-9.1 | NGOs and Admins shall be able to publish a volunteer opportunity with title, description, location, number of slots, and optional start/end dates. |
| FR-9.2 | Volunteers shall be able to view open opportunities and apply to one, provided it is still open. |
| FR-9.3 | NGOs and Admins shall be able to approve or reject a volunteer's application. |
| FR-9.4 | When an application is approved, the system shall increment the opportunity's filled-slot count and automatically close the opportunity once all slots are filled. |
| FR-9.5 | NGOs and Admins shall be able to issue a unique certificate (auto-generated code) to a volunteer for a named program; the volunteer shall be notified. |
| FR-9.6 | Any user shall be able to verify a certificate's authenticity by its unique code. |

## 12. FR Module 10 — Disaster Coverage Monitoring

| ID | Requirement |
|----|-------------|
| FR-10.1 | NGOs, Volunteers, and Admins shall be able to report the relief-coverage status (Served, Partial, Underserved, Critical) of a named area with coordinates. |
| FR-10.2 | When an area is reported as Underserved or Critical, the system shall automatically notify all NGO accounts. |
| FR-10.3 | Any authenticated user shall be able to view the list of reported coverage statuses, most recently updated first. |

## 13. FR Module 11 — Location-Based Search

| ID | Requirement |
|----|-------------|
| FR-11.1 | Any authenticated user shall be able to search, by latitude/longitude and a radius (up to 200 km), for nearby volunteers, donors, hospitals, NGOs, shelters, resources, or open emergencies. |
| FR-11.2 | Search results shall include the computed distance (km) from the search point and shall be sorted nearest-first. |

## 14. FR Module 12 — Administration & Reporting

| ID | Requirement |
|----|-------------|
| FR-12.1 | The system shall provide a dashboard summary (total users, open emergencies, open blood requests, verified volunteers, active campaigns, open shelters, underserved areas, unread notifications) to authenticated users. |
| FR-12.2 | The system shall provide Admins a system-wide report broken down by user role, emergency status, blood-request status, total donations, total funds raised, active opportunities, and open incidents. |

## 15. Traceability Note

These functional requirements correspond directly to the implemented API surface, detailed in `22-api-design.md`, and the underlying schema in `21-database-design.md`. Use cases elaborating on representative end-to-end flows are documented in `15-use-cases.md`.
