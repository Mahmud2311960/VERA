# VERA — Volunteer Emergency Response Alliance

A full-stack emergency assistance platform connecting citizens, volunteers, donors, NGOs, hospitals, and relief organizations.

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** FastAPI, SQLAlchemy, JWT auth, SQLite (dev)

## Project structure

```
VERA/
├── backend/          # FastAPI API
├── frontend/         # Next.js web app
└── Project Proposal Report of VERA.docx
```

## Quick start

From the project root:

```bash
npm run setup   # first time only — installs deps, env files, Python packages
npm run dev     # starts backend + frontend together
```

- App: http://localhost:3000
- API docs: http://localhost:8000/docs

## Features (MVP)

- User registration with roles (citizen, volunteer, donor, NGO, hospital)
- JWT login / logout
- Dashboard with live stats
- Emergency request submission and listing
- Blood request submission and listing
- Donor lookup by blood group (API)

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login (OAuth2 form) |
| GET | `/api/v1/auth/me` | Current user profile |
| GET/POST | `/api/v1/emergencies` | List / create emergencies |
| GET/POST | `/api/v1/blood/requests` | List / create blood requests |
| GET | `/api/v1/blood/donors?blood_group=B+` | Find donors |
| GET | `/api/v1/stats/dashboard` | Dashboard stats |

## Next steps

- PostgreSQL + Alembic migrations
- Volunteer verification workflow
- Maps integration for location tracking
- SMS/email notifications
- Fundraising campaigns
- NGO volunteer opportunity management
- Certificate management
