import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  readSiteModeConfig,
  writeSiteModeConfig,
} from "@/lib/admin-site-mode";
import type { SiteMode } from "@/lib/site-mode";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    return NextResponse.json(await readSiteModeConfig());
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Errore server";
    console.error("[admin/site-mode GET]", message);
    return NextResponse.json({ mode: "full" as SiteMode });
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { mode } = (await request.json()) as { mode?: SiteMode };
    if (mode !== "full" && mode !== "newsletter") {
      return NextResponse.json({ error: "Modalità non valida" }, { status: 400 });
    }

    await writeSiteModeConfig(mode);
    return NextResponse.json({ ok: true, mode });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Errore server";
    console.error("[admin/site-mode]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
