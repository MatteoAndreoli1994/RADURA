import { NextResponse } from "next/server";
import { isLiveDatesBackendReady } from "@/lib/admin-live-dates";

export async function GET() {
  return NextResponse.json({ ready: isLiveDatesBackendReady() });
}
