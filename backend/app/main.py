from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core.config import settings
from app.core.database import Base, engine
from app.models import (  # noqa: F401
    BloodRequest,
    Certificate,
    DisasterCoverage,
    Donation,
    EmergencyRequest,
    FundraisingCampaign,
    IncidentReport,
    NGOCoordination,
    Notification,
    Resource,
    Shelter,
    User,
    VolunteerApplication,
    VolunteerOpportunity,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if os.getenv("RESET_DB") == "1":
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.app_name,
    description="Volunteer Emergency Response Alliance API",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "vera-api"}
