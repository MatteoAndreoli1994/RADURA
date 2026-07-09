"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { pauseAllBandcampPlayers } from "@/lib/bandcamp-player-control";

type AudioContextValue = {
  muted: boolean;
  toggleMuted: () => void;
  volume: number;
  setVolume: (value: number) => void;
  playing: boolean;
  current: number;
  duration: number;
  streamUrl: string | null;
  setStreamUrl: (url: string) => void;
  loadStream: (url: string) => void;
  playStream: (url: string) => void;
  pauseStream: () => void;
  clearPlayback: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  registerEndedHandler: (handler: (() => void) | null) => () => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return ctx;
}

type AudioProviderProps = {
  children: ReactNode;
  initialStreamUrl?: string | null;
};

export function AudioProvider({
  children,
  initialStreamUrl = null,
}: AudioProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadedUrlRef = useRef<string | null>(null);
  const endedHandlerRef = useRef<(() => void) | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [streamUrl, setStreamUrlState] = useState<string | null>(
    initialStreamUrl,
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = muted;
    audio.volume = muted ? 0 : volume;
    if (muted) pauseAllBandcampPlayers();

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onTime = () => setCurrent(audio.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      setPlaying(false);
      endedHandlerRef.current?.();
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("canplay", syncDuration);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnd);
    syncDuration();

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("canplay", syncDuration);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnd);
    };
  }, [muted, volume]);

  const setVolume = useCallback((value: number) => {
    const next = Math.min(1, Math.max(0, value));
    setVolumeState(next);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = muted ? 0 : next;
    }
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    if (loadedUrlRef.current === streamUrl) return;

    const wasPlaying = !audio.paused;
    audio.src = streamUrl;
    audio.load();
    loadedUrlRef.current = streamUrl;
    if (wasPlaying) {
      void audio.play().catch(() => setPlaying(false));
    }
  }, [streamUrl]);

  const setStreamUrl = useCallback((url: string) => {
    setStreamUrlState(url);
  }, []);

  const loadStream = useCallback((url: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    pauseAllBandcampPlayers();

    if (loadedUrlRef.current !== url) {
      audio.src = url;
      audio.load();
      loadedUrlRef.current = url;
      setStreamUrlState(url);
    }

    audio.pause();
    setPlaying(false);
    setCurrent(0);
  }, []);

  const playStream = useCallback(
    (url: string) => {
      const audio = audioRef.current;
      if (!audio || muted) return;

      pauseAllBandcampPlayers();

      if (loadedUrlRef.current !== url) {
        audio.src = url;
        audio.load();
        loadedUrlRef.current = url;
        setStreamUrlState(url);
      }

      void audio.play().catch(() => setPlaying(false));
    },
    [muted],
  );

  const pauseStream = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const clearPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    loadedUrlRef.current = null;
    setStreamUrlState(null);
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((value) => {
      const next = !value;
      if (next) pauseAllBandcampPlayers();
      return next;
    });
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = time;
    setCurrent(time);
  }, []);

  const registerEndedHandler = useCallback((handler: (() => void) | null) => {
    endedHandlerRef.current = handler;
    return () => {
      if (endedHandlerRef.current === handler) {
        endedHandlerRef.current = null;
      }
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        muted,
        toggleMuted,
        volume,
        setVolume,
        playing,
        current,
        duration,
        streamUrl,
        setStreamUrl,
        loadStream,
        playStream,
        pauseStream,
        clearPlayback,
        togglePlay,
        seek,
        registerEndedHandler,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        className="hidden"
        aria-hidden
      />
    </AudioContext.Provider>
  );
}
