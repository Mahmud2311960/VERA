from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models import (
    ApplicationStatus,
    Certificate,
    CoordinationStatus,
    CoverageStatus,
    DisasterCoverage,
    Donation,
    FundraisingCampaign,
    IncidentReport,
    NGOCoordination,
    Notification,
    OpportunityStatus,
    Resource,
    Shelter,
    User,
    UserRole,
    VerificationStatus,
    VolunteerApplication,
    VolunteerOpportunity,
)
from app.schemas import (
    ApplicationRead,
    BecomeDonorRequest,
    CampaignCreate,
    CampaignRead,
    CertificateCreate,
    CertificateRead,
    CoordinationCreate,
    CoordinationRead,
    CoordinationUpdate,
    CoverageCreate,
    CoverageRead,
    DonationCreate,
    DonationRead,
    IncidentCreate,
    IncidentRead,
    NotificationRead,
    OpportunityCreate,
    OpportunityRead,
    ResourceCreate,
    ResourceRead,
    ShelterCreate,
    ShelterRead,
    UserRead,
    VerificationReview,
    VolunteerVerificationRequest,
    generate_certificate_code,
)
from app.services.notifications import create_notification

router = APIRouter(tags=["features"])


@router.post("/volunteers/verification", response_model=UserRead)
def submit_verification(
    payload: VolunteerVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.VOLUNTEER)),
):
    current_user.id_document_type = payload.id_document_type
    current_user.id_document_number = payload.id_document_number
    current_user.verification_status = VerificationStatus.PENDING
    current_user.is_verified = False
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/volunteers/{user_id}/verification", response_model=UserRead)
def review_verification(
    user_id: int,
    payload: VerificationReview,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.verification_status = payload.status
    user.is_verified = payload.status == VerificationStatus.APPROVED
    create_notification(
        db,
        user_id=user.id,
        title="Verification updated",
        message=f"Your volunteer verification status is now {payload.status.value}.",
        link="/volunteers",
    )
    db.commit()
    db.refresh(user)
    return user


@router.post("/donors/register", response_model=UserRead)
def become_donor(
    payload: BecomeDonorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.role = UserRole.DONOR
    current_user.blood_group = payload.blood_group
    current_user.available_for_donation = payload.available_for_donation
    if payload.phone:
        current_user.phone = payload.phone
    if payload.address:
        current_user.address = payload.address
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/resources", response_model=list[ResourceRead])
def list_resources(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Resource).order_by(Resource.created_at.desc()).all()


@router.post("/resources", response_model=ResourceRead, status_code=201)
def create_resource(
    payload: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.NGO, UserRole.HOSPITAL, UserRole.ADMIN)),
):
    resource = Resource(**payload.model_dump(), organization_id=current_user.id)
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


@router.get("/coordination", response_model=list[CoordinationRead])
def list_coordination(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(NGOCoordination).order_by(NGOCoordination.created_at.desc()).all()


@router.post("/coordination", response_model=CoordinationRead, status_code=201)
def create_coordination(
    payload: CoordinationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.NGO, UserRole.HOSPITAL, UserRole.ADMIN)),
):
    item = NGOCoordination(**payload.model_dump(), requester_id=current_user.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/coordination/{item_id}", response_model=CoordinationRead)
def update_coordination(
    item_id: int,
    payload: CoordinationUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.NGO, UserRole.VOLUNTEER, UserRole.ADMIN)),
):
    item = db.get(NGOCoordination, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Coordination request not found")
    if payload.status:
        item.status = payload.status
    db.commit()
    db.refresh(item)
    return item


@router.get("/donations", response_model=list[DonationRead])
def list_donations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Donation)
    if current_user.role != UserRole.ADMIN:
        query = query.filter(Donation.donor_id == current_user.id)
    return query.order_by(Donation.created_at.desc()).all()


@router.post("/donations", response_model=DonationRead, status_code=201)
def create_donation(
    payload: DonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    donation = Donation(**payload.model_dump(), donor_id=current_user.id)
    db.add(donation)
    if payload.campaign_id:
        campaign = db.get(FundraisingCampaign, payload.campaign_id)
        if campaign and payload.amount:
            campaign.raised_amount += payload.amount
            donation.allocated_to = campaign.title
    db.commit()
    db.refresh(donation)
    return donation


@router.get("/campaigns", response_model=list[CampaignRead])
def list_campaigns(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(FundraisingCampaign).order_by(FundraisingCampaign.created_at.desc()).all()


@router.post("/campaigns", response_model=CampaignRead, status_code=201)
def create_campaign(
    payload: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.NGO, UserRole.ADMIN)),
):
    campaign = FundraisingCampaign(**payload.model_dump(), creator_id=current_user.id)
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("/notifications", response_model=list[NotificationRead])
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.patch("/notifications/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.get(Notification, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.get("/shelters", response_model=list[ShelterRead])
def list_shelters(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Shelter).filter(Shelter.is_active.is_(True)).order_by(Shelter.created_at.desc()).all()


@router.post("/shelters", response_model=ShelterRead, status_code=201)
def create_shelter(
    payload: ShelterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.NGO, UserRole.ADMIN)),
):
    shelter = Shelter(**payload.model_dump(), managed_by=current_user.id)
    db.add(shelter)
    db.commit()
    db.refresh(shelter)
    return shelter


