"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { api, ApiError } from "@/lib/api";
import type { BloodGroup, UserRole } from "@/types";

const roles: { value: UserRole; label: string }[] = [
  { value: "citizen", label: "Citizen" },
  { value: "volunteer", label: "Volunteer" },
  { value: "donor", label: "Blood Donor" },
  { value: "ngo", label: "NGO" },
  { value: "hospital", label: "Hospital / Blood Bank" },
];

const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "citizen" as UserRole,
    organization_name: "",
    address: "",
    blood_group: "" as BloodGroup | "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role: form.role,
        organization_name: form.organization_name || undefined,
        address: form.address || undefined,
        blood_group: form.blood_group || undefined,
      });
      await api.login(form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create your VERA account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Join as a citizen, volunteer, donor, NGO, or hospital partner.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Full name
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Role
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          {(form.role === "ngo" || form.role === "hospital") && (
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Organization name
              <input
                value={form.organization_name}
                onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          )}

          {form.role === "donor" && (
            <label className="block text-sm font-medium text-slate-700">
              Blood group
              <select
                required
                value={form.blood_group}
                onChange={(e) =>
                  setForm({ ...form, blood_group: e.target.value as BloodGroup })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">Select blood group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Address
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 md:col-span-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 md:col-span-2"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-red-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
