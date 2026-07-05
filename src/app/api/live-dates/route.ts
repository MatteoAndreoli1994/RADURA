import { NextResponse } from "next/server";
import { readLiveDatesConfig } from "@/lib/admin-live-dates";

export async function GET() {
  const config = await readLiveDatesConfig();
  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
