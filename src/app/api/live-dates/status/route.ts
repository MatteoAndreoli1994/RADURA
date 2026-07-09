import { NextResponse } from "next/server";
import { isLiveDatesBackendReady } from "@/lib/admin-live-dates";
import { isUpstashConfigured, pingUpstashRedis } from "@/lib/kv-config";

export async function GET() {
  if (!isLiveDatesBackendReady()) {
    return NextResponse.json({
      ready: false,
      reason:
        "Backend date live non disponibile. In locale usa npm run dev; in produzione configura Upstash Redis (UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN in .env.local).",
    });
  }

  if (isUpstashConfigured()) {
    try {
      await pingUpstashRedis();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upstash Redis non raggiungibile";
      return NextResponse.json({ ready: false, reason: message });
    }
  }

  return NextResponse.json({ ready: true });
}
