"use client";

import { FormEvent, useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { Shelter, User } from "@/types";

export default function SheltersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [form, setForm] = useState({ name: "", address: "", capacity: "50", available_beds: "20", contact_phone: "" });

  useEffect(() => {
    api.me().then(setUser);
    api.listShelters().then(setShelters);
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const created = await api.createShelter({
      ...form,
      capacity: Number(form.capacity),
      available_beds: Number(form.available_beds),
    });
    setShelters((prev) => [created, ...prev]);
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Shelter Management</h1>
        {(user?.role === "ngo" || user?.role === "admin") && (
          <form onSubmit={submit} className="mt-6 max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Add shelter</h2>
            <div className="mt-4 space-y-3">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <input required placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <input required placeholder="Contact phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
                <input required type="number" placeholder="Available beds" value={form.available_beds} onChange={(e) => setForm({ ...form, available_beds: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>
            <button type="submit" className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Save shelter</button>
          </form>
        )}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {shelters.map((s) => (
            <div key={s.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-slate-600">{s.address}</p>
              <p className="mt-2 text-sm">{s.available_beds} / {s.capacity} beds available</p>
              <p className="text-sm text-slate-500">{s.contact_phone}</p>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
