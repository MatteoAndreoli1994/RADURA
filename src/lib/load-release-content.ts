import type { BandcampTrack } from "@/lib/bandcamp-album";
import { getReleaseCoverSrc, preloadReleaseCover } from "@/lib/preload-release-cover";
import { mergeReleaseTracks, staticTracksForRelease } from "@/lib/release-tracks";
import type { Release } from "@/lib/releases";

export async function loadReleaseContent(
  release: Release,
  fetchTracks: (release: Release) => Promise<BandcampTrack[]>,
): Promise<BandcampTrack[]> {
  const coverSrc = getReleaseCoverSrc(release);
  const staticTracks = staticTracksForRelease(release);

  if (!release.bandcampUrl) {
    await preloadReleaseCover(coverSrc);
    return staticTracks;
  }

  const [fetchedTracks] = await Promise.all([
    fetchTracks(release),
    preloadReleaseCover(coverSrc),
  ]);

  return mergeReleaseTracks(staticTracks, fetchedTracks);
}
