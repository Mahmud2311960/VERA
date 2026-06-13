export type UserRole =
  | "citizen"
  | "volunteer"
  | "donor"
  | "ngo"
  | "hospital"
  | "admin";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type EmergencyType =
  | "medical"
  | "blood"
  | "ambulance"
  | "food"
  | "shelter"
  | "rescue"
  | "transport"
  | "missing_person"
  | "other";

export type EmergencyStatus =
  | "open"
  | "in_progress"
  | "verified"
  | "resolved"
  | "cancelled";

export type DocumentType = "nid" | "passport" | "other";
export type ResourceType = "food" | "medicine" | "clothing" | "equipment" | "money" | "other";
export type DonationType = "money" | "food" | "medicine" | "clothing" | "equipment" | "other";
export type CoverageStatus = "served" | "partial" | "underserved" | "critical";
export type CoordinationStatus = "open" | "accepted" | "completed" | "cancelled";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  organization_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  blood_group: BloodGroup | null;
  available_for_donation: boolean;
  id_document_type: DocumentType | null;
  id_document_number: string | null;
  is_active: boolean;
  is_verified: boolean;
  verification_status: string;
  created_at: string;
}

export interface EmergencyRequest {
  id: number;
  requester_id: number;
  title: string;
  description: string;
  emergency_type: EmergencyType;
  status: EmergencyStatus;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string | null;
  assigned_volunteer_id: number | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BloodRequest {
  id: number;
  requester_id: number;
  patient_name: string;
  blood_group: BloodGroup;
  units_needed: number;
  hospital_name: string | null;
  location: string | null;
  contact_phone: string;
  notes: string | null;
  status: EmergencyStatus;
  is_urgent: boolean;
  created_at: string;
}

export interface BloodDonor {
  id: number;
  full_name: string;
  phone: string | null;
  blood_group: string | null;
  address: string | null;
}

export interface Resource {
  id: number;
  organization_id: number;
  name: string;
  resource_type: ResourceType;
  quantity: number;
  unit: string;
  location: string | null;
  notes: string | null;
  created_at: string;
}

export interface Coordination {
  id: number;
  requester_id: number;
  title: string;
  message: string;
  volunteers_needed: number;
  location: string | null;
  status: CoordinationStatus;
  created_at: string;
}

export interface Donation {
  id: number;
  donor_id: number;
  campaign_id: number | null;
  donation_type: DonationType;
  amount: number | null;
  item_description: string | null;
  allocated_to: string | null;
  created_at: string;
}

export interface Campaign {
  id: number;
  creator_id: number;
  title: string;
  description: string;
  cause: string;
  goal_amount: number;
  raised_amount: number;
  status: string;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Shelter {
  id: number;
  name: string;
  address: string;
  capacity: number;
  available_beds: number;
  contact_phone: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Incident {
  id: number;
  reporter_id: number;
  title: string;
  description: string;
  disaster_type: string;
  severity: string;
  location: string;
  status: EmergencyStatus;
  created_at: string;
}

export interface Opportunity {
  id: number;
  organization_id: number;
  title: string;
  description: string;
  location: string;
  slots: number;
  filled_slots: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
}

export interface Certificate {
  id: number;
  volunteer_id: number;
  organization_id: number;
  program_name: string;
  certificate_code: string;
  issue_date: string;
  is_verified: boolean;
}

export interface CoverageArea {
  id: number;
  area_name: string;
  latitude: number;
  longitude: number;
  coverage_status: CoverageStatus;
  notes: string | null;
  reported_by: number;
  updated_at: string;
}

export interface NearbyResult {
  id: number;
  name: string;
  type: string;
  role: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_km: number | null;
  extra: Record<string, unknown> | null;
}

export interface DashboardStats {
  total_users: number;
  open_emergencies: number;
  open_blood_requests: number;
  verified_volunteers: number;
  active_campaigns: number;
  open_shelters: number;
  underserved_areas: number;
  unread_notifications: number;
}

export interface AdminReport {
  users_by_role: Record<string, number>;
  emergencies_by_status: Record<string, number>;
  blood_requests_by_status: Record<string, number>;
  total_donations: number;
  total_raised: number;
  active_opportunities: number;
  open_incidents: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  organization_name?: string;
  address?: string;
  blood_group?: BloodGroup;
}

export interface EmergencyPayload {
  title: string;
  description: string;
  emergency_type: EmergencyType;
  location?: string;
  latitude?: number;
  longitude?: number;
  contact_phone?: string;
}

export interface BloodRequestPayload {
  patient_name: string;
  blood_group: BloodGroup;
  units_needed: number;
  hospital_name?: string;
  location?: string;
  contact_phone: string;
  notes?: string;
  is_urgent?: boolean;
}
