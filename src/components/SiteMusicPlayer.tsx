"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAudio } from "@/components/AudioProvider";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [marquee, setMarquee] = useState(false);
  const [marqueeDuration, setMarqueeDuration] = useState(12);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;

    const update = () => {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      if (!mobile) {
        setMarquee(false);
        return;
      }

      const overflow = text.scrollWidth > wrap.clientWidth + 1;
      setMarquee(overflow);
      if (overflow) {
        setMarqueeDuration(Math.max(6, text.scrollWidth / 22));
      }
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(wrap);

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    mediaQuery.addEventListener("change", update);

    return () => {
      resizeObserver.disconnect();
      mediaQuery.removeEventListener("change", update);
    };
  }, [title]);

  return (
    <div ref={wrapRef} className={styles.trackTitleWrap}>
      <button
        type="button"
        onClick={onClick}
        aria-label={title}
        className={`${styles.trackTitle}${marquee ? ` ${styles.trackTitleScroll}` : ""}`}
        title={title}
        style={
          marquee
            ? ({ "--marquee-duration": `${marqueeDuration}s` } as React.CSSProperties)
            : undefined
        }
      >
        {marquee ? (
          <span className={styles.trackTitleMarqueeTrack} aria-hidden="true">
            <span ref={textRef} className={styles.trackTitleText}>
              {title}
            </span>
            <span className={styles.trackTitleText}>{title}</span>
          </span>
        ) : (
          <span ref={textRef} className={styles.trackTitleText}>
            {title}
          </span>
        )}
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
    openRelease,
    stopPlayback,
  } = useBandcampSession();
  const { current, duration, seek } = useAudio();
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [lyricsMounted, setLyricsMounted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [lyricsFade, setLyricsFade] = useState({ top: false, bottom: false });
  const lyricsBodyRef = useRef<HTMLDivElement>(null);
  const seekValueRef = useRef(0);

  function updateLyricsFade() {
    const el = lyricsBodyRef.current;
    if (!el) return;
    const top = el.scrollTop > 1;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setLyricsFade((prev) =>
      prev.top === top && prev.bottom === bottom ? prev : { top, bottom },
    );
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  const visible =
    Boolean(nowPlaying) &&
    (playbackEngaged || viewReleaseId === nowPlaying?.releaseId);

  useEffect(() => {
    if (!visible) {
      setLyricsOpen(false);
      setLyricsMounted(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!lyricsOpen || !lyricsMounted) return;
    updateLyricsFade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lyricsOpen, lyricsMounted, visible, nowPlaying?.trackId]);

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
  const currentTrack = tracks.find((item) => item.id === nowPlaying.trackId);
  const currentLyrics = currentTrack?.lyrics?.trim() ?? "";

  const lyricsMaskTop = lyricsFade.top ? "transparent 0, #000 28px" : "#000 0";
  const lyricsMaskBottom = lyricsFade.bottom
    ? "#000 calc(100% - 28px), transparent 100%"
    : "#000 100%";
  const lyricsMask = `linear-gradient(to bottom, ${lyricsMaskTop}, ${lyricsMaskBottom})`;
  const displayTime = isSeeking ? seekValue : current;
  const activeDuration = duration > 0 ? duration : nowPlaying.duration;
  const progress = activeDuration > 0 ? displayTime / activeDuration : 0;
  const canSeek = activeDuration > 0;

  function openCurrentRelease() {
    if (!nowPlaying) return;
    openRelease(nowPlaying.releaseId);
  }

  function openLyrics() {
    setLyricsMounted(true);
    setLyricsOpen(true);
  }

  function closeLyrics() {
    if (!lyricsMounted) return;
    setLyricsOpen(false);
  }

  function toggleLyrics() {
    if (lyricsOpen) closeLyrics();
    else openLyrics();
  }

  function handleLyricsAnimationEnd(event: React.AnimationEvent<HTMLElement>) {
    if (event.currentTarget !== event.target) return;
    if (!lyricsOpen) setLyricsMounted(false);
  }

  function closePlayer() {
    closeLyrics();
    stopPlayback();
  }

  return createPortal(
    <div className={`${styles.shell} site-mobile-player`} role="region" aria-label="Music player">
      {lyricsMounted ? (
        <button
          type="button"
          aria-label="Chiudi testo"
          className={`${styles.lyricsBackdrop} ${
            lyricsOpen ? styles.lyricsBackdropOpen : styles.lyricsBackdropClosing
          }`}
          onClick={closeLyrics}
        />
      ) : null}

      {lyricsMounted ? (
        <aside
          className={`${styles.lyricsSheet} ${
            lyricsOpen ? styles.lyricsSheetOpen : styles.lyricsSheetClosing
          }`}
          role="dialog"
          aria-label={`Testo di ${nowPlaying.trackTitle}`}
          onAnimationEnd={handleLyricsAnimationEnd}
        >
          <p className={styles.lyricsTitle}>{nowPlaying.trackTitle}</p>
          <div
            ref={lyricsBodyRef}
            className={styles.lyricsBody}
            onScroll={updateLyricsFade}
            style={{
              WebkitMaskImage: lyricsMask,
              maskImage: lyricsMask,
            }}
          >
            {currentLyrics ? (
              <p className={styles.lyricsText}>{currentLyrics}</p>
            ) : (
              <p className={styles.lyricsEmpty}>No lyrics available.</p>
            )}
          </div>
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

        <div className={styles.rightControls}>
          <span className={styles.time}>
            <span className={styles.timeCurrent}>{formatClock(displayTime)}</span>
            <span className={styles.timeTotal} aria-hidden="true">
              {" | "}
              {formatClock(activeDuration)}
            </span>
          </span>

          <button
            type="button"
            aria-label={lyricsOpen ? "Chiudi testo" : "Mostra testo"}
            aria-expanded={lyricsOpen}
            className={styles.lyricsButton}
            onClick={(event) => {
              event.stopPropagation();
              toggleLyrics();
            }}
          >
            <span className={styles.lyricsButtonGlyph}>A</span>
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
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
