"use client";

import { useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api, ApiError } from "@/lib/api";
import type { AdminReport } from "@/types";

export default function AdminPage() {
  const [report, setReport] = useState<AdminReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.adminReport().then(setReport).catch((err) => {
      setError(err instanceof ApiError ? err.message : "Access denied");
    });
  }, []);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold">Admin Reports</h1>
        {error && <p className="mt-4 text-sm text-red-600">{error} — admin role required.</p>}
        {report && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total donations</p><p className="text-2xl font-bold">{report.total_donations}</p></div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total raised</p><p className="text-2xl font-bold">৳{report.total_raised.toLocaleString()}</p></div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Active opportunities</p><p className="text-2xl font-bold">{report.active_opportunities}</p></div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Open incidents</p><p className="text-2xl font-bold">{report.open_incidents}</p></div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Users by role</h2>
              <pre className="mt-3 overflow-auto rounded-lg bg-slate-50 p-4 text-sm">{JSON.stringify(report.users_by_role, null, 2)}</pre>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Emergencies by status</h2>
              <pre className="mt-3 overflow-auto rounded-lg bg-slate-50 p-4 text-sm">{JSON.stringify(report.emergencies_by_status, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
