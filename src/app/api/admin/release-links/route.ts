import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  readReleaseLinksConfig,
  validateReleaseLinksPayload,
  writeReleaseLinksConfig,
} from "@/lib/admin-release-links";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  return NextResponse.json(await readReleaseLinksConfig());
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as unknown;
    if (!validateReleaseLinksPayload(payload)) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    const nextConfig = {
      acqueBandcampUrl: payload.acqueBandcampUrl?.trim() || undefined,
    };
    await writeReleaseLinksConfig(nextConfig);
    return NextResponse.json({ ok: true, ...nextConfig });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
