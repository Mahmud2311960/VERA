"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import type { DashboardStats, User } from "@/types";

const featureLinks = [
  { href: "/emergencies", title: "Emergency Requests", desc: "Submit and track urgent assistance requests." },
  { href: "/blood", title: "Blood Requests", desc: "Create blood requests and find matching donors." },
  { href: "/incidents", title: "Incident Reporting", desc: "Report disaster-related emergency information." },
  { href: "/shelters", title: "Shelter Management", desc: "View and manage available emergency shelters." },
  { href: "/donations", title: "Donations & Campaigns", desc: "Donate resources and run fundraising campaigns." },
  { href: "/resources", title: "Resources & NGO Coordination", desc: "Track relief supplies and request NGO support." },
  { href: "/volunteers", title: "Volunteers & Certificates", desc: "Verification, opportunities, and certificates." },
  { href: "/coverage", title: "Disaster Coverage", desc: "Monitor underserved areas and relief coverage." },
  { href: "/search", title: "Location Search", desc: "Find nearby volunteers, hospitals, shelters, and resources." },
  { href: "/notifications", title: "Notifications", desc: "View alerts for blood requests and relief updates." },
  { href: "/admin", title: "Admin Reports", desc: "Operational and statistical reports." },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    Promise.all([api.me(), api.dashboardStats()]).then(([profile, dashboardStats]) => {
      setUser(profile);
      setStats(dashboardStats);
    });
  }, []);

  return (
    <AuthGuard>
      {!user || !stats ? (
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">Loading dashboard...</div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Welcome, {user.full_name}. Signed in as {user.role}.
              {user.is_verified ? " · Verified" : ""}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Open emergencies" value={stats.open_emergencies} />
            <StatCard label="Open blood requests" value={stats.open_blood_requests} accent="bg-orange-50 text-orange-700" />
            <StatCard label="Verified volunteers" value={stats.verified_volunteers} accent="bg-emerald-50 text-emerald-700" />
            <StatCard label="Active campaigns" value={stats.active_campaigns} accent="bg-blue-50 text-blue-700" />
            <StatCard label="Open shelters" value={stats.open_shelters} accent="bg-slate-100 text-slate-800" />
            <StatCard label="Underserved areas" value={stats.underserved_areas} accent="bg-red-50 text-red-700" />
            <StatCard label="Total users" value={stats.total_users} accent="bg-slate-100 text-slate-800" />
            <StatCard label="Unread alerts" value={stats.unread_notifications} accent="bg-yellow-50 text-yellow-700" />
          </div>

          <h2 className="mt-10 text-xl font-bold text-slate-900">Platform features</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-red-200 hover:shadow-md"
              >
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
