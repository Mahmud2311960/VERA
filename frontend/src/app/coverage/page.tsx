"use client";

import { FormEvent, useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { CoverageArea, CoverageStatus } from "@/types";

const statusColors: Record<CoverageStatus, string> = {
  served: "bg-emerald-50 text-emerald-700",
  partial: "bg-yellow-50 text-yellow-700",
  underserved: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

export default function CoveragePage() {
  const [areas, setAreas] = useState<CoverageArea[]>([]);
  const [form, setForm] = useState({ area_name: "", latitude: "23.8103", longitude: "90.4125", coverage_status: "underserved" as CoverageStatus, notes: "" });

  useEffect(() => {
    api.listCoverage().then(setAreas);
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const created = await api.createCoverage({
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    });
    setAreas((prev) => [created, ...prev]);
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Disaster Coverage Monitoring</h1>
        <p className="mt-2 text-slate-600">Track relief operations and identify underserved disaster areas.</p>

        <form onSubmit={submit} className="mt-6 max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Report area coverage</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input required placeholder="Area name" value={form.area_name} onChange={(e) => setForm({ ...form, area_name: e.target.value })} className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
            <input required placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
            <input required placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
            <select value={form.coverage_status} onChange={(e) => setForm({ ...form, coverage_status: e.target.value as CoverageStatus })} className="rounded-lg border px-3 py-2 text-sm sm:col-span-2">
              <option value="served">Served</option><option value="partial">Partial</option><option value="underserved">Underserved</option><option value="critical">Critical</option>
            </select>
            <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Report coverage</button>
        </form>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <div key={area.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{area.area_name}</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${statusColors[area.coverage_status]}`}>{area.coverage_status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{area.notes || "No notes"}</p>
              <p className="mt-2 text-xs text-slate-500">{area.latitude}, {area.longitude}</p>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
