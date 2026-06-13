"use client";

import { FormEvent, useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { Incident } from "@/types";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [form, setForm] = useState({ title: "", description: "", disaster_type: "flood", severity: "high", location: "" });

  useEffect(() => {
    api.listIncidents().then(setIncidents);
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const created = await api.createIncident(form);
    setIncidents((prev) => [created, ...prev]);
    setForm({ title: "", description: "", disaster_type: "flood", severity: "high", location: "" });
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Incident Reporting</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <form onSubmit={submit} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Report incident</h2>
            <div className="mt-4 space-y-3">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <select value={form.disaster_type} onChange={(e) => setForm({ ...form, disaster_type: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="flood">Flood</option><option value="cyclone">Cyclone</option><option value="fire">Fire</option><option value="earthquake">Earthquake</option>
              </select>
              <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-24 w-full rounded-lg border px-3 py-2 text-sm" />
              <input required placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="mt-4 w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white">Submit report</button>
          </form>
          <div className="space-y-4">
            {incidents.map((i) => (
              <article key={i.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-semibold">{i.title}</h3>
                <p className="text-sm text-slate-600">{i.description}</p>
                <p className="mt-2 text-xs text-slate-500">{i.disaster_type} · {i.severity} · {i.status} · {i.location}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
