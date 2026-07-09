"use client";

import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { useAudio } from "@/components/AudioProvider";
import {
  buildMediaSessionMetadata,
  clearMediaSession,
  supportsMediaSession,
  updateMediaSessionPosition,
} from "@/lib/media-session";
import { onBandcampPlayback } from "@/lib/bandcamp-player-control";
import { useEffect, useRef, useState } from "react";

export function MediaSessionBridge() {
  const {
    nowPlaying,
    isPlaying,
    togglePlayback,
    playNext,
    playPrevious,
    canPlayNext,
    canPlayPrevious,
    stopPlayback,
  } = useBandcampSession();
  const { playing: audioPlaying, current, duration } = useAudio();
  const [bandcampPlaying, setBandcampPlaying] = useState(false);
  const nowPlayingRef = useRef(nowPlaying);

  useEffect(() => {
    nowPlayingRef.current = nowPlaying;
  }, [nowPlaying]);

  useEffect(() => {
    const unsubscribe = onBandcampPlayback((event) => {
      const active = nowPlayingRef.current;
      if (!active || event.releaseId !== active.releaseId) return;

      if (event.type === "play") {
        setBandcampPlaying(true);
        return;
      }

      if (event.type === "pause" || event.type === "finish") {
        setBandcampPlaying(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!nowPlaying) setBandcampPlaying(false);
  }, [nowPlaying]);

  const sessionPlaying = isPlaying || bandcampPlaying;

  const handlersRef = useRef({
    sessionPlaying,
    togglePlayback,
    playNext,
    playPrevious,
    canPlayNext,
    canPlayPrevious,
    stopPlayback,
  });

  handlersRef.current = {
    sessionPlaying,
    togglePlayback,
    playNext,
    playPrevious,
    canPlayNext,
    canPlayPrevious,
    stopPlayback,
  };

  useEffect(() => {
    if (!supportsMediaSession()) return;

    if (!nowPlaying) {
      clearMediaSession();
      return;
    }

    navigator.mediaSession.metadata = buildMediaSessionMetadata({
      trackTitle: nowPlaying.trackTitle,
      releaseTitle: nowPlaying.releaseTitle,
      cover: nowPlaying.cover,
    });
  }, [nowPlaying]);

  useEffect(() => {
    if (!supportsMediaSession()) return;

    if (!nowPlaying) {
      navigator.mediaSession.playbackState = "none";
      return;
    }

    navigator.mediaSession.playbackState = sessionPlaying ? "playing" : "paused";
  }, [nowPlaying, sessionPlaying]);

  useEffect(() => {
    if (!supportsMediaSession() || !nowPlaying || !sessionPlaying) return;
    if (!audioPlaying || !duration || duration <= 0) return;

    updateMediaSessionPosition(current, duration);
  }, [nowPlaying, sessionPlaying, audioPlaying, current, duration]);

  useEffect(() => {
    if (!supportsMediaSession()) return;

    navigator.mediaSession.setActionHandler("play", () => {
      const handlers = handlersRef.current;
      if (!handlers.sessionPlaying) handlers.togglePlayback();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      const handlers = handlersRef.current;
      if (handlers.sessionPlaying) handlers.togglePlayback();
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      const handlers = handlersRef.current;
      if (handlers.canPlayPrevious) handlers.playPrevious();
    });

    navigator.mediaSession.setActionHandler("nexttrack", () => {
      const handlers = handlersRef.current;
      if (handlers.canPlayNext) handlers.playNext();
    });

    navigator.mediaSession.setActionHandler("stop", () => {
      handlersRef.current.stopPlayback();
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("stop", null);
    };
  }, []);

  return null;
}
