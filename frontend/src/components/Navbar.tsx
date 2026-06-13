"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import type { User } from "@/types";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/emergencies", label: "Emergencies" },
  { href: "/blood", label: "Blood" },
  { href: "/incidents", label: "Incidents" },
  { href: "/shelters", label: "Shelters" },
  { href: "/donations", label: "Donations" },
  { href: "/resources", label: "Resources" },
  { href: "/volunteers", label: "Volunteers" },
  { href: "/coverage", label: "Coverage" },
  { href: "/search", label: "Search" },
  { href: "/notifications", label: "Alerts" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!getToken()) return;
    api.me().then(setUser).catch(() => clearToken());
  }, [pathname]);

  function handleLogout() {
    api.logout();
    setUser(null);
    router.push("/login");
  }

  return (
    <header className="border-b border-red-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white">
            V
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">VERA</p>
            <p className="hidden text-xs text-slate-500 sm:block">Emergency Response Alliance</p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center gap-4 overflow-x-auto lg:flex">
          {user &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-sm font-medium ${
                  pathname === link.href ? "text-red-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-600 md:inline">
                {user.full_name} · {user.role}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Login
              </Link>
              <Link href="/register" className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
