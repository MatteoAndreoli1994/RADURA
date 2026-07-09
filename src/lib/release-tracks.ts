import type { BandcampTrack } from "@/lib/bandcamp-album";
import type { Release } from "@/lib/releases";

export const ACQUE_TRACK_TITLES = [
  "DESIDERARE",
  "ANGELI E LEI",
  "TEMPESTA",
  "INCANTO PT. I",
  "INCANTO PT. II",
  "INCANTO PT. III",
  "CORPOTRASFORMA",
] as const;

export const STATIC_RELEASE_TRACKS: Record<string, BandcampTrack[]> = {
  "2026": [
    { id: 1881933241, title: "DESIDERARE", duration: 389.586 },
    { id: 4046158038, title: "ANGELI E LEI", duration: 294.051 },
    { id: 1241492707, title: "TEMPESTA", duration: 383.021 },
    { id: 3237346087, title: "INCANTO PT. I", duration: 137.482 },
    { id: 742853743, title: "INCANTO PT. II", duration: 363.059 },
    { id: 1657916637, title: "INCANTO PT. III", duration: 243.028 },
    { id: 3167455875, title: "CORPOTRASFORMA", duration: 472.308 },
  ],
  "apr-2021": [
    { id: 883835458, title: "La Luce Che Copre Gli Angoli", duration: 150.74 },
    { id: 3246558910, title: "Se Questa È La Nostra Festa", duration: 293.053 },
    { id: 3100572858, title: "Monumento", duration: 218.724 },
    { id: 1817433649, title: "Rintocchi", duration: 118.817 },
    { id: 783617967, title: "Parigi", duration: 82.042 },
    {
      id: 1542165454,
      title: "Tutto Il Tempo Che Ho Passato A Non Vedere",
      duration: 534.875,
    },
    { id: 3316749503, title: "Riflessi", duration: 257.456 },
    { id: 3553137681, title: "Araucaria", duration: 216.824 },
    { id: 2778510998, title: "Costellazione||Pareidolia", duration: 324.582 },
  ],
  "2018": [
    {
      id: 3182470541,
      title: "Quando Urlai Amore nel Cuore del Mondo",
      duration: 206.653,
    },
    { id: 1373846068, title: "L'Anno delle Rondini", duration: 240.202 },
  ],
  "2017": [
    { id: 62978580, title: "Pietre di Carta", duration: 139.815 },
    { id: 2470292575, title: "Acqualuna", duration: 140.933 },
    { id: 2739152037, title: "Cadere", duration: 95.9591 },
    { id: 1781965445, title: "Rievocazioni", duration: 253.846 },
    { id: 1275479123, title: "Uomini Faro", duration: 245.749 },
    { id: 4275272190, title: "Coda", duration: 267.692 },
  ],
  "2016": [
    { id: 3998429148, title: "Inerzia", duration: 175.653 },
    { id: 2178742216, title: "Distanze", duration: 94.9745 },
    { id: 2858023988, title: "Ritorno", duration: 183.553 },
    { id: 160003575, title: "Trasfigurazione", duration: 135.309 },
  ],
};

function normalizeTrackTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findFetchedTrackMatch(
  staticTrack: BandcampTrack,
  fetchedTracks: BandcampTrack[],
  usedIndexes: Set<number>,
): BandcampTrack | null {
  const staticNorm = normalizeTrackTitle(staticTrack.title);

  for (let index = 0; index < fetchedTracks.length; index += 1) {
    if (usedIndexes.has(index)) continue;

    const fetched = fetchedTracks[index];
    const fetchedNorm = normalizeTrackTitle(fetched.title);
    if (
      fetchedNorm === staticNorm ||
      fetchedNorm.includes(staticNorm) ||
      staticNorm.includes(fetchedNorm)
    ) {
      usedIndexes.add(index);
      return fetched;
    }
  }

  return null;
}

export function mergeReleaseTracks(
  staticTracks: BandcampTrack[],
  fetchedTracks: BandcampTrack[],
): BandcampTrack[] {
  if (!staticTracks.length) return fetchedTracks;
  if (!fetchedTracks.length) return staticTracks;

  const usedFetchedIndexes = new Set<number>();

  const matchByIndex = fetchedTracks.length === staticTracks.length;

  return staticTracks.map((staticTrack, index) => {
    let fetched = findFetchedTrackMatch(staticTrack, fetchedTracks, usedFetchedIndexes);

    if (!fetched && matchByIndex && index < fetchedTracks.length) {
      fetched = fetchedTracks[index];
      usedFetchedIndexes.add(index);
    }

    if (!fetched) return staticTrack;

    return {
      ...staticTrack,
      id: fetched.id,
      duration: fetched.duration || staticTrack.duration,
      streamUrl: fetched.streamUrl ?? staticTrack.streamUrl,
      lyrics: fetched.lyrics ?? staticTrack.lyrics,
    };
  });
}

export function staticTracksForRelease(release: Release): BandcampTrack[] {
  return STATIC_RELEASE_TRACKS[release.id] ?? [];
}

export function buildInitialReleaseTracksById(
  releases: Release[],
): Record<string, BandcampTrack[]> {
  return Object.fromEntries(
    releases
      .map((release) => [release.id, staticTracksForRelease(release)] as const)
      .filter((entry): entry is [string, BandcampTrack[]] => entry[1].length > 0),
  );
}
