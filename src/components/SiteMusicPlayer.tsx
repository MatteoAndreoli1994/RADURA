"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAudio } from "@/components/AudioProvider";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { RELEASES } from "@/lib/releases";
import styles from "@/components/SiteMusicPlayer.module.css";

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function PlayIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M4 2.5v11l9-5.5L4 2.5z" />
    </svg>
  );
}

function PauseIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M4 2.5h3v11H4v-11zm5 0h3v11H9v-11z" />
    </svg>
  );
}

function SkipBackIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M1.5 2.5h1.75v11H1.5V2.5zm1.75 0L10.5 2.5 3.25 8l7.25 5.5V2.5z" />
    </svg>
  );
}

function SkipForwardIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M3.25 2.5L10.5 8 3.25 13.5V2.5zM10.5 2.5h1.75v11H10.5V2.5z" />
    </svg>
  );
}

function CloseIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M4.25 4.25L11.75 11.75M11.75 4.25L4.25 11.75"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

type SliderProps = {
  value: number;
  disabled?: boolean;
  className?: string;
  trackClassName?: string;
  onChange: (value: number) => void;
  onChangeEnd?: () => void;
  ariaLabel: string;
};

function HorizontalSlider({
  value,
  disabled = false,
  className,
  trackClassName,
  onChange,
  onChangeEnd,
  ariaLabel,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function updateFromClientX(clientX: number) {
    const track = trackRef.current;
    if (!track || disabled) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onChange(ratio);
  }

  return (
    <div className={className}>
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-label={ariaLabel}
        className={`${styles.seekTrack} ${trackClassName ?? ""} ${
          disabled ? styles.seekTrackDisabled : ""
        }`}
        style={{ "--slider-ratio": value } as React.CSSProperties}
        onPointerDown={(event) => {
          if (disabled) return;
          updateFromClientX(event.clientX);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
          updateFromClientX(event.clientX);
        }}
        onPointerUp={(event) => {
          if (disabled) return;
          updateFromClientX(event.clientX);
          onChangeEnd?.();
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            onChangeEnd?.();
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
      >
        <div className={styles.seekProgress} style={{ width: `${value * 100}%` }} />
        <div className={styles.seekThumb} />
      </div>
    </div>
  );
}

function TrackTitleButton({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div className={styles.trackTitleWrap}>
      <button
        type="button"
        onClick={onClick}
        className={styles.trackTitle}
        title={title}
      >
        <span className={styles.trackTitleText}>{title}</span>
      </button>
    </div>
  );
}

export function SiteMusicPlayer() {
  const {
    nowPlaying,
    isPlaying,
    playbackEngaged,
    viewReleaseId,
    togglePlayback,
    playNext,
    playPrevious,
    canPlayNext,
    canPlayPrevious,
    getReleaseTracks,
    playTrack,
    openRelease,
    stopPlayback,
  } = useBandcampSession();
  const { current, duration, seek, volume, setVolume } = useAudio();
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [mounted, setMounted] = useState(false);
  const seekValueRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visible =
    Boolean(nowPlaying) &&
    (playbackEngaged || viewReleaseId === nowPlaying?.releaseId);

  useEffect(() => {
    if (!visible) setPlaylistOpen(false);
  }, [visible]);

  useLayoutEffect(() => {
    const root = document.documentElement;

    if (!visible) {
      root.style.setProperty("--site-music-player-height", "0px");
      root.classList.remove("site-has-mobile-player");
      return () => {
        root.style.setProperty("--site-music-player-height", "0px");
        root.classList.remove("site-has-mobile-player");
      };
    }

    root.classList.add("site-has-mobile-player");
    const barOffset = getComputedStyle(root)
      .getPropertyValue("--site-music-player-bar-offset")
      .trim();
    root.style.setProperty("--site-music-player-height", barOffset || "0px");

    return () => {
      root.style.setProperty("--site-music-player-height", "0px");
      root.classList.remove("site-has-mobile-player");
    };
  }, [visible]);

  if (!visible || !nowPlaying || !mounted) return null;

  const tracks = getReleaseTracks(nowPlaying.releaseId);
  const release = RELEASES.find((item) => item.id === nowPlaying.releaseId);
  const displayTime = isSeeking ? seekValue : current;
  const activeDuration = duration > 0 ? duration : nowPlaying.duration;
  const progress = activeDuration > 0 ? displayTime / activeDuration : 0;
  const canSeek = activeDuration > 0;

  function openCurrentRelease() {
    if (!nowPlaying) return;
    openRelease(nowPlaying.releaseId);
  }

  function playTrackFromPlaylist(trackId: number) {
    if (!release) return;
    const track = tracks.find((item) => item.id === trackId);
    if (!track) return;
    playTrack(release, track, tracks);
    setPlaylistOpen(false);
  }

  function closePlayer() {
    setPlaylistOpen(false);
    stopPlayback();
  }

  return createPortal(
    <div className={`${styles.shell} site-mobile-player`} role="region" aria-label="Music player">
      {playlistOpen ? (
        <aside
          className={styles.playlistSheet}
          role="dialog"
          aria-label={`Tracce di ${nowPlaying.releaseTitle}`}
        >
          <p className={styles.playlistReleaseTitle}>{nowPlaying.releaseTitle}</p>
          <nav aria-label="Playlist" className={styles.playlistNav}>
            <ul className={styles.playlistList}>
              {tracks.map((track) => {
                const isActive =
                  nowPlaying.trackId === track.id && nowPlaying.releaseId === release?.id;
                return (
                  <li key={track.id} className={styles.playlistItem}>
                    <button
                      type="button"
                      className={`${styles.playlistTrackButton} ${
                        isActive ? styles.playlistTrackButtonActive : ""
                      }`}
                      onClick={() => playTrackFromPlaylist(track.id)}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {track.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      ) : null}

      <div className={styles.shellInner}>
        <div className={styles.transport}>
          <button
            type="button"
            onClick={playPrevious}
            disabled={!canPlayPrevious}
            aria-label="Traccia precedente"
            className={styles.transportButton}
          >
            <SkipBackIcon className={styles.transportIcon} />
          </button>
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pausa" : "Riproduci"}
            className={styles.transportButton}
          >
            {isPlaying ? (
              <PauseIcon className={styles.transportIcon} />
            ) : (
              <PlayIcon className={styles.transportIcon} />
            )}
          </button>
          <button
            type="button"
            onClick={playNext}
            disabled={!canPlayNext}
            aria-label="Traccia successiva"
            className={styles.transportButton}
          >
            <SkipForwardIcon className={styles.transportIcon} />
          </button>
        </div>

        <TrackTitleButton title={nowPlaying.trackTitle} onClick={openCurrentRelease} />

        <HorizontalSlider
          className={styles.seekArea}
          value={progress}
          disabled={!canSeek}
          ariaLabel="Posizione traccia"
          onChange={(ratio) => {
            const time = ratio * activeDuration;
            seekValueRef.current = time;
            setSeekValue(time);
            setIsSeeking(true);
          }}
          onChangeEnd={() => {
            if (canSeek) seek(seekValueRef.current);
            setIsSeeking(false);
          }}
        />

        <span className={styles.time}>
          {formatClock(displayTime)}|{formatClock(activeDuration)}
        </span>

        <HorizontalSlider
          className={styles.volumeArea}
          trackClassName={styles.volumeTrack}
          value={volume}
          ariaLabel="Volume"
          onChange={setVolume}
        />

        <div className={styles.menuWrap}>
          <button
            type="button"
            aria-label="Apri playlist"
            aria-expanded={playlistOpen}
            className={styles.menuButton}
            onClick={(event) => {
              event.stopPropagation();
              setPlaylistOpen((open) => !open);
            }}
          >
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
          </button>
          <button
            type="button"
            aria-label="Chiudi player"
            className={styles.closeButton}
            onClick={(event) => {
              event.stopPropagation();
              closePlayer();
            }}
          >
            <CloseIcon className={styles.transportIcon} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
