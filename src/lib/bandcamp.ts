/** Da URL copertina Bandcamp → versione alta risoluzione (1200px) */
export function bandcampHiResArtUrl(artUrl: string): string {
  return artUrl.replace(/_\d+\.jpg$/, "_10.jpg");
}

export function parseBandcampId(
  embedOrUrl: string,
): { type: "album" | "track"; id: string } | null {
  const album = embedOrUrl.match(/album=(\d+)/);
  if (album) return { type: "album", id: album[1] };

  const track = embedOrUrl.match(/track=(\d+)/);
  if (track) return { type: "track", id: track[1] };

  return null;
}

export function bandcampPlayerEmbed(
  type: "album" | "track",
  id: string,
): string {
  const base = `https://bandcamp.com/EmbeddedPlayer/v=2/${type}=${id}/size=large/bgcol=ffffff/linkcol=000000`;
  const tracklist = type === "album" ? "true" : "false";
  return `${base}/tracklist=${tracklist}/artwork=none/transparent=true/`;
}

export function getBandcampEmbeds(bandcampEmbedUrl?: string) {
  const parsed = getReleasePlayerEmbed(bandcampEmbedUrl);
  if (!parsed) return null;
  return { player: parsed.player };
}

/**
 * Altezza embed album Bandcamp v2 (size=large, artwork=none, tracklist).
 * Calibrata su Effetto (9 tracce ≈ 430px @ 520px); le tracklist corte
 * hanno padding inferiore extra rispetto al solo conteggio righe.
 */
export function estimateBandcampAlbumPlayerHeight(
  trackCount: number,
  width: number,
): number {
  const clampedWidth = Math.max(280, Math.min(width, 700));
  const header = 88 + Math.max(0, 520 - clampedWidth) * 0.38;
  const row = 38;
  const shortAlbumPadding =
    trackCount < 9 ? Math.ceil((9 - trackCount) * 5.2) : 0;
  return Math.round(header + trackCount * row + 8 + shortAlbumPadding);
}

export function getReleasePlayerEmbed(bandcampEmbedUrl?: string) {
  if (!bandcampEmbedUrl) return null;
  const parsed = parseBandcampId(bandcampEmbedUrl);
  if (!parsed) return null;
  return {
    type: parsed.type,
    id: parsed.id,
    player: bandcampPlayerEmbed(parsed.type, parsed.id),
  };
}
