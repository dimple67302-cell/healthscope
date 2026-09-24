"use client";

import { Facility, HospitalType } from "@/types";

const DISEASES = [
  "Cardiology",
  "Cancer",
  "Orthopedics",
  "Neurology",
  "General Medicine",
  "Pediatrics",
  "Dermatology",
  "Gynecology",
  "ENT",
];

const BUDGET_OPTIONS = [
  { label: "Any budget", value: "" },
  { label: "Under ₹10,000", value: "10000" },
  { label: "₹10,000–₹25,000", value: "25000" },
  { label: "₹25,000–₹50,000", value: "50000" },
  { label: "₹50,000+", value: "1000000" },
];

const DISTANCE_OPTIONS = [
  { label: "Any distance", value: "" },
  { label: "Within 5 km", value: "5" },
  { label: "Within 10 km", value: "10" },
  { label: "Within 25 km", value: "25" },
];

const HOSPITAL_TYPES: HospitalType[] = ["Government", "Private", "Multi-Specialty", "Specialty"];

const FACILITIES: Facility[] = [
  "ICU",
  "Emergency",
  "Pharmacy",
  "Diagnostic Lab",
  "Ambulance",
  "Blood Bank",
];

export interface FilterState {
  disease: string;
  budget: string;
  distance: string;
  hospitalType: string;
  facilities: Facility[];
  minRating: string;
}

export const EMPTY_FILTERS: FilterState = {
  disease: "",
  budget: "",
  distance: "",
  hospitalType: "",
  facilities: [],
  minRating: "",
};

export default function FilterSidebar({
  filters,
  onChange,
  onClear,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onClear: () => void;
}) {
  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  function toggleFacility(f: Facility) {
    const has = filters.facilities.includes(f);
    set(
      "facilities",
      has ? filters.facilities.filter((x) => x !== f) : [...filters.facilities, f]
    );
  }

  return (
    <aside className="h-fit rounded-2xl border border-brand-100 bg-white p-5 card-shadow">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-brand-700">Filters</h2>
        <button onClick={onClear} className="text-xs font-semibold text-brand-600 hover:underline">
          Clear Filters
        </button>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-brand-700">
          Disease / Specialization
        </label>
        <select
          value={filters.disease}
          onChange={(e) => set("disease", e.target.value)}
          className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm"
        >
          <option value="">Any</option>
          {DISEASES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-brand-700">Budget</label>
        <select
          value={filters.budget}
          onChange={(e) => set("budget", e.target.value)}
          className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm"
        >
          {BUDGET_OPTIONS.map((b) => (
            <option key={b.label} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-brand-700">Distance</label>
        <select
          value={filters.distance}
          onChange={(e) => set("distance", e.target.value)}
          className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm"
        >
          {DISTANCE_OPTIONS.map((d) => (
            <option key={d.label} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-brand-700">Hospital Type</label>
        <select
          value={filters.hospitalType}
          onChange={(e) => set("hospitalType", e.target.value)}
          className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm"
        >
          <option value="">Any</option>
          {HOSPITAL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-brand-700">Facilities</label>
        <div className="space-y-1.5">
          {FACILITIES.map((f) => (
            <label key={f} className="flex items-center gap-2 text-sm text-brand-700/90">
              <input
                type="checkbox"
                checked={filters.facilities.includes(f)}
                onChange={() => toggleFacility(f)}
                className="h-4 w-4 accent-brand-500"
              />
              {f}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-brand-700">Minimum Rating</label>
        <select
          value={filters.minRating}
          onChange={(e) => set("minRating", e.target.value)}
          className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm"
        >
          <option value="">Any</option>
          <option value="3">3+</option>
          <option value="3.5">3.5+</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
        </select>
      </div>
    </aside>
  );
}
