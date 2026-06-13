from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models import BloodGroup, EmergencyStatus, User, UserRole
from app.schemas import BloodRequestCreate, BloodRequestRead, BloodRequestUpdate

router = APIRouter(prefix="/blood", tags=["blood"])


@router.get("/requests", response_model=list[BloodRequestRead])
def list_blood_requests(
    status_filter: EmergencyStatus | None = None,
    blood_group: BloodGroup | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    from app.models import BloodRequest

    query = db.query(BloodRequest)
    if status_filter:
        query = query.filter(BloodRequest.status == status_filter)
    if blood_group:
        query = query.filter(BloodRequest.blood_group == blood_group)
    return query.order_by(BloodRequest.created_at.desc()).all()


@router.post("/requests", response_model=BloodRequestRead, status_code=201)
def create_blood_request(
    payload: BloodRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import BloodRequest

    request = BloodRequest(**payload.model_dump(), requester_id=current_user.id)
    db.add(request)
    db.flush()

    donors = (
        db.query(User)
        .filter(
            User.role == UserRole.DONOR,
            User.blood_group == payload.blood_group,
            User.available_for_donation.is_(True),
            User.is_active.is_(True),
        )
        .all()
    )
    from app.services.notifications import create_notification

    for donor in donors:
        create_notification(
            db,
            user_id=donor.id,
            title="Urgent blood request",
            message=f"{payload.patient_name} needs {payload.blood_group.value} blood.",
            link="/blood",
        )

    db.commit()
    db.refresh(request)
    return request


@router.patch("/requests/{request_id}", response_model=BloodRequestRead)
def update_blood_request(
    request_id: int,
    payload: BloodRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.DONOR, UserRole.HOSPITAL, UserRole.VOLUNTEER, UserRole.ADMIN)
    ),
):
    from app.models import BloodRequest

    request = db.get(BloodRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Blood request not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(request, field, value)
    db.commit()
    db.refresh(request)
    return request


@router.get("/donors", response_model=list[dict])
def find_donors(
    blood_group: BloodGroup,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[dict]:
    donors = (
        db.query(User)
        .filter(
            User.role == UserRole.DONOR,
            User.blood_group == blood_group,
            User.available_for_donation.is_(True),
            User.is_active.is_(True),
        )
        .all()
    )
    return [
        {
            "id": donor.id,
            "full_name": donor.full_name,
            "phone": donor.phone,
            "blood_group": donor.blood_group.value if donor.blood_group else None,
            "address": donor.address,
        }
        for donor in donors
    ]
