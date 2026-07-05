import { createHash } from "crypto";
import { NextResponse } from "next/server";

type MailchimpResult = {
  status: string;
};

function mailchimpSubscriberHash(email: string) {
  return createHash("md5").update(email.toLowerCase()).digest("hex");
}

async function subscribeToMailchimp(email: string): Promise<MailchimpResult> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const server = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !audienceId || !server) {
    console.error("[newsletter] Mailchimp non configurato: mancano variabili .env");
    throw new Error("Mailchimp non configurato");
  }

  const hash = mailchimpSubscriberHash(email);
  const res = await fetch(
    `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members/${hash}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `apikey ${apiKey}`,
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
        status: "subscribed",
      }),
    }
  );

  const data = (await res.json()) as {
    title?: string;
    detail?: string;
    status?: string;
  };

  if (!res.ok) {
    console.error(
      `[newsletter] ✗ Mailchimp errore (${res.status}) per ${email}:`,
      data.detail ?? data.title ?? "errore sconosciuto",
    );
    throw new Error(data.detail ?? "Mailchimp error");
  }

  const status = data.status ?? "subscribed";
  console.log(
    `[newsletter] ✓ Mailchimp: ${email} iscritto (stato: ${status}) nel pubblico ${audienceId}`,
  );
  return { status };
}

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
    const result = await subscribeToMailchimp(normalized);

    console.log(
      `[newsletter] ✓ Iscrizione completata: ${normalized} (mailchimp: ${result.status})`,
    );

    return NextResponse.json({ ok: true, mailchimp: result });
  } catch (err) {
    console.error(
      "[newsletter] ✗ Iscrizione fallita:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
