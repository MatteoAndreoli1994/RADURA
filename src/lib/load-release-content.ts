import type { BandcampTrack } from "@/lib/bandcamp-album";
import { getReleaseCoverSrc, preloadReleaseCover } from "@/lib/preload-release-cover";
import { staticTracksForRelease, type Release } from "@/lib/releases";

export async function loadReleaseContent(
  release: Release,
  fetchTracks: (release: Release) => Promise<BandcampTrack[]>,
): Promise<BandcampTrack[]> {
  const coverSrc = getReleaseCoverSrc(release);
  const staticTracks = staticTracksForRelease(release);

  if (staticTracks) {
    await preloadReleaseCover(coverSrc);
    return staticTracks;
  }

  const [tracks] = await Promise.all([
    release.bandcampUrl ? fetchTracks(release) : Promise.resolve([] as BandcampTrack[]),
    preloadReleaseCover(coverSrc),
  ]);
  return tracks;
}
