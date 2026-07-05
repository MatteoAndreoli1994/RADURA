import { parseBandcampId } from "@/lib/bandcamp";

export type BandcampTrack = {
  id: number;
  title: string;
  duration: number;
  streamUrl?: string;
};

function decodeBandcampBlobAttribute(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchBandcampAlbumHtml(bandcampUrl: string): Promise<string> {
  const response = await fetch(bandcampUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Bandcamp fetch failed: ${response.status}`);
  }

  return response.text();
}

export function formatTrackDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function releaseYear(releaseDate?: string): string {
  if (!releaseDate) return "";
  const match = releaseDate.match(/\d{4}/);
  return match?.[0] ?? releaseDate;
}

export function parseBandcampTracklist(html: string): BandcampTrack[] {
  const match = html.match(/data-tralbum="([^"]+)"/);
  if (!match?.[1]) return [];

  const payload = decodeBandcampBlobAttribute(match[1]);

  const data = JSON.parse(payload) as {
    trackinfo?: Array<{
      id?: number;
      title?: string;
      duration?: number;
      file?: Record<string, string>;
    }>;
  };

  return (data.trackinfo ?? [])
    .filter(
      (
        track,
      ): track is {
        id: number;
        title: string;
        duration: number;
        file?: Record<string, string>;
      } =>
        typeof track.id === "number" &&
        typeof track.title === "string" &&
        typeof track.duration === "number",
    )
    .map((track) => ({
      id: track.id,
      title: track.title,
      duration: track.duration,
      streamUrl: track.file?.["mp3-128"],
    }));
}

export async function fetchBandcampTracklist(
  bandcampUrl: string,
): Promise<BandcampTrack[]> {
  const html = await fetchBandcampAlbumHtml(bandcampUrl);
  return parseBandcampTracklist(html);
}

export function bandcampTrackEmbedUrl(albumId: string, trackId: number): string {
  return `https://bandcamp.com/EmbeddedPlayer/v=2/album=${albumId}/track=${trackId}/size=large/bgcol=ffffff/linkcol=000000/tracklist=false/artwork=none/transparent=true/`;
}

export function getBandcampAlbumId(bandcampEmbedUrl?: string): string | null {
  const parsed = parseBandcampId(bandcampEmbedUrl ?? "");
  return parsed?.type === "album" ? parsed.id : null;
}
