"use client";

import { useRef, useState } from "react";
import { useAudio } from "@/components/AudioProvider";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { inter } from "@/lib/fonts";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className="block h-3 w-3">
      <path d="M4 2.5v11l9-5.5L4 2.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className="block h-3 w-3">
      <path d="M4 2.5h3v11H4v-11zm5 0h3v11H9v-11z" />
    </svg>
  );
}

function SkipBackIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className="block h-3 w-3">
      <path d="M1.5 2.5h1.75v11H1.5V2.5zm1.75 0L10.5 2.5 3.25 8l7.25 5.5V2.5z" />
    </svg>
  );
}

function SkipForwardIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className="block h-3 w-3">
      <path d="M3.25 2.5L10.5 8 3.25 13.5V2.5zM10.5 2.5h1.75v11H10.5V2.5z" />
    </svg>
  );
}

type PlayerTone = "light" | "dark";

type SeekBarProps = {
  progress: number;
  disabled: boolean;
  tone: PlayerTone;
  compact?: boolean;
  onSeek: (ratio: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
};

function SeekBar({
  progress,
  disabled,
  tone,
  compact = false,
  onSeek,
  onSeekStart,
  onSeekEnd,
}: SeekBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function seekFromClientX(clientX: number) {
    const track = trackRef.current;
    if (!track || disabled) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(ratio);
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Posizione traccia"
      className={`relative w-full ${disabled ? "cursor-default" : "cursor-pointer"} ${
        compact ? "h-2" : "h-3"
      }`}
      onPointerDown={(event) => {
        if (disabled) return;
        onSeekStart();
        seekFromClientX(event.clientX);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
        seekFromClientX(event.clientX);
      }}
      onPointerUp={(event) => {
        if (disabled) return;
        seekFromClientX(event.clientX);
        onSeekEnd();
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          onSeekEnd();
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
    >
      <div
        className={`absolute inset-x-0 bottom-0 h-px ${
          tone === "light" ? "bg-white/20" : "bg-black/15"
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 h-px ${
          tone === "light" ? "bg-white/70" : "bg-black/65"
        }`}
        style={{ width: `${progress}%` }}
      />
      <div
        className={`absolute bottom-0 h-2.5 w-px -translate-x-1/2 ${
          tone === "light" ? "bg-white" : "bg-black"
        }`}
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}

type MusicPlayerBarProps = {
  className?: string;
  variant?: "dock" | "inline";
  tone?: PlayerTone;
};

export function MusicPlayerBar({
  className = "",
  variant = "dock",
  tone = "dark",
}: MusicPlayerBarProps) {
  const inline = variant === "inline";
  const {
    nowPlaying,
    isPlaying,
    togglePlayback,
    stopPlayback,
    playNext,
    playPrevious,
    canPlayNext,
    canPlayPrevious,
    trackPosition,
    openRelease,
  } = useBandcampSession();
  const { current, duration, seek } = useAudio();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const seekValueRef = useRef(0);

  if (!nowPlaying) return null;

  const displayTime = isSeeking ? seekValue : current;
  const activeDuration = duration > 0 ? duration : nowPlaying.duration;
  const progress =
    activeDuration > 0 ? (displayTime / activeDuration) * 100 : 0;
  const canSeek = activeDuration > 0;

  const onHome = tone === "light";

  const transportBtnClass = `player-transport-btn flex h-4 w-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-opacity duration-200 hover:opacity-70 disabled:cursor-default disabled:hover:opacity-100 ${
    onHome
      ? "text-white disabled:text-white/30"
      : "text-black disabled:text-black/30"
  }`;

  const trackTitleClass = `min-w-0 truncate text-album cursor-pointer border-0 bg-transparent p-0 text-left transition-opacity duration-200 hover:opacity-70 ${
    onHome ? "text-white" : "text-black"
  }`;

  function openNowPlayingRelease() {
    if (!nowPlaying) return;
    openRelease(nowPlaying.releaseId);
  }

  return (
    <div
      className={`music-player-bar ${inter.className} flex w-full min-w-0 flex-col bg-transparent transition-colors duration-300 ${
        onHome ? "text-white" : "text-black"
      } ${
        inline
          ? "gap-1 overflow-visible px-0"
          : `gap-1 px-2 pt-1.5 ${onHome ? "border-t border-white/15" : "border-t border-black/10"}`
      } ${className}`}
      role="region"
      aria-label="Player musicale"
    >
      <div
        className={`flex min-h-6 min-w-0 items-center ${
          inline ? "gap-1.5" : "gap-2"
        }`}
      >
        <div className="player-transport flex shrink-0 items-center gap-0">
            <button
              type="button"
              onClick={playPrevious}
              disabled={!canPlayPrevious}
              aria-label="Traccia precedente"
              className={transportBtnClass}
            >
              <SkipBackIcon />
            </button>

            <button
              type="button"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pausa" : "Riproduci"}
              className={transportBtnClass}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              type="button"
              onClick={playNext}
              disabled={!canPlayNext}
              aria-label="Traccia successiva"
              className={transportBtnClass}
            >
              <SkipForwardIcon />
          </button>
        </div>

        {inline ? (
          <button
            type="button"
            onClick={openNowPlayingRelease}
            aria-label={`Vai all'album ${nowPlaying.releaseTitle}`}
            className={`${trackTitleClass} shrink-0 whitespace-nowrap`}
          >
            {nowPlaying.trackTitle}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={openNowPlayingRelease}
              aria-label={`Vai all'album ${nowPlaying.releaseTitle}`}
              className={`${trackTitleClass} min-w-0 flex-1 sm:hidden`}
            >
              {nowPlaying.trackTitle}
            </button>

            <div className="hidden min-w-0 flex-1 shrink sm:block sm:max-w-[10rem] md:max-w-[12rem]">
              <button
                type="button"
                onClick={openNowPlayingRelease}
                aria-label={`Vai all'album ${nowPlaying.releaseTitle}`}
                className={`${trackTitleClass} block w-full`}
              >
                {nowPlaying.trackTitle}
              </button>
              <p
                className={`truncate text-[10px] leading-none ${
                  onHome ? "text-white/55" : "text-black/50"
                }`}
              >
                {nowPlaying.releaseTitle}
                {trackPosition ? (
                  <>
                    {" · "}
                    <span
                      className={`text-player-time ${
                        onHome ? "text-white/50" : "text-black/45"
                      }`}
                    >
                      {trackPosition.index}/{trackPosition.total}
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          </>
        )}

        <span
          className={`text-player-time ml-auto shrink-0 ${
            onHome ? "text-white/75" : "text-black/55"
          }`}
        >
          {formatTime(displayTime)}
          <span className={onHome ? "text-white/35" : "text-black/30"}> / </span>
          {formatTime(activeDuration)}
        </span>

        <button
          type="button"
          onClick={stopPlayback}
          aria-label="Chiudi player"
          className={`flex h-5 w-4 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[14px] leading-none transition-colors duration-200 md:h-6 md:w-5 md:text-[15px] ${
            onHome
              ? "text-white/40 hover:text-white/70"
              : "text-black/35 hover:text-black/65"
          }`}
        >
          ×
        </button>
      </div>

      <SeekBar
        progress={progress}
        disabled={!canSeek}
        tone={tone}
        compact={inline}
        onSeekStart={() => setIsSeeking(true)}
        onSeek={(ratio) => {
          const time = ratio * activeDuration;
          seekValueRef.current = time;
          setSeekValue(time);
        }}
        onSeekEnd={() => {
          if (canSeek) seek(seekValueRef.current);
          setIsSeeking(false);
        }}
      />
    </div>
  );
}
