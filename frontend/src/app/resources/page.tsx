"use client";

import { FormEvent, useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { Coordination, Resource, User } from "@/types";

export default function ResourcesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [coordination, setCoordination] = useState<Coordination[]>([]);
  const [resourceForm, setResourceForm] = useState({ name: "", resource_type: "food", quantity: "10", location: "" });
  const [coordForm, setCoordForm] = useState({ title: "", message: "", volunteers_needed: "5", location: "" });

  useEffect(() => {
    api.me().then(setUser);
    api.listResources().then(setResources);
    api.listCoordination().then(setCoordination);
  }, []);

  async function submitResource(e: FormEvent) {
    e.preventDefault();
    const created = await api.createResource({ ...resourceForm, quantity: Number(resourceForm.quantity) });
    setResources((prev) => [created, ...prev]);
  }

  async function submitCoordination(e: FormEvent) {
    e.preventDefault();
    const created = await api.createCoordination({ ...coordForm, volunteers_needed: Number(coordForm.volunteers_needed) });
    setCoordination((prev) => [created, ...prev]);
  }

  const canManage = user && ["ngo", "hospital", "admin"].includes(user.role);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <h1 className="text-3xl font-bold">Resources & NGO Coordination</h1>

        {canManage && (
          <div className="grid gap-8 lg:grid-cols-2">
            <form onSubmit={submitResource} className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold">Track resource</h2>
              <div className="mt-4 space-y-3">
                <input required placeholder="Resource name" value={resourceForm.name} onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                <select value={resourceForm.resource_type} onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
                  <option value="food">Food</option><option value="medicine">Medicine</option><option value="clothing">Clothing</option><option value="equipment">Equipment</option>
                </select>
                <input required type="number" placeholder="Quantity" value={resourceForm.quantity} onChange={(e) => setResourceForm({ ...resourceForm, quantity: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Add resource</button>
            </form>

            <form onSubmit={submitCoordination} className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold">Request NGO support</h2>
              <div className="mt-4 space-y-3">
                <input required placeholder="Title" value={coordForm.title} onChange={(e) => setCoordForm({ ...coordForm, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                <textarea required placeholder="Message" value={coordForm.message} onChange={(e) => setCoordForm({ ...coordForm, message: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                <input type="number" placeholder="Volunteers needed" value={coordForm.volunteers_needed} onChange={(e) => setCoordForm({ ...coordForm, volunteers_needed: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Send request</button>
            </form>
          </div>
        )}

        <section>
          <h2 className="font-semibold">Available resources</h2>
          <div className="mt-4 space-y-2">
            {resources.map((r) => (
              <div key={r.id} className="rounded-lg border bg-white p-4 text-sm">{r.name} · {r.resource_type} · {r.quantity} {r.unit}</div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold">Coordination requests</h2>
          <div className="mt-4 space-y-2">
            {coordination.map((c) => (
              <div key={c.id} className="rounded-lg border bg-white p-4 text-sm">{c.title} · {c.status} · {c.volunteers_needed} volunteers needed</div>
            ))}
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
