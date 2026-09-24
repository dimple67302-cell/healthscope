import { HOSPITALS, SUPPORTED_CITIES } from "@/lib/data";
import { queryHospitals } from "@/lib/matching";
import { Facility, Hospital, HospitalFilters } from "@/types";

const DISEASE_KEYWORDS: Record<string, string> = {
  heart: "Cardiology",
  cardiac: "Cardiology",
  cardiology: "Cardiology",
  cancer: "Cancer",
  oncology: "Cancer",
  bone: "Orthopedics",
  orthopedic: "Orthopedics",
  orthopedics: "Orthopedics",
  neuro: "Neurology",
  neurology: "Neurology",
  brain: "Neurology",
  child: "Pediatrics",
  pediatric: "Pediatrics",
  pediatrics: "Pediatrics",
  skin: "Dermatology",
  dermatology: "Dermatology",
  gynecology: "Gynecology",
  gynae: "Gynecology",
  ent: "ENT",
  general: "General Medicine",
};

const FACILITY_KEYWORDS: Record<string, Facility> = {
  icu: "ICU",
  emergency: "Emergency",
  pharmacy: "Pharmacy",
  lab: "Diagnostic Lab",
  diagnostic: "Diagnostic Lab",
  ambulance: "Ambulance",
  "blood bank": "Blood Bank",
  blood: "Blood Bank",
};

interface ParsedIntent {
  city?: string;
  disease?: string;
  budget?: number;
  wantsClosest?: boolean;
  wantsFacilityInfo?: Facility;
  hospitalNameMentioned?: Hospital;
}

function findCityInText(text: string): string | undefined {
  const lower = text.toLowerCase();
  return SUPPORTED_CITIES.find((c) => lower.includes(c.toLowerCase()));
}

function findDiseaseInText(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const [kw, disease] of Object.entries(DISEASE_KEYWORDS)) {
    if (lower.includes(kw)) return disease;
  }
  return undefined;
}

function findBudgetInText(text: string): number | undefined {
  const match = text.replace(/,/g, "").match(/(\d{3,7})/);
  if (!match) return undefined;
  return Number(match[1]);
}

function findFacilityInText(text: string): Facility | undefined {
  const lower = text.toLowerCase();
  for (const [kw, facility] of Object.entries(FACILITY_KEYWORDS)) {
    if (lower.includes(kw)) return facility;
  }
  return undefined;
}

function findHospitalNameInText(text: string, cityHint?: string): Hospital | undefined {
  const lower = text.toLowerCase();
  const pool = cityHint ? HOSPITALS.filter((h) => h.location === cityHint) : HOSPITALS;
  return pool.find((h) => lower.includes(h.name.toLowerCase()));
}

function parseIntent(message: string): ParsedIntent {
  const city = findCityInText(message);
  return {
    city,
    disease: findDiseaseInText(message),
    budget: findBudgetInText(message),
    wantsClosest: /closest|nearest|near me/i.test(message),
    wantsFacilityInfo: findFacilityInText(message),
    hospitalNameMentioned: findHospitalNameInText(message, city),
  };
}

function formatCost(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function summarizeHospitalList(hospitals: { name: string; location: string; distanceKm: number; rating: number }[]): string {
  return hospitals
    .slice(0, 6)
    .map(
      (h, i) =>
        `${i + 1}. ${h.name} — ${h.location}, ${h.distanceKm} km away, rated ${h.rating}/5`
    )
    .join("\n");
}

/**
 * Fully rule-based, grounded answer. Only ever reports facts that exist in
 * the HOSPITALS dataset (via queryHospitals) — never invents names, prices,
 * ratings or facilities.
 */
export function answerFromDataset(message: string, contextCity?: string): string {
  const intent = parseIntent(message);
  const city = intent.city ?? contextCity;

  // 1) "What facilities does Hospital X have?"
  if (intent.hospitalNameMentioned) {
    const h = intent.hospitalNameMentioned;
    return [
      `${h.name} (${h.location}):`,
      `Facilities: ${h.facilities.join(", ")}`,
      `Specializations: ${h.specializations.join(", ")}`,
      `Rating: ${h.rating}/5`,
      `Type: ${h.hospitalType}`,
      h.verified
        ? "Data status: Verified (demo dataset)"
        : "Data status: Demo/unverified — treat as illustrative only.",
    ].join("\n");
  }

  if (!city) {
    return `I don't have verified data for that. Please tell me a city first — I currently have demo data for: ${SUPPORTED_CITIES.join(
      ", "
    )}.`;
  }

  const filters: HospitalFilters = {
    location: city,
    disease: intent.disease,
    budget: intent.budget,
    sort: intent.wantsClosest ? "nearest" : "recommended",
  };

  const { results } = queryHospitals(filters);

  // 2) "Which hospitals have ICU?"
  if (intent.wantsFacilityInfo) {
    const withFacility = results.filter((h) => h.facilities.includes(intent.wantsFacilityInfo!));
    if (withFacility.length === 0) {
      return `I don't have verified data showing any hospital in ${city} with ${intent.wantsFacilityInfo} for these filters.`;
    }
    return `Hospitals in ${city} with ${intent.wantsFacilityInfo}:\n${summarizeHospitalList(
      withFacility
    )}`;
  }

  // 3) "Which hospital is closest?"
  if (intent.wantsClosest) {
    if (results.length === 0) {
      return `I don't have verified data for hospitals matching that in ${city}.`;
    }
    const nearest = results[0];
    return `The closest match in ${city} is ${nearest.name}, about ${nearest.distanceKm} km away (rated ${nearest.rating}/5).`;
  }

  // 4) General "show me hospitals ... for X under Y" queries
  if (results.length === 0) {
    return `I don't have verified data for hospitals in ${city}${
      intent.disease ? ` for ${intent.disease}` : ""
    }${intent.budget ? ` under ${formatCost(intent.budget)}` : ""}. Try adjusting the filters.`;
  }

  const header = `Here are hospitals in ${city}${
    intent.disease ? ` that match the available ${intent.disease} data` : ""
  }${intent.budget ? ` within ${formatCost(intent.budget)}` : ""} (from our demo dataset):`;

  return `${header}\n${summarizeHospitalList(results)}\n\nAsk me for details on any hospital by name, or say "closest" / "which have ICU" for more.`;
}
