"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HospitalCard from "@/components/HospitalCard";
import FilterSidebar, { EMPTY_FILTERS, FilterState } from "@/components/FilterSidebar";
import { MatchedHospital } from "@/types";

type SortOption = "recommended" | "nearest" | "lowest-cost" | "highest-rating";

export default function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = searchParams.get("location") ?? "";

  const [filters, setFilters] = useState<FilterState>({
    ...EMPTY_FILTERS,
    disease: searchParams.get("disease") ?? "",
  });
  const [sort, setSort] = useState<SortOption>("recommended");
  const [results, setResults] = useState<MatchedHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (filters.disease) params.set("disease", filters.disease);
    if (filters.budget) params.set("budget", filters.budget);
    if (filters.distance) params.set("distance", filters.distance);
    if (filters.hospitalType) params.set("hospitalType", filters.hospitalType);
    if (filters.facilities.length) params.set("facilities", filters.facilities.join(","));
    if (filters.minRating) params.set("minRating", filters.minRating);
    params.set("sort", sort);
    return params.toString();
  }, [location, filters, sort]);

  const fetchResults = useCallback(async () => {
    if (!location) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/hospitals?${queryString}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong.");
        setResults([]);
      } else {
        setResults(data.results ?? []);
      }
    } catch (err) {
      console.error(err);
      setError("Couldn't reach the server. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [location, queryString]);

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchResults]);

  // budget select from home page passes an exact number; the sidebar uses
  // bucketed values — this keeps the initial load from home in sync once.
  useEffect(() => {
    const initialBudget = searchParams.get("budget");
    if (initialBudget) {
      setFilters((f) => (f.budget ? f : { ...f, budget: initialBudget }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClear() {
    setFilters(EMPTY_FILTERS);
    setSort("recommended");
  }

  if (!location) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-700">No location selected</h1>
        <p className="mt-2 text-brand-700/70">
          Go back to the home page and enter a location to see hospitals.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-lg bg-brand-500 px-5 py-2.5 font-semibold text-white hover:bg-brand-600"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-brand-700/60">Hospitals in</p>
          <h1 className="text-2xl font-extrabold text-brand-700">{location}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-brand-700">
            {loading ? "Searching…" : `${results.length} hospitals found`}
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
          >
            <option value="recommended">Recommended</option>
            <option value="nearest">Nearest</option>
            <option value="lowest-cost">Lowest Cost</option>
            <option value="highest-rating">Highest Rating</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <FilterSidebar filters={filters} onChange={setFilters} onClear={handleClear} />

        <div>
          {error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {error}
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-2xl border border-brand-100 bg-white"
                />
              ))}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="rounded-xl border border-brand-100 bg-white p-8 text-center text-brand-700/70">
              No hospitals match these filters. Try clearing some filters.
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {results.map((h) => (
                <HospitalCard key={h.id} hospital={h} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
