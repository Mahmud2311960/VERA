"use client";

import { useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { NearbyResult } from "@/types";

export default function SearchPage() {
  const [latitude, setLatitude] = useState("23.8103");
  const [longitude, setLongitude] = useState("90.4125");
  const [searchType, setSearchType] = useState("");
  const [results, setResults] = useState<NearbyResult[]>([]);

  async function search() {
    setResults(await api.searchNearby(Number(latitude), Number(longitude), searchType || undefined));
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(String(pos.coords.latitude));
      setLongitude(String(pos.coords.longitude));
    });
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold">Location-Based Search</h1>
        <p className="mt-2 text-slate-600">Find nearby volunteers, hospitals, NGOs, donors, shelters, and resources.</p>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
            <input placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="rounded-lg border px-3 py-2 text-sm sm:col-span-2">
              <option value="">All types</option>
              <option value="volunteer">Volunteers</option>
              <option value="hospital">Hospitals</option>
              <option value="ngo">NGOs</option>
              <option value="donor">Donors</option>
              <option value="shelter">Shelters</option>
              <option value="resource">Resources</option>
              <option value="emergency">Emergencies</option>
            </select>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={search} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Search</button>
            <button type="button" onClick={useMyLocation} className="rounded-lg border px-4 py-2 text-sm">Use my location</button>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {results.map((r) => (
            <div key={`${r.type}-${r.id}`} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{r.name}</h3>
                  <p className="text-sm text-slate-600">{r.type} {r.role ? `· ${r.role}` : ""} · {r.location}</p>
                </div>
                {r.distance_km != null && <span className="text-sm font-medium text-red-600">{r.distance_km} km</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
