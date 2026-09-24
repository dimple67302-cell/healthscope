import Link from "next/link";
import { MatchedHospital } from "@/types";
import { matchLabel } from "@/lib/matching";

export default function HospitalCard({ hospital }: { hospital: MatchedHospital }) {
  const cheapest = hospital.treatments.length
    ? Math.min(...hospital.treatments.map((t) => t.estimatedCost))
    : null;

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 card-shadow">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-brand-700">{hospital.name}</h3>
          <p className="text-sm text-brand-700/70">{hospital.address}</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {matchLabel(hospital.matchScore)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-brand-700/80">
        <span className="rounded-full bg-gray-100 px-2.5 py-1">{hospital.hospitalType}</span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1">{hospital.distanceKm} km away</span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1">⭐ {hospital.rating}/5</span>
        {cheapest !== null && (
          <span className="rounded-full bg-gray-100 px-2.5 py-1">
            Est. from ₹{cheapest.toLocaleString("en-IN")}
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-1 ${
            hospital.verified ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {hospital.verified ? "Verified Data" : "Demo/Mock Data"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {hospital.specializations.map((s) => (
          <span key={s} className="rounded-md bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
            {s}
          </span>
        ))}
      </div>

      <ul className="mt-3 space-y-0.5 text-xs text-brand-700/70">
        {hospital.matchReasons.slice(0, 4).map((r) => (
          <li key={r}>✓ {r}</li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/hospital/${hospital.id}`}
          className="flex-1 rounded-lg bg-brand-500 py-2 text-center text-sm font-semibold text-white hover:bg-brand-600"
        >
          View Details
        </Link>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-lg border border-brand-200 py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}
