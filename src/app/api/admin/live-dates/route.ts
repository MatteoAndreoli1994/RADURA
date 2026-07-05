import { NextResponse } from "next/server";
import {
  readLiveDatesConfig,
  validateLiveDates,
  writeLiveDatesConfig,
} from "@/lib/admin-live-dates";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  return NextResponse.json(await readLiveDatesConfig());
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { dates } = (await request.json()) as { dates?: unknown };

    if (!validateLiveDates(dates)) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    await writeLiveDatesConfig(dates);
    return NextResponse.json({ ok: true, dates });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
