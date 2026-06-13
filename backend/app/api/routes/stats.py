from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import (
    BloodRequest,
    CampaignStatus,
    CoverageStatus,
    DisasterCoverage,
    EmergencyRequest,
    EmergencyStatus,
    FundraisingCampaign,
    Notification,
    Shelter,
    User,
    UserRole,
)
from app.schemas import DashboardStats

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardStats:
    unread = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read.is_(False))
        .count()
    )
    return DashboardStats(
        total_users=db.query(User).count(),
        open_emergencies=db.query(EmergencyRequest)
        .filter(EmergencyRequest.status == EmergencyStatus.OPEN)
        .count(),
        open_blood_requests=db.query(BloodRequest)
        .filter(BloodRequest.status == EmergencyStatus.OPEN)
        .count(),
        verified_volunteers=db.query(User)
        .filter(User.role == UserRole.VOLUNTEER, User.is_verified.is_(True))
        .count(),
        active_campaigns=db.query(FundraisingCampaign)
        .filter(FundraisingCampaign.status == CampaignStatus.ACTIVE)
        .count(),
        open_shelters=db.query(Shelter).filter(Shelter.is_active.is_(True)).count(),
        underserved_areas=db.query(DisasterCoverage)
        .filter(DisasterCoverage.coverage_status.in_([CoverageStatus.UNDERSERVED, CoverageStatus.CRITICAL]))
        .count(),
        unread_notifications=unread,
    )
