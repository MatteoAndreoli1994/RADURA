import { NextResponse } from "next/server";
import { fetchBandcampTracklist } from "@/lib/bandcamp-album";
import { resolveBandcampCandidates } from "@/lib/release-bandcamp";
import { RELEASES } from "@/lib/releases";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const url = searchParams.get("url");
  const releaseId = searchParams.get("releaseId");
  const candidates = await resolveBandcampCandidates(releaseId, url);

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Invalid Bandcamp URL or release" },
      { status: 400 },
    );
  }

  const release = releaseId
    ? RELEASES.find(
        (item) => item.id === releaseId || item.slug === releaseId,
      )
    : null;
  const minTracks = release?.trackCount ?? 1;

  for (const candidate of candidates) {
    try {
      const tracks = await fetchBandcampTracklist(candidate);
      if (tracks.length >= minTracks) {
        return NextResponse.json({ tracks, sourceUrl: candidate });
      }
    } catch {
      // try next candidate
    }
  }

  return NextResponse.json(
    { error: "Unable to load Bandcamp tracklist" },
    { status: 502 },
  );
}
