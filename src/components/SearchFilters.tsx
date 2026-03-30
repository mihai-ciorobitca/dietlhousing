"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type SearchBy = "email" | "name" | "phone";

type Props = {
  search: string;
  searchBy: SearchBy;
  callStatus: string;
  interested: string;
  meetingType: string;
  preferedContact: string;
  callStatuses: string[];
  meetingTypes: string[];
  interestedOptions: string[];
  preferedContactOptions: string[];
};

export default function SearchFilters({
  search,
  searchBy,
  callStatus,
  interested,
  meetingType,
  preferedContact,
  callStatuses,
  meetingTypes,
  interestedOptions,
  preferedContactOptions,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      router.push(`/admin/contacts?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const searchInput = form.search as HTMLInputElement;
          updateParams({ search: searchInput.value || null });
        }}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Search
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <select
                value={searchBy}
                onChange={(e) => {
                  const v = e.target.value as SearchBy;
                  updateParams({
                    search_by: v === "email" ? null : v,
                  });
                }}
                aria-label="Field to search"
                className="w-full sm:w-[8.5rem] shrink-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="email">Email</option>
                <option value="name">Name</option>
                <option value="phone">Phone</option>
              </select>
              <div className="flex flex-1 gap-2 min-w-0">
                <input
                  name="search"
                  type="text"
                  defaultValue={search}
                  placeholder={
                    searchBy === "email"
                      ? "Search email…"
                      : searchBy === "name"
                        ? "Search first or last name…"
                        : "Search phone number…"
                  }
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Call Status
            </label>
            <select
              value={callStatus}
              onChange={(e) =>
                updateParams({ call_status: e.target.value || null })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {callStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Interested
            </label>
            <select
              value={interested}
              onChange={(e) =>
                updateParams({
                  interested: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {interestedOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Meeting Type
            </label>
            <select
              value={meetingType}
              onChange={(e) =>
                updateParams({ call_meeting_type: e.target.value || null })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {meetingTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Preferred contact
            </label>
            <select
              value={preferedContact}
              onChange={(e) =>
                updateParams({ prefered_contact: e.target.value || null })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {preferedContactOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(search ||
          callStatus ||
          interested ||
          meetingType ||
          preferedContact ||
          searchBy !== "email") && (
          <button
            type="button"
            onClick={() => router.push("/admin/contacts")}
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Clear filters
          </button>
        )}
      </form>
    </div>
  );
}
