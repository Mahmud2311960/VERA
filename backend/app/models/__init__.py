import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    VOLUNTEER = "volunteer"
    DONOR = "donor"
    NGO = "ngo"
    HOSPITAL = "hospital"
    ADMIN = "admin"


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class EmergencyType(str, enum.Enum):
    MEDICAL = "medical"
    BLOOD = "blood"
    AMBULANCE = "ambulance"
    FOOD = "food"
    SHELTER = "shelter"
    RESCUE = "rescue"
    TRANSPORT = "transport"
    MISSING_PERSON = "missing_person"
    OTHER = "other"


class EmergencyStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    VERIFIED = "verified"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"


class BloodGroup(str, enum.Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"


class DocumentType(str, enum.Enum):
    NID = "nid"
    PASSPORT = "passport"
    OTHER = "other"


class ResourceType(str, enum.Enum):
    FOOD = "food"
    MEDICINE = "medicine"
    CLOTHING = "clothing"
    EQUIPMENT = "equipment"
    MONEY = "money"
    OTHER = "other"


class DonationType(str, enum.Enum):
    MONEY = "money"
    FOOD = "food"
    MEDICINE = "medicine"
    CLOTHING = "clothing"
    EQUIPMENT = "equipment"
    OTHER = "other"


class CoordinationStatus(str, enum.Enum):
    OPEN = "open"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CoverageStatus(str, enum.Enum):
    SERVED = "served"
    PARTIAL = "partial"
    UNDERSERVED = "underserved"
    CRITICAL = "critical"


class OpportunityStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"
    COMPLETED = "completed"


class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class CampaignStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.CITIZEN)
    organization_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    blood_group: Mapped[BloodGroup | None] = mapped_column(Enum(BloodGroup), nullable=True)
    available_for_donation: Mapped[bool] = mapped_column(Boolean, default=False)
    id_document_type: Mapped[DocumentType | None] = mapped_column(Enum(DocumentType), nullable=True)
    id_document_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), default=VerificationStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    emergency_requests: Mapped[list["EmergencyRequest"]] = relationship(
        back_populates="requester"
    )
    blood_requests: Mapped[list["BloodRequest"]] = relationship(back_populates="requester")


class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    emergency_type: Mapped[EmergencyType] = mapped_column(Enum(EmergencyType))
    status: Mapped[EmergencyStatus] = mapped_column(
        Enum(EmergencyStatus), default=EmergencyStatus.OPEN
    )
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    assigned_volunteer_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    requester: Mapped[User] = relationship(back_populates="emergency_requests", foreign_keys=[requester_id])


class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    patient_name: Mapped[str] = mapped_column(String(255))
    blood_group: Mapped[BloodGroup] = mapped_column(Enum(BloodGroup))
    units_needed: Mapped[int] = mapped_column(default=1)
    hospital_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    contact_phone: Mapped[str] = mapped_column(String(32))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[EmergencyStatus] = mapped_column(
        Enum(EmergencyStatus), default=EmergencyStatus.OPEN
    )
    is_urgent: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    requester: Mapped[User] = relationship(back_populates="blood_requests")


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(255))
    resource_type: Mapped[ResourceType] = mapped_column(Enum(ResourceType))
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    unit: Mapped[str] = mapped_column(String(32), default="units")
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class NGOCoordination(Base):
    __tablename__ = "ngo_coordinations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    volunteers_needed: Mapped[int] = mapped_column(Integer, default=0)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[CoordinationStatus] = mapped_column(
        Enum(CoordinationStatus), default=CoordinationStatus.OPEN
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Donation(Base):
    __tablename__ = "donations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    donor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    campaign_id: Mapped[int | None] = mapped_column(ForeignKey("fundraising_campaigns.id"), nullable=True)
    donation_type: Mapped[DonationType] = mapped_column(Enum(DonationType))
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    item_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    allocated_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FundraisingCampaign(Base):
    __tablename__ = "fundraising_campaigns"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    cause: Mapped[str] = mapped_column(String(255))
    goal_amount: Mapped[float] = mapped_column(Float)
    raised_amount: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[CampaignStatus] = mapped_column(Enum(CampaignStatus), default=CampaignStatus.ACTIVE)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    link: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Shelter(Base):
    __tablename__ = "shelters"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str] = mapped_column(String(500))
    capacity: Mapped[int] = mapped_column(Integer)
    available_beds: Mapped[int] = mapped_column(Integer)
    contact_phone: Mapped[str] = mapped_column(String(32))
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    managed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    reporter_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    disaster_type: Mapped[str] = mapped_column(String(64))
    severity: Mapped[str] = mapped_column(String(32), default="medium")
    location: Mapped[str] = mapped_column(String(500))
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[EmergencyStatus] = mapped_column(
        Enum(EmergencyStatus), default=EmergencyStatus.OPEN
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VolunteerOpportunity(Base):
    __tablename__ = "volunteer_opportunities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    location: Mapped[str] = mapped_column(String(500))
    slots: Mapped[int] = mapped_column(Integer, default=1)
    filled_slots: Mapped[int] = mapped_column(Integer, default=0)
    start_date: Mapped[str | None] = mapped_column(String(32), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(32), nullable=True)
    status: Mapped[OpportunityStatus] = mapped_column(
        Enum(OpportunityStatus), default=OpportunityStatus.OPEN
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VolunteerApplication(Base):
    __tablename__ = "volunteer_applications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    opportunity_id: Mapped[int] = mapped_column(ForeignKey("volunteer_opportunities.id"))
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus), default=ApplicationStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    organization_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    program_name: Mapped[str] = mapped_column(String(255))
    certificate_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    issue_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True)


class DisasterCoverage(Base):
    __tablename__ = "disaster_coverage"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    area_name: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    coverage_status: Mapped[CoverageStatus] = mapped_column(Enum(CoverageStatus))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reported_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
