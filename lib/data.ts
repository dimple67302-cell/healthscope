import { Hospital, HospitalType, Facility } from "@/types";

// ---------------------------------------------------------------------------
// DEMO DATA NOTICE
// This is a structured demo/mock dataset used because no external hospital
// or geocoding API key is configured. Every record below is clearly marked
// verified: false / dataSource: "Demo Dataset" so the UI can distinguish it
// from real verified data. Swap this file for a real API/database call
// (see /api/hospitals/route.ts) if you connect a live data source.
// ---------------------------------------------------------------------------

export const SUPPORTED_CITIES = [
  "Delhi",
  "Amritsar",
  "Chandigarh",
  "Jalandhar",
  "Ludhiana",
  "Hoshiarpur",
] as const;

export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

// Approximate city-center coordinates, used as the search origin for
// distance calculations since the demo dataset works off city names.
export const CITY_CENTERS: Record<SupportedCity, { lat: number; lng: number }> = {
  Delhi: { lat: 28.6139, lng: 77.209 },
  Amritsar: { lat: 31.634, lng: 74.8723 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Jalandhar: { lat: 31.326, lng: 75.5762 },
  Ludhiana: { lat: 30.901, lng: 75.8573 },
  Hoshiarpur: { lat: 31.532, lng: 75.9142 },
};

const ALL_FACILITIES: Facility[] = [
  "ICU",
  "Emergency",
  "Pharmacy",
  "Diagnostic Lab",
  "Ambulance",
  "Blood Bank",
];

const SPECIALIZATION_POOL = [
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

const TYPE_CYCLE: HospitalType[] = ["Government", "Private", "Multi-Specialty", "Specialty"];

// Small deterministic offsets (in degrees, roughly 1-6 km) so each hospital
// in a city has a distinct, stable location instead of random jitter.
const OFFSETS: Array<[number, number]> = [
  [0.01, 0.015],
  [-0.02, 0.008],
  [0.03, -0.02],
  [-0.015, -0.03],
  [0.045, 0.01],
];

function pick<T>(arr: T[], n: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[(n + i) % arr.length]);
  return out;
}

function buildHospitalsForCity(city: SupportedCity, cityIndex: number): Hospital[] {
  const center = CITY_CENTERS[city];
  const names = [
    `${city} City Hospital`,
    `${city} Multispecialty Medical Center`,
    `${city} Care & Cure Hospital`,
    `${city} Government General Hospital`,
    `${city} Lifeline Speciality Hospital`,
  ];

  return names.map((name, i) => {
    const id = `${city.toLowerCase()}-${i + 1}`;
    const [dLat, dLng] = OFFSETS[i % OFFSETS.length];
    const hospitalType = TYPE_CYCLE[(cityIndex + i) % TYPE_CYCLE.length];
    const specCount = 2 + ((cityIndex + i) % 3); // 2-4 specializations
    const specializations = pick(SPECIALIZATION_POOL, specCount).map(
      (s, idx) => SPECIALIZATION_POOL[(cityIndex + i + idx) % SPECIALIZATION_POOL.length]
    );
    const uniqueSpecs = Array.from(new Set(specializations));

    const baseCost = 8000 + ((cityIndex * 5 + i * 3) % 6) * 7000; // spread of costs
    const treatments = uniqueSpecs.map((disease, idx) => ({
      disease,
      estimatedCost: baseCost + idx * 4500 + (hospitalType === "Government" ? -4000 : 0),
    }));

    const facilityCount = 3 + ((cityIndex + i) % 4); // 3-6 facilities
    const facilities = pick(ALL_FACILITIES, facilityCount) as Facility[];
    const uniqueFacilities = Array.from(new Set(facilities));

    const rating = Math.round((3 + ((cityIndex + i * 2) % 20) / 10) * 10) / 10; // 3.0 - 4.9

    const doctors = uniqueSpecs.slice(0, 2).map((spec, idx) => ({
      name: `Dr. ${["A. Sharma", "R. Kaur", "S. Mehta", "N. Gill", "P. Verma"][(cityIndex + i + idx) % 5]}`,
      specialization: spec,
      experienceYears: 5 + ((cityIndex + i + idx * 3) % 20),
    }));

    return {
      id,
      name,
      location: city,
      address: `${20 + i * 7}, Sector ${5 + i}, ${city}`,
      latitude: center.lat + dLat,
      longitude: center.lng + dLng,
      hospitalType,
      specializations: uniqueSpecs,
      treatments,
      facilities: uniqueFacilities,
      doctors,
      rating,
      verified: (cityIndex + i) % 3 !== 0, // mix of verified / unverified demo flags
      dataSource: "Demo Dataset",
      lastVerified: "2026-08-01",
      patientStatsAvailable: false,
      patientStatsNote:
        "Success/outcome statistics are not available for demo hospitals. Real statistics would only be shown when sourced from a verified medical registry.",
    } satisfies Hospital;
  });
}

export const HOSPITALS: Hospital[] = SUPPORTED_CITIES.flatMap((city, idx) =>
  buildHospitalsForCity(city, idx)
);

export function getHospitalById(id: string): Hospital | undefined {
  return HOSPITALS.find((h) => h.id === id);
}
