import {
  Hospital,
  HospitalFilters,
  HospitalWithDistance,
  MatchedHospital,
  Facility,
} from "@/types";
import { CITY_CENTERS, HOSPITALS, SupportedCity, SUPPORTED_CITIES } from "@/lib/data";

export function isSupportedCity(value: string): value is SupportedCity {
  return (SUPPORTED_CITIES as readonly string[]).includes(value);
}

export function normalizeCity(input: string): SupportedCity | null {
  const trimmed = input.trim().toLowerCase();
  const found = SUPPORTED_CITIES.find((c) => c.toLowerCase() === trimmed);
  return found ?? null;
}

// Haversine formula: great-circle distance between two lat/lng points, in km.
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function cheapestCostFor(hospital: Hospital, disease?: string): number | null {
  const relevant = disease
    ? hospital.treatments.filter(
        (t) => t.disease.toLowerCase() === disease.toLowerCase()
      )
    : hospital.treatments;
  if (relevant.length === 0) return null;
  return Math.min(...relevant.map((t) => t.estimatedCost));
}

/**
 * Core query function used by /api/hospitals AND /api/chat so both stay
 * consistent and never diverge in what counts as a "match".
 */
export function queryHospitals(filters: HospitalFilters): {
  city: SupportedCity | null;
  results: MatchedHospital[];
} {
  const city = filters.location ? normalizeCity(filters.location) : null;

  let pool: Hospital[] = HOSPITALS;
  if (city) {
    pool = HOSPITALS.filter((h) => h.location === city);
  }

  const center = city ? CITY_CENTERS[city] : null;

  let withDistance: HospitalWithDistance[] = pool.map((h) => ({
    ...h,
    distanceKm: center
      ? haversineDistanceKm(center.lat, center.lng, h.latitude, h.longitude)
      : 0,
  }));

  if (filters.disease) {
    const disease = filters.disease.toLowerCase();
    withDistance = withDistance.filter((h) =>
      h.specializations.some((s) => s.toLowerCase() === disease)
    );
  }

  if (typeof filters.budget === "number" && !Number.isNaN(filters.budget)) {
    withDistance = withDistance.filter((h) => {
      const cost = cheapestCostFor(h, filters.disease);
      if (cost === null) return true; // no treatment-cost data to compare against
      return cost <= (filters.budget as number);
    });
  }

  if (typeof filters.maxDistance === "number" && !Number.isNaN(filters.maxDistance)) {
    withDistance = withDistance.filter((h) => h.distanceKm <= (filters.maxDistance as number));
  }

  if (filters.hospitalType) {
    withDistance = withDistance.filter((h) => h.hospitalType === filters.hospitalType);
  }

  if (filters.facilities && filters.facilities.length > 0) {
    const required = filters.facilities as Facility[];
    withDistance = withDistance.filter((h) =>
      required.every((f) => h.facilities.includes(f))
    );
  }

  if (typeof filters.minRating === "number" && !Number.isNaN(filters.minRating)) {
    withDistance = withDistance.filter((h) => h.rating >= (filters.minRating as number));
  }

  const matched: MatchedHospital[] = withDistance.map((h) => scoreHospital(h, filters));

  const sort = filters.sort ?? "recommended";
  matched.sort((a, b) => {
    switch (sort) {
      case "nearest":
        return a.distanceKm - b.distanceKm;
      case "lowest-cost": {
        const ac = cheapestCostFor(a, filters.disease) ?? Infinity;
        const bc = cheapestCostFor(b, filters.disease) ?? Infinity;
        return ac - bc;
      }
      case "highest-rating":
        return b.rating - a.rating;
      case "recommended":
      default:
        return b.matchScore - a.matchScore;
    }
  });

  return { city, results: matched };
}

/**
 * Transparent, explainable scoring — never a "medically best" claim, just a
 * weighted match against the filters the user actually chose.
 */
function scoreHospital(h: HospitalWithDistance, filters: HospitalFilters): MatchedHospital {
  let score = 50; // baseline
  const reasons: string[] = [];

  if (filters.disease) {
    const has = h.specializations.some(
      (s) => s.toLowerCase() === filters.disease!.toLowerCase()
    );
    if (has) {
      score += 20;
      reasons.push(`${filters.disease} available`);
    }
  }

  if (typeof filters.budget === "number") {
    const cost = cheapestCostFor(h, filters.disease);
    if (cost !== null && cost <= filters.budget) {
      score += 15;
      reasons.push(`Within selected budget (est. ₹${cost.toLocaleString("en-IN")})`);
    }
  }

  if (h.distanceKm > 0) {
    if (h.distanceKm <= 10) {
      score += 10;
      reasons.push(`${h.distanceKm} km away`);
    } else {
      reasons.push(`${h.distanceKm} km away`);
    }
  }

  if (h.rating >= 4) {
    score += 10;
    reasons.push(`Rated ${h.rating}/5`);
  }

  if (h.facilities.includes("ICU")) {
    reasons.push("ICU available");
  }
  if (h.facilities.includes("Emergency")) {
    reasons.push("24x7 Emergency available");
  }

  if (h.verified) {
    score += 5;
    reasons.push("Verified data");
  } else {
    reasons.push("Demo data — not independently verified");
  }

  return {
    ...h,
    matchScore: Math.max(0, Math.min(100, score)),
    matchReasons: reasons,
  };
}

export function matchLabel(score: number): string {
  if (score >= 80) return "Highly Matched";
  if (score >= 60) return "Good Match";
  return "Partial Match";
}
