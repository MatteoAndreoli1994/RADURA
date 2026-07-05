import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  LIVE_FLYER_MAX_BYTES,
  deleteLiveFlyer,
  liveFlyerApiPath,
  liveFlyerVersionFromBuffer,
  resolveFlyerUploadContentType,
  saveLiveFlyer,
} from "@/lib/live-flyers";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const id = formData.get("id");
    const file = formData.get("file");

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File mancante" }, { status: 400 });
    }

    const contentType = resolveFlyerUploadContentType(file);
    if (!contentType) {
      return NextResponse.json(
        { error: "Formato immagine non supportato (JPG, PNG, WebP, GIF)" },
        { status: 400 },
      );
    }

    if (file.size > LIVE_FLYER_MAX_BYTES) {
      return NextResponse.json({ error: "Immagine troppo grande (max 5 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await saveLiveFlyer(id.trim(), buffer, contentType);

    return NextResponse.json({
      flyer: liveFlyerApiPath(id.trim(), liveFlyerVersionFromBuffer(buffer)),
    });
  } catch {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { id } = (await request.json()) as { id?: string };

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    await deleteLiveFlyer(id.trim());
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
