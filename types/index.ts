export type HospitalType = "Government" | "Private" | "Multi-Specialty" | "Specialty";

export type Facility =
  | "ICU"
  | "Emergency"
  | "Pharmacy"
  | "Diagnostic Lab"
  | "Ambulance"
  | "Blood Bank";

export interface Treatment {
  disease: string;
  estimatedCost: number; // in INR
}

export interface Doctor {
  name: string;
  specialization: string;
  experienceYears: number;
}

export interface Hospital {
  id: string;
  name: string;
  location: string; // city
  address: string;
  latitude: number;
  longitude: number;
  hospitalType: HospitalType;
  specializations: string[];
  treatments: Treatment[];
  facilities: Facility[];
  doctors: Doctor[];
  rating: number; // 0-5
  verified: boolean;
  dataSource: string;
  lastVerified: string; // ISO date
  patientStatsAvailable: boolean;
  patientStatsNote?: string;
}

export interface HospitalWithDistance extends Hospital {
  distanceKm: number;
}

export interface MatchedHospital extends HospitalWithDistance {
  matchScore: number;
  matchReasons: string[];
}

export interface HospitalFilters {
  location?: string;
  disease?: string;
  budget?: number;
  maxDistance?: number;
  hospitalType?: HospitalType;
  facilities?: Facility[];
  minRating?: number;
  sort?: "recommended" | "nearest" | "lowest-cost" | "highest-rating";
}
