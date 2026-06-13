"use client";

import { FormEvent, useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api, ApiError } from "@/lib/api";
import type { EmergencyRequest, EmergencyType, User } from "@/types";

const emergencyTypes: { value: EmergencyType; label: string }[] = [
  { value: "medical", label: "Medical" }, { value: "blood", label: "Blood" }, { value: "ambulance", label: "Ambulance" },
  { value: "food", label: "Food" }, { value: "shelter", label: "Shelter" }, { value: "rescue", label: "Rescue" },
  { value: "transport", label: "Transport" }, { value: "missing_person", label: "Missing Person" }, { value: "other", label: "Other" },
];

export default function EmergenciesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", emergency_type: "medical" as EmergencyType, location: "", contact_phone: "" });

  useEffect(() => {
    api.me().then(setUser);
    api.listEmergencies().then(setRequests);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const created = await api.createEmergency(form);
      setRequests((prev) => [created, ...prev]);
      setForm({ title: "", description: "", emergency_type: "medical", location: "", contact_phone: "" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed");
    }
  }

  async function verifyRequest(id: number) {
    const updated = await api.updateEmergency(id, { is_verified: true, status: "verified" });
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  const canVerify = user && ["volunteer", "ngo", "hospital", "admin"].includes(user.role);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Emergency Requests</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold">New request</h2>
            <div className="mt-4 space-y-3">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <select value={form.emergency_type} onChange={(e) => setForm({ ...form, emergency_type: e.target.value as EmergencyType })} className="w-full rounded-lg border px-3 py-2 text-sm">
                {emergencyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <textarea required minLength={10} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-28 w-full rounded-lg border px-3 py-2 text-sm" />
              <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button type="submit" className="mt-4 w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white">Submit</button>
          </form>
          <div className="space-y-4">
            {requests.map((request) => (
              <article key={request.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{request.title}</h3>
                    <p className="text-sm text-slate-600">{request.description}</p>
                    <p className="mt-2 text-xs text-slate-500">{request.emergency_type} · {request.status} {request.is_verified ? "· verified" : ""}</p>
                  </div>
                  {canVerify && !request.is_verified && (
                    <button type="button" onClick={() => verifyRequest(request.id)} className="h-fit rounded-lg border px-3 py-1 text-xs">Verify</button>
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
