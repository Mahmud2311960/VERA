from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.database import get_db
from app.models import (
    BloodRequest,
    Certificate,
    Donation,
    EmergencyRequest,
    EmergencyStatus,
    FundraisingCampaign,
    IncidentReport,
    OpportunityStatus,
    User,
    UserRole,
    VolunteerOpportunity,
)
from app.schemas import AdminReport

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/admin", response_model=AdminReport)
def admin_report(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> AdminReport:
    users = db.query(User).all()
    users_by_role: dict[str, int] = {}
    for user in users:
        users_by_role[user.role.value] = users_by_role.get(user.role.value, 0) + 1

    emergencies = db.query(EmergencyRequest).all()
    emergencies_by_status: dict[str, int] = {}
    for emergency in emergencies:
        emergencies_by_status[emergency.status.value] = (
            emergencies_by_status.get(emergency.status.value, 0) + 1
        )

    blood_requests = db.query(BloodRequest).all()
    blood_by_status: dict[str, int] = {}
    for request in blood_requests:
        blood_by_status[request.status.value] = blood_by_status.get(request.status.value, 0) + 1

    total_donations = db.query(Donation).count()
    total_raised = sum(c.raised_amount for c in db.query(FundraisingCampaign).all())
    active_opportunities = (
        db.query(VolunteerOpportunity)
        .filter(VolunteerOpportunity.status == OpportunityStatus.OPEN)
        .count()
    )
    open_incidents = (
        db.query(IncidentReport).filter(IncidentReport.status == EmergencyStatus.OPEN).count()
    )

    return AdminReport(
        users_by_role=users_by_role,
        emergencies_by_status=emergencies_by_status,
        blood_requests_by_status=blood_by_status,
        total_donations=total_donations,
        total_raised=total_raised,
        active_opportunities=active_opportunities,
        open_incidents=open_incidents,
    )
