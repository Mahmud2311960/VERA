"use client";

import { FormEvent, useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api, ApiError } from "@/lib/api";
import type { BloodGroup, Certificate, Opportunity, User } from "@/types";

export default function VolunteersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifiedCert, setVerifiedCert] = useState<Certificate | null>(null);
  const [docForm, setDocForm] = useState({ id_document_type: "nid", id_document_number: "" });
  const [certForm, setCertForm] = useState({ volunteer_id: "", program_name: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.me().then(setUser);
    api.listOpportunities().then(setOpportunities);
    api.listCertificates().then(setCertificates);
  }, []);

  async function submitVerification(e: FormEvent) {
    e.preventDefault();
    try {
      const updated = await api.submitVerification(docForm);
      setUser(updated);
      setMessage("Verification submitted for review.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Failed");
    }
  }

  async function apply(id: number) {
    await api.applyOpportunity(id);
    setMessage("Application submitted.");
  }

  async function issueCertificate(e: FormEvent) {
    e.preventDefault();
    const cert = await api.issueCertificate({ volunteer_id: Number(certForm.volunteer_id), program_name: certForm.program_name });
    setCertificates((prev) => [cert, ...prev]);
    setMessage("Certificate issued.");
  }

  async function verifyCert() {
    setVerifiedCert(await api.verifyCertificate(verifyCode));
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <h1 className="text-3xl font-bold">Volunteers</h1>
        {message && <p className="text-sm text-emerald-700">{message}</p>}

        {user?.role === "volunteer" && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Volunteer verification</h2>
            <p className="mt-1 text-sm text-slate-600">Status: {user.verification_status} {user.is_verified ? "(verified)" : ""}</p>
            <form onSubmit={submitVerification} className="mt-4 flex flex-wrap gap-3">
              <select value={docForm.id_document_type} onChange={(e) => setDocForm({ ...docForm, id_document_type: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                <option value="nid">NID</option><option value="passport">Passport</option><option value="other">Other</option>
              </select>
              <input required placeholder="Document number" value={docForm.id_document_number} onChange={(e) => setDocForm({ ...docForm, id_document_number: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
              <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Submit</button>
            </form>
          </section>
        )}

        {user?.role === "citizen" && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Become a blood donor</h2>
            <button type="button" onClick={() => api.becomeDonor({ blood_group: "O+" as BloodGroup, available_for_donation: true }).then(() => setMessage("Registered as donor."))} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Register as O+ donor</button>
          </section>
        )}

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Volunteer opportunities</h2>
          <div className="mt-4 space-y-3">
            {opportunities.map((o) => (
              <div key={o.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{o.title}</h3>
                <p className="text-sm text-slate-600">{o.description}</p>
                <p className="mt-1 text-xs text-slate-500">{o.location} · {o.filled_slots}/{o.slots} slots</p>
                {user?.role === "volunteer" && o.status === "open" && (
                  <button type="button" onClick={() => apply(o.id)} className="mt-2 rounded-lg border px-3 py-1 text-xs">Apply</button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Certificates</h2>
          <div className="mt-3 space-y-2">
            {certificates.map((c) => (
              <div key={c.id} className="rounded-lg bg-slate-50 p-3 text-sm">{c.program_name} · {c.certificate_code}</div>
            ))}
          </div>
          {(user?.role === "ngo" || user?.role === "admin") && (
            <form onSubmit={issueCertificate} className="mt-4 flex flex-wrap gap-3">
              <input required placeholder="Volunteer ID" value={certForm.volunteer_id} onChange={(e) => setCertForm({ ...certForm, volunteer_id: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
              <input required placeholder="Program name" value={certForm.program_name} onChange={(e) => setCertForm({ ...certForm, program_name: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
              <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Issue</button>
            </form>
          )}
          <div className="mt-4 flex gap-2">
            <input placeholder="Verify certificate code" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
            <button type="button" onClick={verifyCert} className="rounded-lg border px-4 py-2 text-sm">Verify</button>
          </div>
          {verifiedCert && <p className="mt-2 text-sm text-emerald-700">Valid: {verifiedCert.program_name}</p>}
        </section>
      </div>
    </AuthGuard>
  );
}
