from fastapi import APIRouter

from app.api.routes import auth, blood, emergencies, features, reports, search, stats

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(emergencies.router)
api_router.include_router(blood.router)
api_router.include_router(stats.router)
api_router.include_router(features.router)
api_router.include_router(search.router)
api_router.include_router(reports.router)
