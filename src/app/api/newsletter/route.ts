import { subscribeToEmailOctopus } from "@/lib/emailoctopus";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requireConsent = searchParams.get("requireConsent") === "1";
    const { email, consentAccepted } = (await request.json()) as {
      email?: string;
      consentAccepted?: boolean;
    };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (requireConsent && consentAccepted !== true) {
      return NextResponse.json(
        { error: "Privacy consent is required" },
        { status: 400 },
      );
    }

    const normalized = email.toLowerCase();
    const result = await subscribeToEmailOctopus(normalized);

    console.log(
      `[newsletter] ✓ Iscrizione completata: ${normalized} (emailoctopus: ${result.status})`,
    );

    return NextResponse.json({ ok: true, emailoctopus: result });
  } catch (err) {
    console.error(
      "[newsletter] ✗ Iscrizione fallita:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
