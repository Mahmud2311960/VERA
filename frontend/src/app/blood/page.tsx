"use client";

import { FormEvent, useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api, ApiError } from "@/lib/api";
import type { BloodDonor, BloodGroup, BloodRequest } from "@/types";

const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchGroup, setSearchGroup] = useState<BloodGroup>("O+");
  const [form, setForm] = useState({
    patient_name: "",
    blood_group: "O+" as BloodGroup,
    units_needed: 1,
    hospital_name: "",
    location: "",
    contact_phone: "",
    notes: "",
    is_urgent: true,
  });

  useEffect(() => {
    api.listBloodRequests().then(setRequests);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const created = await api.createBloodRequest(form);
      setRequests((prev) => [created, ...prev]);
      setForm({ patient_name: "", blood_group: "O+", units_needed: 1, hospital_name: "", location: "", contact_phone: "", notes: "", is_urgent: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create request");
    } finally {
      setLoading(false);
    }
  }

  async function markResolved(id: number) {
    const updated = await api.updateBloodRequest(id, "resolved");
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  async function searchDonors() {
    setDonors(await api.findDonors(searchGroup));
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Blood Requests</h1>
        <p className="mt-2 text-slate-600">Create urgent blood requests, notify donors, and mark requests as resolved.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold">New blood request</h2>
              <div className="mt-4 space-y-3">
                <input required placeholder="Patient name" value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                <select value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value as BloodGroup })} className="w-full rounded-lg border px-3 py-2 text-sm">
                  {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <input required placeholder="Contact phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                <input placeholder="Hospital" value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="mt-4 w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white">{loading ? "Submitting..." : "Submit Request"}</button>
            </form>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold">Blood donor search</h2>
              <div className="mt-3 flex gap-2">
                <select value={searchGroup} onChange={(e) => setSearchGroup(e.target.value as BloodGroup)} className="flex-1 rounded-lg border px-3 py-2 text-sm">
                  {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <button type="button" onClick={searchDonors} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Search</button>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {donors.map((d) => (
                  <li key={d.id} className="rounded-lg bg-slate-50 p-3">{d.full_name} · {d.blood_group} · {d.phone ?? "No phone"}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            {requests.map((request) => (
              <article key={request.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{request.patient_name} · {request.blood_group}</h3>
                    <p className="text-sm text-slate-600">{request.units_needed} unit(s) · {request.status}</p>
                  </div>
                  {request.status === "open" && (
                    <button type="button" onClick={() => markResolved(request.id)} className="rounded-lg border px-3 py-1 text-xs">Mark resolved</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
