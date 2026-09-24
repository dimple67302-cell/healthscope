"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_CITIES } from "@/lib/data";

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

export default function HomePage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [disease, setDisease] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  console.log(location);
  
  const suggestions = useMemo(() => {
    
    if (!location.trim()) return SUPPORTED_CITIES;
    return SUPPORTED_CITIES.filter((c) =>
      c.toLowerCase().startsWith(location.trim().toLowerCase())
    );
  }, [location]);

  function handleFindHospitals() {
    const trimmed = location.trim();
    const match = SUPPORTED_CITIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());

    if (!trimmed) {
      setError("Please enter a location to continue.");
      return;
    }
    if (!match) {
      setError(
        `We only have demo data for: ${SUPPORTED_CITIES.join(", ")}. Try one of these.`
      );
      return;
    }

    setError("");
    const params = new URLSearchParams();
    params.set("location", match);
    if (disease) params.set("disease", disease);
    if (budget) params.set("budget", budget);
    router.push(`/results?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="text-center">
        <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          Hackathon demo — structured mock data
        </span>
        <h1 className="mt-4 text-4xl font-extrabold text-brand-700">HealthScope</h1>
        <p className="mt-2 text-brand-700/70">
          Find and compare hospitals by location, condition, budget and facilities —
          transparently, with no fake medical claims.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-brand-100 bg-white p-6 card-shadow">
        <div className="relative">
          <label className="mb-1 block text-sm font-semibold text-brand-700">Location</label>
          <input
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="e.g. Amritsar"
            className="w-full rounded-lg border border-brand-100 px-4 py-2.5 outline-none focus:border-brand-400"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-brand-100 bg-white shadow-lg">
              {suggestions.map((c) => (
                
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocation(c);
                      setShowSuggestions(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-brand-50"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-700">
              Disease / Specialization (optional)
            </label>
            <select
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              className="w-full rounded-lg border border-brand-100 px-4 py-2.5 outline-none focus:border-brand-400"
            >
              <option value="">Any</option>
              {DISEASES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-700">
              Max Budget in ₹ (optional)
            </label>
            <input
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full rounded-lg border border-brand-100 px-4 py-2.5 outline-none focus:border-brand-400"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        <button
          onClick={handleFindHospitals}
          className="mt-6 w-full rounded-lg bg-brand-500 py-3 font-semibold text-white transition hover:bg-brand-600"
        >
          Find Hospitals 
        </button>

        <p className="mt-3 text-center text-xs text-brand-700/60">
          Demo cities available: {SUPPORTED_CITIES.join(", ")}
        </p>
      </div>
    </div>
  );
}