@router.get("/incidents", response_model=list[IncidentRead])
def list_incidents(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(IncidentReport).order_by(IncidentReport.created_at.desc()).all()


@router.post("/incidents", response_model=IncidentRead, status_code=201)
def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = IncidentReport(**payload.model_dump(), reporter_id=current_user.id)
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/opportunities", response_model=list[OpportunityRead])
def list_opportunities(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(VolunteerOpportunity).order_by(VolunteerOpportunity.created_at.desc()).all()


@router.post("/opportunities", response_model=OpportunityRead, status_code=201)
def create_opportunity(
    payload: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.NGO, UserRole.ADMIN)),
):
    opportunity = VolunteerOpportunity(**payload.model_dump(), organization_id=current_user.id)
    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)
    return opportunity


@router.post("/opportunities/{opportunity_id}/apply", response_model=ApplicationRead, status_code=201)
def apply_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.VOLUNTEER)),
):
    opportunity = db.get(VolunteerOpportunity, opportunity_id)
    if not opportunity or opportunity.status != OpportunityStatus.OPEN:
        raise HTTPException(status_code=404, detail="Opportunity not available")
    application = VolunteerApplication(opportunity_id=opportunity_id, volunteer_id=current_user.id)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.patch("/applications/{application_id}/review", response_model=ApplicationRead)
def review_application(
    application_id: int,
    status: ApplicationStatus,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.NGO, UserRole.ADMIN)),
):
    application = db.get(VolunteerApplication, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    application.status = status
    if status == ApplicationStatus.APPROVED:
        opportunity = db.get(VolunteerOpportunity, application.opportunity_id)
        if opportunity:
            opportunity.filled_slots += 1
            if opportunity.filled_slots >= opportunity.slots:
                opportunity.status = OpportunityStatus.CLOSED
    db.commit()
    db.refresh(application)
    return application


@router.get("/certificates", response_model=list[CertificateRead])
def list_certificates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Certificate)
    if current_user.role not in (UserRole.ADMIN, UserRole.NGO):
        query = query.filter(Certificate.volunteer_id == current_user.id)
    return query.order_by(Certificate.issue_date.desc()).all()


@router.post("/certificates", response_model=CertificateRead, status_code=201)
def issue_certificate(
    payload: CertificateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.NGO, UserRole.ADMIN)),
):
    certificate = Certificate(
        volunteer_id=payload.volunteer_id,
        organization_id=current_user.id,
        program_name=payload.program_name,
        certificate_code=generate_certificate_code(),
    )
    db.add(certificate)
    create_notification(
        db,
        user_id=payload.volunteer_id,
        title="Certificate issued",
        message=f"You received a certificate for {payload.program_name}.",
        link="/volunteers",
    )
    db.commit()
    db.refresh(certificate)
    return certificate


@router.get("/certificates/verify/{certificate_code}", response_model=CertificateRead)
def verify_certificate(certificate_code: str, db: Session = Depends(get_db)):
    certificate = db.query(Certificate).filter(Certificate.certificate_code == certificate_code).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return certificate


@router.get("/coverage", response_model=list[CoverageRead])
def list_coverage(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(DisasterCoverage).order_by(DisasterCoverage.updated_at.desc()).all()


@router.post("/coverage", response_model=CoverageRead, status_code=201)
def create_coverage(
    payload: CoverageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.NGO, UserRole.ADMIN, UserRole.VOLUNTEER)),
):
    coverage = DisasterCoverage(**payload.model_dump(), reported_by=current_user.id)
    db.add(coverage)
    if payload.coverage_status in (CoverageStatus.UNDERSERVED, CoverageStatus.CRITICAL):
        orgs = db.query(User).filter(User.role == UserRole.NGO).all()
        for org in orgs:
            create_notification(
                db,
                user_id=org.id,
                title="Underserved area reported",
                message=f"{payload.area_name} needs additional relief support.",
                link="/coverage",
            )
    db.commit()
    db.refresh(coverage)
    return coverage
