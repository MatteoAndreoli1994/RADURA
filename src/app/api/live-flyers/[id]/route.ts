import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { readLiveFlyer } from "@/lib/live-flyers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id?.trim()) {
    return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  }

  const flyer = await readLiveFlyer(id.trim());
  if (!flyer) {
    return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  }

  const etag = `"${createHash("sha256").update(flyer.buffer).digest("hex")}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  }

  return new NextResponse(new Uint8Array(flyer.buffer), {
    headers: {
      "Content-Type": flyer.contentType,
      ETag: etag,
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
