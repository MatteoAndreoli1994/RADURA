import { readReleaseLinksConfig } from "@/lib/admin-release-links";
import { RELEASES, isAcqueRelease, type Release } from "@/lib/releases";

function normalizeCandidate(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("https://")) return null;
  if (!trimmed.includes("bandcamp.com")) return null;
  return trimmed;
}

function uniqueCandidates(values: Array<string | null>): string[] {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (!out.includes(value)) out.push(value);
  }
  return out;
}

function releaseByIdOrSlug(releaseIdOrSlug: string): Release | null {
  return (
    RELEASES.find(
      (release) =>
        release.id === releaseIdOrSlug || release.slug === releaseIdOrSlug,
    ) ?? null
  );
}

export async function resolveBandcampCandidates(
  releaseIdOrSlug: string | null,
  directUrl?: string | null,
): Promise<string[]> {
  const directCandidate = normalizeCandidate(directUrl ?? undefined);

  if (!releaseIdOrSlug) {
    return directCandidate ? [directCandidate] : [];
  }

  const release = releaseByIdOrSlug(releaseIdOrSlug);
  if (!release) return directCandidate ? [directCandidate] : [];

  if (isAcqueRelease(release)) {
    const links = await readReleaseLinksConfig();
    const manual = normalizeCandidate(links.acqueBandcampUrl);
    const envPublic = normalizeCandidate(process.env.NEXT_PUBLIC_ACQUE_BANDCAMP_URL);
    const envServer = normalizeCandidate(process.env.ACQUE_BANDCAMP_URL);
    const guessed = normalizeCandidate("https://radura.bandcamp.com/album/acque");
    const defaultReleaseUrl = normalizeCandidate(release.bandcampUrl);

    return uniqueCandidates([
      manual,
      directCandidate,
      envServer,
      envPublic,
      // Keep release default as last chance in case it's updated later.
      defaultReleaseUrl,
      guessed,
    ]);
  }

  const defaultReleaseUrl = normalizeCandidate(release.bandcampUrl);
  return uniqueCandidates([directCandidate, defaultReleaseUrl]);
}
