import { parseBandcampId } from "@/lib/bandcamp";

export type BandcampTrack = {
  id: number;
  title: string;
  duration: number;
  streamUrl?: string;
  lyrics?: string;
};

function decodeBandcampBlobAttribute(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function decodeLyricsHtml(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/** Bandcamp album pages embed lyrics keyed by 1-based track position (`lyrics_row_<n>`). */
export function parseBandcampLyrics(html: string): Record<number, string> {
  const result: Record<number, string> = {};
  const rowRegex = /id="lyrics_row_(\d+)"[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/g;
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(html)) !== null) {
    const position = Number(match[1]);
    if (!Number.isFinite(position)) continue;
    const text = decodeLyricsHtml(match[2]);
    if (text) result[position] = text;
  }

  return result;
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
      track_num?: number;
      file?: Record<string, string>;
    }>;
  };

  const lyricsByPosition = parseBandcampLyrics(html);

  return (data.trackinfo ?? [])
    .filter(
      (
        track,
      ): track is {
        id: number;
        title: string;
        duration: number;
        track_num?: number;
        file?: Record<string, string>;
      } =>
        typeof track.id === "number" &&
        typeof track.title === "string" &&
        typeof track.duration === "number",
    )
    .map((track, index) => {
      const position =
        typeof track.track_num === "number" ? track.track_num : index + 1;
      return {
        id: track.id,
        title: track.title,
        duration: track.duration,
        streamUrl: track.file?.["mp3-128"],
        lyrics: lyricsByPosition[position],
      };
    });
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
