"use client";

import { useRef, useState } from "react";
import { useAudio } from "@/components/AudioProvider";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import styles from "@/components/AboutDesktopPlayer.module.css";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={styles.playIcon}>
      <path d="M4 2.5v11l9-5.5L4 2.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={styles.playIcon}>
      <path d="M4 2.5h3v11H4v-11zm5 0h3v11H9v-11z" />
    </svg>
  );
}

type AboutDesktopPlayerProps = {
  className?: string;
};

export function AboutDesktopPlayer({ className = "" }: AboutDesktopPlayerProps) {
  const {
    nowPlaying,
    isPlaying,
    togglePlayback,
    openRelease,
  } = useBandcampSession();
  const { current, duration, seek } = useAudio();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const seekValueRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const displayTime = isSeeking ? seekValue : current;
  const activeDuration = duration > 0 ? duration : (nowPlaying?.duration ?? 0);
  const progress =
    activeDuration > 0 ? (displayTime / activeDuration) * 100 : 0;
  const canSeek = activeDuration > 0 && Boolean(nowPlaying);

  function seekFromClientX(clientX: number) {
    const track = trackRef.current;
    if (!track || !canSeek) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const time = ratio * activeDuration;
    seekValueRef.current = time;
    setSeekValue(time);
  }

  const trackTitle = nowPlaying?.trackTitle ?? "Desiderare";
  const totalTime = activeDuration > 0 ? activeDuration : 409;

  return (
    <div
      className={`${styles.shell} ${className}`.trim()}
      role="region"
      aria-label="Music player"
    >
      <button
        type="button"
        onClick={() => {
          if (nowPlaying) togglePlayback();
        }}
        disabled={!nowPlaying}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={styles.playButton}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <button
        type="button"
        onClick={() => {
          if (nowPlaying) openRelease(nowPlaying.releaseId);
        }}
        disabled={!nowPlaying}
        className={styles.trackTitle}
      >
        {trackTitle}
      </button>

      <span className={styles.time}>{formatTime(displayTime)}</span>

      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Track position"
        className={`${styles.seekTrack} ${canSeek ? styles.seekTrackActive : ""}`}
        onPointerDown={(event) => {
          if (!canSeek) return;
          setIsSeeking(true);
          seekFromClientX(event.clientX);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!canSeek || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
          seekFromClientX(event.clientX);
        }}
        onPointerUp={(event) => {
          if (!canSeek) return;
          seekFromClientX(event.clientX);
          seek(seekValueRef.current);
          setIsSeeking(false);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            setIsSeeking(false);
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
      >
        <div className={styles.seekLine} />
        <div className={styles.seekProgress} style={{ width: `${progress}%` }} />
        <div className={styles.seekThumb} style={{ left: `${progress}%` }} />
      </div>

      <span className={styles.time}>{formatTime(totalTime)}</span>
    </div>
  );
}
