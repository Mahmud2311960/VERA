from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models import EmergencyStatus, EmergencyType, User, UserRole, VerificationStatus
from app.schemas import DashboardStats, EmergencyRequestCreate, EmergencyRequestRead, EmergencyRequestUpdate

router = APIRouter(prefix="/emergencies", tags=["emergencies"])


@router.get("", response_model=list[EmergencyRequestRead])
def list_emergencies(
    status_filter: EmergencyStatus | None = None,
    type_filter: EmergencyType | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    from app.models import EmergencyRequest

    query = db.query(EmergencyRequest)
    if status_filter:
        query = query.filter(EmergencyRequest.status == status_filter)
    if type_filter:
        query = query.filter(EmergencyRequest.emergency_type == type_filter)
    return query.order_by(EmergencyRequest.created_at.desc()).all()


@router.post("", response_model=EmergencyRequestRead, status_code=201)
def create_emergency(
    payload: EmergencyRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import EmergencyRequest

    request = EmergencyRequest(**payload.model_dump(), requester_id=current_user.id)
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@router.get("/{request_id}", response_model=EmergencyRequestRead)
def get_emergency(
    request_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    from app.models import EmergencyRequest

    request = db.get(EmergencyRequest, request_id)
    if not request:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Emergency request not found")
    return request


@router.patch("/{request_id}", response_model=EmergencyRequestRead)
def update_emergency(
    request_id: int,
    payload: EmergencyRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.VOLUNTEER, UserRole.NGO, UserRole.HOSPITAL, UserRole.ADMIN)
    ),
):
    from fastapi import HTTPException

    from app.models import EmergencyRequest

    request = db.get(EmergencyRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Emergency request not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(request, field, value)
    db.commit()
    db.refresh(request)
    return request
