"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/admin/contacts"
              className="text-lg font-semibold text-slate-800 dark:text-slate-100"
            >
              Dietl Housing
            </Link>
            <Link
              href="/admin/contacts"
              className={`text-sm font-medium transition-colors ${
                pathname === "/admin/contacts"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Contacts
            </Link>
            <a
              href="https://supabase.com/dashboard/project/uhgwmomyrpzlytdfkmht/editor/17544"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Supabase editor
            </a>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
