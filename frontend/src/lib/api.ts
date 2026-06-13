import { clearToken, getToken, setToken } from "./auth";
import type {
  AdminReport,
  BloodDonor,
  BloodRequest,
  BloodRequestPayload,
  Campaign,
  Certificate,
  Coordination,
  CoverageArea,
  DashboardStats,
  Donation,
  EmergencyPayload,
  EmergencyRequest,
  Incident,
  NearbyResult,
  Notification,
  Opportunity,
  RegisterPayload,
  Resource,
  Shelter,
  User,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = (await response.json()) as { detail?: string | { msg: string }[] };
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail)) message = data.detail[0]?.msg ?? message;
    } catch {
      message = response.statusText;
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  register(payload: RegisterPayload) {
    return request<User>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }, false);
  },

  async login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) throw new ApiError("Invalid email or password", response.status);
    const data = (await response.json()) as { access_token: string };
    setToken(data.access_token);
    return data;
  },

  logout() {
    clearToken();
  },

  me() {
    return request<User>("/api/v1/auth/me");
  },

  dashboardStats() {
    return request<DashboardStats>("/api/v1/stats/dashboard");
  },

  adminReport() {
    return request<AdminReport>("/api/v1/reports/admin");
  },

  listEmergencies() {
    return request<EmergencyRequest[]>("/api/v1/emergencies");
  },

  createEmergency(payload: EmergencyPayload) {
    return request<EmergencyRequest>("/api/v1/emergencies", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateEmergency(id: number, payload: Record<string, unknown>) {
    return request<EmergencyRequest>(`/api/v1/emergencies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  listBloodRequests() {
    return request<BloodRequest[]>("/api/v1/blood/requests");
  },

  createBloodRequest(payload: BloodRequestPayload) {
    return request<BloodRequest>("/api/v1/blood/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateBloodRequest(id: number, status: string) {
    return request<BloodRequest>(`/api/v1/blood/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  findDonors(bloodGroup: string) {
    return request<BloodDonor[]>(`/api/v1/blood/donors?blood_group=${encodeURIComponent(bloodGroup)}`);
  },

  becomeDonor(payload: Record<string, unknown>) {
    return request<User>("/api/v1/donors/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  submitVerification(payload: Record<string, unknown>) {
    return request<User>("/api/v1/volunteers/verification", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listResources() {
    return request<Resource[]>("/api/v1/resources");
  },

  createResource(payload: Record<string, unknown>) {
    return request<Resource>("/api/v1/resources", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listCoordination() {
    return request<Coordination[]>("/api/v1/coordination");
  },

  createCoordination(payload: Record<string, unknown>) {
    return request<Coordination>("/api/v1/coordination", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listDonations() {
    return request<Donation[]>("/api/v1/donations");
  },

  createDonation(payload: Record<string, unknown>) {
    return request<Donation>("/api/v1/donations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listCampaigns() {
    return request<Campaign[]>("/api/v1/campaigns");
  },

  createCampaign(payload: Record<string, unknown>) {
    return request<Campaign>("/api/v1/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listNotifications() {
    return request<Notification[]>("/api/v1/notifications");
  },

  markNotificationRead(id: number) {
    return request<Notification>(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
  },

  listShelters() {
    return request<Shelter[]>("/api/v1/shelters");
  },

  createShelter(payload: Record<string, unknown>) {
    return request<Shelter>("/api/v1/shelters", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listIncidents() {
    return request<Incident[]>("/api/v1/incidents");
  },

  createIncident(payload: Record<string, unknown>) {
    return request<Incident>("/api/v1/incidents", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listOpportunities() {
    return request<Opportunity[]>("/api/v1/opportunities");
  },

  createOpportunity(payload: Record<string, unknown>) {
    return request<Opportunity>("/api/v1/opportunities", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  applyOpportunity(id: number) {
    return request(`/api/v1/opportunities/${id}/apply`, { method: "POST" });
  },

  listCertificates() {
    return request<Certificate[]>("/api/v1/certificates");
  },

  issueCertificate(payload: Record<string, unknown>) {
    return request<Certificate>("/api/v1/certificates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyCertificate(code: string) {
    return request<Certificate>(`/api/v1/certificates/verify/${code}`, {}, false);
  },

  listCoverage() {
    return request<CoverageArea[]>("/api/v1/coverage");
  },

  createCoverage(payload: Record<string, unknown>) {
    return request<CoverageArea>("/api/v1/coverage", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  searchNearby(latitude: number, longitude: number, searchType?: string) {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
    });
    if (searchType) params.set("search_type", searchType);
    return request<NearbyResult[]>(`/api/v1/search/nearby?${params.toString()}`);
  },
};

export { ApiError };
