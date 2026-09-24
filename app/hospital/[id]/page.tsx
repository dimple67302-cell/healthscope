import { notFound } from "next/navigation";
import Link from "next/link";
import { getHospitalById, CITY_CENTERS, SupportedCity } from "@/lib/data";
import { haversineDistanceKm } from "@/lib/matching";

export default function HospitalDetailsPage({ params }: { params: { id: string } }) {
  const hospital = getHospitalById(params.id);
  if (!hospital) return notFound();

  const center = CITY_CENTERS[hospital.location as SupportedCity];
  const distanceKm = center
    ? haversineDistanceKm(center.lat, center.lng, hospital.latitude, hospital.longitude)
    : 0;

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    hospital.longitude - 0.02
  }%2C${hospital.latitude - 0.02}%2C${hospital.longitude + 0.02}%2C${
    hospital.latitude + 0.02
  }&layer=mapnik&marker=${hospital.latitude}%2C${hospital.longitude}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/results" className="text-sm font-semibold text-brand-600 hover:underline">
        ← Back to results
      </Link>

      <div className="mt-4 rounded-2xl border border-brand-100 bg-white p-6 card-shadow">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-700">{hospital.name}</h1>
            <p className="mt-1 text-brand-700/70">{hospital.address}</p>
          </div>
          <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              hospital.verified ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {hospital.verified ? "Verified Data" : "Demo/Mock Data"}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-700/80">
          <span className="rounded-full bg-gray-100 px-2.5 py-1">{hospital.hospitalType}</span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1">{distanceKm} km from city center</span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1">⭐ {hospital.rating}/5</span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1">
            Source: {hospital.dataSource}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1">
            Last verified: {hospital.lastVerified}
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-brand-100">
          <iframe
            title="Hospital location map"
            src={mapEmbedUrl}
            className="h-64 w-full"
            loading="lazy"
          />
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Get Directions
        </a>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-brand-700">Specializations</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {hospital.specializations.map((s) => (
              <span key={s} className="rounded-md bg-brand-50 px-3 py-1 text-sm text-brand-700">
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-brand-700">Estimated Treatment Costs</h2>
          <div className="mt-2 overflow-hidden rounded-xl border border-brand-100">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-left text-brand-700">
                <tr>
                  <th className="px-4 py-2">Disease</th>
                  <th className="px-4 py-2">Estimated Cost</th>
                </tr>
              </thead>
              <tbody>
                {hospital.treatments.map((t) => (
                  <tr key={t.disease} className="border-t border-brand-100">
                    <td className="px-4 py-2">{t.disease}</td>
                    <td className="px-4 py-2">₹{t.estimatedCost.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-brand-700/60">
            Estimates only, from the demo dataset. Actual costs vary by case, diagnostics and
            length of stay.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-brand-700">Facilities</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {hospital.facilities.map((f) => (
              <span key={f} className="rounded-md bg-gray-100 px-3 py-1 text-sm text-brand-700/90">
                {f}
              </span>
            ))}
          </div>
        </section>

        {hospital.doctors.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-brand-700">Doctors / Specialists</h2>
            <ul className="mt-2 space-y-2">
              {hospital.doctors.map((d) => (
                <li
                  key={d.name}
                  className="rounded-lg border border-brand-100 px-4 py-2 text-sm text-brand-700/90"
                >
                  {d.name} — {d.specialization}, {d.experienceYears} yrs experience
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-bold text-brand-700">Patient / Outcome Statistics</h2>
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {hospital.patientStatsAvailable
              ? "Statistics available — see verified source."
              : hospital.patientStatsNote ??
                "No verified success/outcome statistics are available for this hospital."}
          </div>
        </section>
      </div>
    </div>
  );
}
