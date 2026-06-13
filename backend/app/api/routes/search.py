import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import BloodRequest, EmergencyRequest, Resource, Shelter, User, UserRole
from app.schemas import NearbySearchResult

router = APIRouter(prefix="/search", tags=["search"])


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/nearby", response_model=list[NearbySearchResult])
def search_nearby(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius_km: float = Query(default=25, le=200),
    search_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[NearbySearchResult]:
    results: list[NearbySearchResult] = []

    role_map = {
        "volunteer": UserRole.VOLUNTEER,
        "hospital": UserRole.HOSPITAL,
        "ngo": UserRole.NGO,
        "donor": UserRole.DONOR,
    }

    if search_type in (None, "volunteer", "hospital", "ngo", "donor"):
        roles = [role_map[search_type]] if search_type in role_map else list(role_map.values())
        users = db.query(User).filter(User.role.in_(roles), User.latitude.isnot(None)).all()
        for user in users:
            if user.latitude is None or user.longitude is None:
                continue
            distance = haversine_km(latitude, longitude, user.latitude, user.longitude)
            if distance <= radius_km:
                results.append(
                    NearbySearchResult(
                        id=user.id,
                        name=user.full_name,
                        type="user",
                        role=user.role.value,
                        location=user.address,
                        latitude=user.latitude,
                        longitude=user.longitude,
                        distance_km=round(distance, 2),
                        extra={
                            "organization": user.organization_name,
                            "blood_group": user.blood_group.value if user.blood_group else None,
                            "phone": user.phone,
                        },
                    )
                )

    if search_type in (None, "shelter"):
        shelters = db.query(Shelter).filter(Shelter.is_active.is_(True)).all()
        for shelter in shelters:
            if shelter.latitude is None or shelter.longitude is None:
                continue
            distance = haversine_km(latitude, longitude, shelter.latitude, shelter.longitude)
            if distance <= radius_km:
                results.append(
                    NearbySearchResult(
                        id=shelter.id,
                        name=shelter.name,
                        type="shelter",
                        location=shelter.address,
                        latitude=shelter.latitude,
                        longitude=shelter.longitude,
                        distance_km=round(distance, 2),
                        extra={
                            "available_beds": shelter.available_beds,
                            "contact_phone": shelter.contact_phone,
                        },
                    )
                )

    if search_type in (None, "resource"):
        resources = db.query(Resource).all()
        for resource in resources:
            if resource.latitude is None or resource.longitude is None:
                continue
            distance = haversine_km(latitude, longitude, resource.latitude, resource.longitude)
            if distance <= radius_km:
                results.append(
                    NearbySearchResult(
                        id=resource.id,
                        name=resource.name,
                        type="resource",
                        location=resource.location,
                        latitude=resource.latitude,
                        longitude=resource.longitude,
                        distance_km=round(distance, 2),
                        extra={
                            "resource_type": resource.resource_type.value,
                            "quantity": resource.quantity,
                        },
                    )
                )

    if search_type in (None, "emergency"):
        emergencies = db.query(EmergencyRequest).filter(EmergencyRequest.latitude.isnot(None)).all()
        for emergency in emergencies:
            if emergency.latitude is None or emergency.longitude is None:
                continue
            distance = haversine_km(latitude, longitude, emergency.latitude, emergency.longitude)
            if distance <= radius_km:
                results.append(
                    NearbySearchResult(
                        id=emergency.id,
                        name=emergency.title,
                        type="emergency",
                        location=emergency.location,
                        latitude=emergency.latitude,
                        longitude=emergency.longitude,
                        distance_km=round(distance, 2),
                        extra={
                            "emergency_type": emergency.emergency_type.value,
                            "status": emergency.status.value,
                        },
                    )
                )

    results.sort(key=lambda item: item.distance_km or 9999)
    return results
