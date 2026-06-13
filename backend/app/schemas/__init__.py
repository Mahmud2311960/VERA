from datetime import datetime
import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import (
    ApplicationStatus,
    BloodGroup,
    CampaignStatus,
    CoordinationStatus,
    CoverageStatus,
    DocumentType,
    DonationType,
    EmergencyStatus,
    EmergencyType,
    OpportunityStatus,
    ResourceType,
    UserRole,
    VerificationStatus,
)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    phone: str | None = None
    role: UserRole = UserRole.CITIZEN
    organization_name: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    blood_group: BloodGroup | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    available_for_donation: bool
    id_document_type: DocumentType | None
    id_document_number: str | None
    is_active: bool
    is_verified: bool
    verification_status: VerificationStatus
    created_at: datetime


class BecomeDonorRequest(BaseModel):
    blood_group: BloodGroup
    available_for_donation: bool = True
    phone: str | None = None
    address: str | None = None


class VolunteerVerificationRequest(BaseModel):
    id_document_type: DocumentType
    id_document_number: str = Field(min_length=5, max_length=64)


class VerificationReview(BaseModel):
    status: VerificationStatus


class EmergencyRequestCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10)
    emergency_type: EmergencyType
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    contact_phone: str | None = None


class EmergencyRequestUpdate(BaseModel):
    status: EmergencyStatus | None = None
    is_verified: bool | None = None
    assigned_volunteer_id: int | None = None


class EmergencyRequestRead(EmergencyRequestCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requester_id: int
    status: EmergencyStatus
    assigned_volunteer_id: int | None
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class BloodRequestCreate(BaseModel):
    patient_name: str = Field(min_length=2, max_length=255)
    blood_group: BloodGroup
    units_needed: int = Field(default=1, ge=1, le=10)
    hospital_name: str | None = None
    location: str | None = None
    contact_phone: str = Field(min_length=6, max_length=32)
    notes: str | None = None
    is_urgent: bool = True


class BloodRequestUpdate(BaseModel):
    status: EmergencyStatus | None = None


class BloodRequestRead(BloodRequestCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requester_id: int
    status: EmergencyStatus
    created_at: datetime


class ResourceCreate(BaseModel):
    name: str
    resource_type: ResourceType
    quantity: int = Field(ge=0)
    unit: str = "units"
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    notes: str | None = None


class ResourceRead(ResourceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    created_at: datetime


class CoordinationCreate(BaseModel):
    title: str
    message: str
    volunteers_needed: int = Field(default=0, ge=0)
    location: str | None = None


class CoordinationUpdate(BaseModel):
    status: CoordinationStatus | None = None


class CoordinationRead(CoordinationCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requester_id: int
    status: CoordinationStatus
    created_at: datetime


class DonationCreate(BaseModel):
    donation_type: DonationType
    amount: float | None = Field(default=None, ge=0)
    item_description: str | None = None
    campaign_id: int | None = None


class DonationRead(DonationCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    donor_id: int
    allocated_to: str | None
    created_at: datetime


class CampaignCreate(BaseModel):
    title: str
    description: str
    cause: str
    goal_amount: float = Field(gt=0)


class CampaignRead(CampaignCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_id: int
    raised_amount: float
    status: CampaignStatus
    created_at: datetime


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    link: str | None
    is_read: bool
    created_at: datetime


class ShelterCreate(BaseModel):
    name: str
    address: str
    capacity: int = Field(gt=0)
    available_beds: int = Field(ge=0)
    contact_phone: str
    latitude: float | None = None
    longitude: float | None = None


class ShelterRead(ShelterCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    managed_by: int | None
    is_active: bool
    created_at: datetime


class IncidentCreate(BaseModel):
    title: str
    description: str
    disaster_type: str
    severity: str = "medium"
    location: str
    latitude: float | None = None
    longitude: float | None = None


class IncidentRead(IncidentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reporter_id: int
    status: EmergencyStatus
    created_at: datetime


class OpportunityCreate(BaseModel):
    title: str
    description: str
    location: str
    slots: int = Field(default=1, ge=1)
    start_date: str | None = None
    end_date: str | None = None


class OpportunityRead(OpportunityCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    filled_slots: int
    status: OpportunityStatus
    created_at: datetime


class ApplicationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    opportunity_id: int
    volunteer_id: int
    status: ApplicationStatus
    created_at: datetime


class CertificateCreate(BaseModel):
    volunteer_id: int
    program_name: str


class CertificateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    volunteer_id: int
    organization_id: int
    program_name: str
    certificate_code: str
    issue_date: datetime
    is_verified: bool


class CoverageCreate(BaseModel):
    area_name: str
    latitude: float
    longitude: float
    coverage_status: CoverageStatus
    notes: str | None = None


class CoverageRead(CoverageCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reported_by: int
    updated_at: datetime


class NearbySearchResult(BaseModel):
    id: int
    name: str
    type: str
    role: str | None = None
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    distance_km: float | None = None
    extra: dict | None = None


class DashboardStats(BaseModel):
    total_users: int
    open_emergencies: int
    open_blood_requests: int
    verified_volunteers: int
    active_campaigns: int
    open_shelters: int
    underserved_areas: int
    unread_notifications: int


class AdminReport(BaseModel):
    users_by_role: dict[str, int]
    emergencies_by_status: dict[str, int]
    blood_requests_by_status: dict[str, int]
    total_donations: int
    total_raised: float
    active_opportunities: int
    open_incidents: int


def generate_certificate_code() -> str:
    return f"VERA-{uuid.uuid4().hex[:10].upper()}"
