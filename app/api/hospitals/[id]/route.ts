import { NextRequest, NextResponse } from "next/server";
import { getHospitalById } from "@/lib/data";
import { CITY_CENTERS } from "@/lib/data";
import { haversineDistanceKm } from "@/lib/matching";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hospital = getHospitalById(params.id);

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
    }

    const center = CITY_CENTERS[hospital.location as keyof typeof CITY_CENTERS];
    const distanceKm = center
      ? haversineDistanceKm(center.lat, center.lng, hospital.latitude, hospital.longitude)
      : 0;

    return NextResponse.json({ hospital: { ...hospital, distanceKm } });
  } catch (err) {
    console.error("GET /api/hospitals/[id] failed", err);
    return NextResponse.json(
      { error: "Something went wrong while fetching hospital details." },
      { status: 500 }
    );
  }
}
