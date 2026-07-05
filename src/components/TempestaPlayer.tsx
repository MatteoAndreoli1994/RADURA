"use client";

import { useEffect, useRef, useState } from "react";
import { useAudio } from "@/components/AudioProvider";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M3 2.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M3.5 2.5h2v9h-2v-9zm5 0h2v9h-2v-9z" />
    </svg>
  );
}

type PlayerTone = "light" | "dark";

type SeekBarProps = {
  progress: number;
  disabled: boolean;
  onSeek: (value: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
  tone?: PlayerTone;
};

function SeekBar({
  progress,
  disabled,
  onSeek,
  onSeekStart,
  onSeekEnd,
  tone = "light",
}: SeekBarProps) {
  const trackClass = tone === "dark" ? "bg-black/25" : "bg-white/30";
  const fillClass = tone === "dark" ? "bg-black/70" : "bg-white/75";
  const thumbClass =
    tone === "dark"
      ? "bg-black shadow-[0_0_6px_rgba(0,0,0,0.15)]"
      : "bg-white shadow-[0_0_6px_rgba(0,0,0,0.35)]";
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
      aria-label="Seek"
      className={`relative h-4 ${disabled ? "cursor-default" : "cursor-pointer"}`}
      onPointerDown={(e) => {
        if (disabled) return;
        onSeekStart();
        seekFromClientX(e.clientX);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (disabled || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
        seekFromClientX(e.clientX);
      }}
      onPointerUp={(e) => {
        if (disabled) return;
        seekFromClientX(e.clientX);
        onSeekEnd();
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          onSeekEnd();
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
    >
      <div
        className={`absolute inset-x-0 top-1/2 h-px -translate-y-1/2 ${trackClass}`}
      />
      <div
        className={`absolute top-1/2 left-0 h-px -translate-y-1/2 ${fillClass}`}
        style={{ width: `${progress}%` }}
      />
      <div
        className={`absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 ${thumbClass}`}
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}

type TempestaPlayerProps = {
  streamUrl: string;
  title: string;
  inline?: boolean;
  showTitle?: boolean;
  tone?: PlayerTone;
};

export function TempestaPlayer({
  streamUrl,
  title,
  inline = false,
  showTitle = true,
  tone = "light",
}: TempestaPlayerProps) {
  const isDark = tone === "dark";
  const { playing, current, duration, setStreamUrl, togglePlay, seek } =
    useAudio();
  const isSeekingRef = useRef(false);
  const seekValueRef = useRef(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  useEffect(() => {
    setStreamUrl(streamUrl);
  }, [streamUrl, setStreamUrl]);

  const displayTime = isSeeking ? seekValue : current;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;
  const canSeek = duration > 0;

  return (
    <div className={inline ? "relative w-full" : "absolute inset-x-0 bottom-0 z-10"}>
      <div
        className={`font-garamond ${
          inline
            ? "space-y-0"
            : "space-y-2 bg-white/[0.04] px-4 py-3 backdrop-blur-[2px] sm:px-5 sm:py-3.5"
        }`}
      >
        {showTitle ? (
          <p
            className={`truncate text-site tracking-wide italic ${
              isDark
                ? "text-black"
                : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
            }`}
          >
            {title}
          </p>
        ) : null}

        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pausa" : "Play"}
            className={`flex h-[15px] w-[15px] shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-opacity hover:opacity-70 ${
              isDark
                ? "text-black"
                : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
            }`}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className="min-w-0 flex-1">
            <SeekBar
              progress={progress}
              disabled={!canSeek}
              tone={tone}
              onSeekStart={() => {
                isSeekingRef.current = true;
                setIsSeeking(true);
              }}
              onSeek={(ratio) => {
                const time = ratio * duration;
                seekValueRef.current = time;
                setSeekValue(time);
              }}
              onSeekEnd={() => {
                if (duration > 0) {
                  seek(seekValueRef.current);
                }
                isSeekingRef.current = false;
                setIsSeeking(false);
              }}
            />
          </div>

          <span
            className={`shrink-0 text-[12px] leading-[14px] tracking-wide sm:text-site sm:leading-site ${
              isDark
                ? "text-black/80"
                : "text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
            }`}
          >
            {formatTime(displayTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
