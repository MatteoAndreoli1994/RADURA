import { NextResponse } from "next/server";
import { fetchBandcampTracklist } from "@/lib/bandcamp-album";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url?.startsWith("https://") || !url.includes("bandcamp.com")) {
    return NextResponse.json({ error: "Invalid Bandcamp URL" }, { status: 400 });
  }

  try {
    const tracks = await fetchBandcampTracklist(url);
    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json(
      { error: "Unable to load Bandcamp tracklist" },
      { status: 502 },
    );
  }
}
