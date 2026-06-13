"use client";

import { useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    api.listNotifications().then(setNotifications);
  }, []);

  async function markRead(id: number) {
    const updated = await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="mt-2 text-slate-600">Alerts for blood requests, verification updates, and relief coordination.</p>
        <div className="mt-8 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-slate-500">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`rounded-2xl border p-5 shadow-sm ${n.is_read ? "bg-white" : "border-red-200 bg-red-50/40"}`}>
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{n.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                    <p className="mt-2 text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.is_read && (
                    <button type="button" onClick={() => markRead(n.id)} className="h-fit rounded-lg border px-3 py-1 text-xs">Mark read</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
