type BandcampPlayerMessage = {
  method: string;
};

type BandcampPlayerEvent = {
  event?: string;
};

export type BandcampPlaybackEvent = {
  releaseId: string;
  type: "play" | "pause" | "finish";
};

const bandcampPlayers = new Map<string, HTMLIFrameElement>();
const playbackListeners = new Set<(event: BandcampPlaybackEvent) => void>();
const pendingPlays = new Map<
  string,
  { albumId: string; trackId: number }
>();
const pendingLoads = new Map<
  string,
  { albumId: string; trackId: number }
>();

function bandcampTrackEmbedSrc(
  albumId: string,
  trackId: number,
  size: "small" | "large" = "small",
) {
  return `https://bandcamp.com/EmbeddedPlayer/v=2/album=${albumId}/track=${trackId}/size=${size}/bgcol=ffffff/linkcol=000000/tracklist=false/artwork=none/transparent=true/`;
}

function postBandcampMessage(
  iframe: HTMLIFrameElement,
  payload: BandcampPlayerMessage,
  targetOrigin = "*",
) {
  iframe.contentWindow?.postMessage(JSON.stringify(payload), targetOrigin);
}

function emitPlayback(event: BandcampPlaybackEvent) {
  playbackListeners.forEach((listener) => listener(event));
}

export function onBandcampPlayback(
  listener: (event: BandcampPlaybackEvent) => void,
) {
  playbackListeners.add(listener);
  return () => playbackListeners.delete(listener);
}

export function registerBandcampPlayer(
  releaseId: string,
  iframe: HTMLIFrameElement,
) {
  bandcampPlayers.set(releaseId, iframe);
  subscribeBandcampPlayer(iframe);

  const pendingLoad = pendingLoads.get(releaseId);
  if (pendingLoad) {
    pendingLoads.delete(releaseId);
    loadBandcampTrack(releaseId, pendingLoad.albumId, pendingLoad.trackId);
    return () => {
      const current = bandcampPlayers.get(releaseId);
      if (current === iframe) {
        bandcampPlayers.delete(releaseId);
        pendingPlays.delete(releaseId);
        pendingLoads.delete(releaseId);
      }
    };
  }

  const pending = pendingPlays.get(releaseId);
  if (pending) {
    pendingPlays.delete(releaseId);
    playBandcampTrack(releaseId, pending.albumId, pending.trackId);
  }

  return () => {
    const current = bandcampPlayers.get(releaseId);
    if (current === iframe) {
      bandcampPlayers.delete(releaseId);
      pendingPlays.delete(releaseId);
      pendingLoads.delete(releaseId);
    }
  };
}

export function subscribeBandcampPlayer(iframe: HTMLIFrameElement) {
  postBandcampMessage(iframe, { method: "subscribe" });
  postBandcampMessage(iframe, { method: "subscribe" }, "https://bandcamp.com");
}

export function pauseBandcampPlayerSoft(iframe: HTMLIFrameElement) {
  subscribeBandcampPlayer(iframe);
  postBandcampMessage(iframe, { method: "pause" });
  postBandcampMessage(iframe, { method: "pause" }, "https://bandcamp.com");
}

export function pauseBandcampPlayerHard(iframe: HTMLIFrameElement) {
  pauseBandcampPlayerSoft(iframe);

  const src = iframe.src;
  if (!src || src === "about:blank") return;

  iframe.src = "";
  iframe.src = src;
}

function findReleaseIdForSource(source: MessageEventSource | null) {
  if (!source) return null;

  for (const [releaseId, iframe] of bandcampPlayers) {
    if (iframe.contentWindow === source) return releaseId;
  }

  return null;
}

export function pauseOtherBandcampPlayers(activeReleaseId: string) {
  bandcampPlayers.forEach((iframe, releaseId) => {
    if (releaseId === activeReleaseId) return;
    pauseBandcampPlayerSoft(iframe);
  });
}

export function loadBandcampTrack(
  releaseId: string,
  albumId: string,
  trackId: number,
) {
  const iframe = bandcampPlayers.get(releaseId);
  const src = bandcampTrackEmbedSrc(albumId, trackId);

  if (!iframe) {
    pendingLoads.set(releaseId, { albumId, trackId });
    pendingPlays.delete(releaseId);
    return false;
  }

  pendingPlays.delete(releaseId);

  if (iframe.src !== src) {
    iframe.src = src;
  }

  subscribeBandcampPlayer(iframe);
  return true;
}

export function playBandcampTrack(
  releaseId: string,
  albumId: string,
  trackId: number,
) {
  const iframe = bandcampPlayers.get(releaseId);
  if (!iframe) {
    pendingPlays.set(releaseId, { albumId, trackId });
    pendingLoads.delete(releaseId);
    return false;
  }

  const src = bandcampTrackEmbedSrc(albumId, trackId);

  const startPlayback = () => {
    subscribeBandcampPlayer(iframe);
    window.setTimeout(() => {
      postBandcampMessage(iframe, { method: "play" });
      postBandcampMessage(iframe, { method: "play" }, "https://bandcamp.com");
    }, 120);
  };

  if (iframe.src === src) {
    startPlayback();
    return true;
  }

  iframe.addEventListener("load", startPlayback, { once: true });
  iframe.src = src;
  return true;
}

export function resumeBandcampPlayer(releaseId: string) {
  const iframe = bandcampPlayers.get(releaseId);
  if (!iframe) return;
  subscribeBandcampPlayer(iframe);
  postBandcampMessage(iframe, { method: "play" });
  postBandcampMessage(iframe, { method: "play" }, "https://bandcamp.com");
}

export function pauseBandcampPlayerByReleaseId(releaseId: string) {
  const iframe = bandcampPlayers.get(releaseId);
  if (!iframe) return;
  pauseBandcampPlayerSoft(iframe);
}

export function pauseAllBandcampPlayers() {
  bandcampPlayers.forEach((iframe) => pauseBandcampPlayerHard(iframe));

  const registered = new Set(bandcampPlayers.values());
  document
    .querySelectorAll<HTMLIFrameElement>(
      'iframe[src*="bandcamp.com"], iframe[src*="bcbits.com"]',
    )
    .forEach((iframe) => {
      if (!registered.has(iframe)) pauseBandcampPlayerHard(iframe);
    });
}

export function installBandcampPlaybackSync() {
  function onMessage(event: MessageEvent) {
    if (!event.origin.includes("bandcamp.com")) return;

    let data: BandcampPlayerEvent | null = null;
    try {
      data =
        typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    } catch {
      return;
    }

    const activeReleaseId = findReleaseIdForSource(event.source);
    if (!activeReleaseId) return;

    if (data?.event === "play") {
      emitPlayback({ releaseId: activeReleaseId, type: "play" });
      window.setTimeout(() => {
        pauseOtherBandcampPlayers(activeReleaseId);
      }, 0);
      return;
    }

    if (data?.event === "pause") {
      emitPlayback({ releaseId: activeReleaseId, type: "pause" });
      return;
    }

    if (data?.event === "finish") {
      emitPlayback({ releaseId: activeReleaseId, type: "finish" });
    }
  }

  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}
