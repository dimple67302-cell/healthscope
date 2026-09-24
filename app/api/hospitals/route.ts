import { NextRequest, NextResponse } from "next/server";
import { queryHospitals } from "@/lib/matching";
import { Facility, HospitalFilters, HospitalType } from "@/types";
import { SUPPORTED_CITIES } from "@/lib/data";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const location = sp.get("location") ?? undefined;
    const disease = sp.get("disease") ?? undefined;
    const budgetRaw = sp.get("budget");
    const distanceRaw = sp.get("distance");
    const hospitalType = (sp.get("hospitalType") as HospitalType | null) ?? undefined;
    const facilitiesRaw = sp.get("facilities"); // comma separated
    const minRatingRaw = sp.get("minRating");
    const sort = (sp.get("sort") as HospitalFilters["sort"]) ?? undefined;

    const filters: HospitalFilters = {
      location,
      disease,
      budget: budgetRaw ? Number(budgetRaw) : undefined,
      maxDistance: distanceRaw ? Number(distanceRaw) : undefined,
      hospitalType,
      facilities: facilitiesRaw
        ? (facilitiesRaw.split(",").filter(Boolean) as Facility[])
        : undefined,
      minRating: minRatingRaw ? Number(minRatingRaw) : undefined,
      sort,
    };

    const { city, results } = queryHospitals(filters);

    if (location && !city) {
      return NextResponse.json(
        {
          error: `We don't have demo data for "${location}" yet.`,
          supportedCities: SUPPORTED_CITIES,
          results: [],
          count: 0,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      city,
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("GET /api/hospitals failed", err);
    return NextResponse.json(
      { error: "Something went wrong while fetching hospitals.", results: [], count: 0 },
      { status: 500 }
    );
  }
}
