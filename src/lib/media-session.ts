const ARTIST_NAME = "Radura";

const ARTWORK_SIZES = [96, 128, 256, 512] as const;

function artworkMimeType(src: string): string {
  const path = src.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".avif")) return "image/avif";
  if (path.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

export function absoluteMediaUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMediaSessionMetadata(input: {
  trackTitle: string;
  releaseTitle: string;
  cover: string;
}): MediaMetadata {
  const artworkSrc = absoluteMediaUrl(input.cover);
  const mimeType = artworkMimeType(artworkSrc);

  return new MediaMetadata({
    title: input.trackTitle,
    artist: ARTIST_NAME,
    album: input.releaseTitle,
    artwork: ARTWORK_SIZES.map((size) => ({
      src: artworkSrc,
      sizes: `${size}x${size}`,
      type: mimeType,
    })),
  });
}

export function supportsMediaSession(): boolean {
  return typeof navigator !== "undefined" && "mediaSession" in navigator;
}

export function clearMediaSession() {
  if (!supportsMediaSession()) return;
  navigator.mediaSession.metadata = null;
  navigator.mediaSession.playbackState = "none";
}

export function updateMediaSessionPosition(current: number, duration: number) {
  if (!supportsMediaSession() || !duration || duration <= 0) return;

  try {
    navigator.mediaSession.setPositionState({
      duration,
      playbackRate: 1,
      position: Math.min(Math.max(0, current), duration),
    });
  } catch {
    // Unsupported or invalid state in some browsers.
  }
}
