"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const SEARCH_DEBOUNCE_MS = 300;

type SearchBy = "email" | "phone_number" | "whatsapp_number";

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
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [searchInput, setSearchInput] = useState(search);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    router.push(`/admin/contacts?${params.toString()}`);
  }, [router]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
          <div className="min-w-0 lg:col-span-2">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Search
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch min-w-0">
              <select
                value={searchBy}
                onChange={(e) => {
                  const v = e.target.value as SearchBy;
                  updateParams({
                    search_by: v === "email" ? null : v,
                  });
                }}
                aria-label="Field to search"
                className="w-fit max-w-full shrink-0 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
              >
                <option value="email">email</option>
                <option value="phone_number">phone_number</option>
                <option value="whatsapp_number">whatsapp_number</option>
              </select>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchInput(v);
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  searchDebounceRef.current = setTimeout(() => {
                    updateParams({ search: v.trim() || null });
                  }, SEARCH_DEBOUNCE_MS);
                }}
                autoComplete="off"
                placeholder={
                  searchBy === "email"
                    ? "Search email…"
                    : searchBy === "phone_number"
                      ? "Search phone_number…"
                      : "Search whatsapp_number…"
                }
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Call Status
            </label>
            <select
              value={callStatus}
              onChange={(e) =>
                updateParams({ call_status: e.target.value || null })
              }
              className="w-full min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
            >
              <option value="">All</option>
              {callStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
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
              className="w-full min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
            >
              <option value="">All</option>
              {interestedOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Meeting Type
            </label>
            <select
              value={meetingType}
              onChange={(e) =>
                updateParams({ call_meeting_type: e.target.value || null })
              }
              className="w-full min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
            >
              <option value="">All</option>
              {meetingTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Preferred contact
            </label>
            <select
              value={preferedContact}
              onChange={(e) =>
                updateParams({ prefered_contact: e.target.value || null })
              }
              className="w-full min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
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
      </div>
    </div>
  );
}
