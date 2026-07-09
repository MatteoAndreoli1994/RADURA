"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gridShellClass } from "@/lib/grid";
import {
  getHomePhotoDesktopLayout,
  getHomePhotoObjectPosition,
  HOME_COVER,
  HOME_PHOTOS,
} from "@/lib/home-photos";
import styles from "@/components/HomeHeroGallery.module.css";

const LOOP_COPY_COUNT = 3;

// --- Desktop wheel (inerzia via lerp, eventi discreti) ---
const SCROLL_SLOWDOWN_FACTOR = 0.62;
const SMOOTHING_FACTOR = 0.14;
const DESKTOP_WHEEL_MAX_DELTA = 120;

// --- Mobile touch (drag quasi 1:1 + momentum al rilascio) ---
const MOBILE_TOUCH_SLOWDOWN_FACTOR = 1;
const MOBILE_TOUCH_MAX_DELTA = 175;
const MOBILE_MOMENTUM_FRICTION = 0.972;
const MOBILE_MOMENTUM_MIN_VELOCITY = 0.01;
const MOBILE_MOMENTUM_MAX_VELOCITY = 2.85;
const MOBILE_VELOCITY_SMOOTHING = 0.52;

const DESKTOP_ONLY_PHOTOS = new Set<string>([
  "/images/fotoRadura/12.webp",
  "/images/fotoRadura/24.jpg",
  "/images/fotoRadura/41.jpg",
]);
const DESKTOP_FORCE_FULL_WIDTH_PHOTOS = new Set<string>([
  "/images/fotoRadura/new4.jpg",
]);
const MOBILE_OBJECT_POSITIONS: Partial<Record<(typeof HOME_PHOTOS)[number], string>> = {
  "/images/fotoRadura/20.jpg": "85% center",
  "/images/fotoRadura/21.jpg": "28% center",
  "/images/fotoRadura/40.jpg": "30% center",
  "/images/fotoRadura/6.jpg": "70% center",
  "/images/fotoRadura/7.jpg": "58% center",
  "/images/fotoRadura/new1.jpg": "45% center",
};

type GalleryPhoto = {
  src: string;
  loopIndex: number;
  layoutIndex: number;
};

type GalleryRow = {
  key: string;
  span: "full" | "pair";
  photos: GalleryPhoto[];
};

function groupGalleryRows(photos: GalleryPhoto[]): GalleryRow[] {
  const rows: GalleryRow[] = [];
  let pending: GalleryPhoto[] = [];

  const flushPending = () => {
    if (!pending.length) return;
    if (pending.length === 1) {
      const [photo] = pending;
      rows.push({
        key: `full-single-${photo.loopIndex}`,
        span: "full",
        photos: [photo],
      });
      pending = [];
      return;
    }
    rows.push({
      key: `pair-${pending.map((photo) => photo.loopIndex).join("-")}`,
      span: "pair",
      photos: [...pending],
    });
    pending = [];
  };

  for (const photo of photos) {
    const layout = getHomePhotoDesktopLayout(photo.layoutIndex);
    const shouldForceFullWidth = DESKTOP_FORCE_FULL_WIDTH_PHOTOS.has(photo.src);
    if (layout.span === "full" || shouldForceFullWidth) {
      flushPending();
      rows.push({
        key: `full-${photo.loopIndex}`,
        span: "full",
        photos: [photo],
      });
      continue;
    }

    pending.push(photo);
    if (pending.length === 2) flushPending();
  }

  flushPending();
  return rows;
}

type HomePhotoProps = {
  src: string;
  alt: string;
  onLoad?: () => void;
  objectPosition?: string;
  priority?: boolean;
};

function HomePhoto({
  src,
  alt,
  onLoad,
  objectPosition,
  priority = false,
}: HomePhotoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={styles.image}
      // Solo le immagini "priority" (prima copia del loop) vengono caricate
      // subito: il resto è lazy, altrimenti il browser tenta di decodificare
      // decine di immagini duplicate (LOOP_COPY_COUNT = 3) durante lo scroll.
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
      onLoad={onLoad}
      style={objectPosition ? { objectPosition } : undefined}
    />
  );
}

export function HomeHeroGallery() {
  const [isDesktop, setIsDesktop] = useState(true);
  const scrollRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introHeightRef = useRef(0);
  const loopCycleHeightRef = useRef(0);
  const adjustingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Desktop: target + rAF loop per l'inerzia della rotellina.
  const smoothRafRef = useRef<number | null>(null);
  const smoothTargetScrollTopRef = useRef<number | null>(null);

  // Mobile: tracking per calcolare la velocità reale del dito.
  const touchYRef = useRef<number | null>(null);
  const touchLastTimeRef = useRef<number | null>(null);
  const touchVelocityRef = useRef(0); // px/ms, già "rallentata" dal fattore drag

  // Mobile: motore di inerzia (la "coda" dello scroll dopo il rilascio).
  const momentumRafRef = useRef<number | null>(null);
  const momentumLastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => setIsDesktop(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  const activePhotos = useMemo(() => {
    if (isDesktop) return [...HOME_PHOTOS];
    return HOME_PHOTOS.filter((src) => !DESKTOP_ONLY_PHOTOS.has(src));
  }, [isDesktop]);

  const homePhotoIndexFromLoop = useCallback(
    (loopIndex: number) => loopIndex % activePhotos.length,
    [activePhotos.length],
  );

  const loopCopies = useMemo(
    () => Array.from({ length: LOOP_COPY_COUNT }, () => [...activePhotos]).flat(),
    [activePhotos],
  );

  const galleryPhotos = useMemo(
    () =>
      loopCopies.map((src, loopIndex) => ({
        src,
        loopIndex,
        layoutIndex: homePhotoIndexFromLoop(loopIndex),
      })),
    [loopCopies],
  );

  const galleryRows = useMemo(
    () => groupGalleryRows(galleryPhotos),
    [galleryPhotos],
  );

  const measureHeights = useCallback(() => {
    const track = trackRef.current;
    const intro = introRef.current;
    if (!track || !intro) return;

    const introHeight = intro.offsetHeight;
    const loopHeight = track.offsetHeight;

    introHeightRef.current = introHeight;
    loopCycleHeightRef.current = loopHeight > 0 ? loopHeight / LOOP_COPY_COUNT : 0;
  }, []);

  const normalizeScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    const introHeight = introHeightRef.current;
    const loopCycleHeight = loopCycleHeightRef.current;
    if (!scrollEl || introHeight <= 0 || loopCycleHeight <= 0 || adjustingRef.current) return;

    const loopStart = introHeight;
    const stableRangeStart = loopStart + loopCycleHeight;
    const stableRangeEnd = loopStart + loopCycleHeight * 2;
    const { scrollTop } = scrollEl;
    const normalizeToStableRange = (value: number) => {
      const loopOffsetFromStableStart = value - stableRangeStart;
      const normalizedOffset =
        ((loopOffsetFromStableStart % loopCycleHeight) + loopCycleHeight) % loopCycleHeight;
      return stableRangeStart + normalizedOffset;
    };

    // Keep the natural cover->gallery transition untouched.
    // Normalize only after we pass two full loop copies.
    if (scrollTop < stableRangeEnd) return;

    adjustingRef.current = true;
    const normalizedScrollTop = normalizeToStableRange(scrollTop);
    scrollEl.scrollTop = normalizedScrollTop;
    const smoothTarget = smoothTargetScrollTopRef.current;
    if (smoothTarget !== null) {
      smoothTargetScrollTopRef.current = normalizeToStableRange(smoothTarget);
    }
    adjustingRef.current = false;
  }, []);

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const track = trackRef.current;
    if (!scrollEl || !track) return;

    const onScroll = () => {
      if (adjustingRef.current) return;
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        normalizeScroll();
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      const previousIntroHeight = introHeightRef.current;
      const previousLoopCycleHeight = loopCycleHeightRef.current;
      const previousLoopStart = previousIntroHeight;
      measureHeights();

      const introHeight = introHeightRef.current;
      const loopCycleHeight = loopCycleHeightRef.current;
      if (introHeight <= 0 || loopCycleHeight <= 0 || !scrollEl) return;

      if (scrollEl.scrollTop <= 0) {
        scrollEl.scrollTop = 0;
        return;
      }

      if (
        previousIntroHeight <= 0 ||
        previousLoopCycleHeight <= 0 ||
        scrollEl.scrollTop < previousLoopStart
      ) {
        return;
      }

      const loopOffset = scrollEl.scrollTop - previousLoopStart;
      const loopRatio = loopOffset / previousLoopCycleHeight;

      adjustingRef.current = true;
      scrollEl.scrollTop = introHeight + loopRatio * loopCycleHeight;
      adjustingRef.current = false;
    });

    resizeObserver.observe(track);
    const intro = introRef.current;
    if (intro) resizeObserver.observe(intro);

    // ============================================================
    // DESKTOP — rotellina: inerzia via lerp verso un target (ok per
    // eventi discreti come il wheel).
    // ============================================================
    const startSmoothScroll = () => {
      if (smoothRafRef.current !== null) return;

      const tick = () => {
        const target = smoothTargetScrollTopRef.current;
        if (target === null) {
          smoothRafRef.current = null;
          return;
        }

        const current = scrollEl.scrollTop;
        const next = current + (target - current) * SMOOTHING_FACTOR;
        scrollEl.scrollTop = next;

        if (Math.abs(target - next) < 0.5) {
          scrollEl.scrollTop = target;
          smoothTargetScrollTopRef.current = null;
          smoothRafRef.current = null;
          return;
        }

        smoothRafRef.current = requestAnimationFrame(tick);
      };

      smoothRafRef.current = requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      if (!isDesktop) return;
      event.preventDefault();

      const maxScrollTop = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
      const baseTarget = smoothTargetScrollTopRef.current ?? scrollEl.scrollTop;
      const clampedDelta = Math.max(
        -DESKTOP_WHEEL_MAX_DELTA,
        Math.min(DESKTOP_WHEEL_MAX_DELTA, event.deltaY),
      );
      const slowedDelta = clampedDelta * SCROLL_SLOWDOWN_FACTOR;
      const nextTarget = Math.max(0, Math.min(maxScrollTop, baseTarget + slowedDelta));
      smoothTargetScrollTopRef.current = nextTarget;
      startSmoothScroll();
    };

    // ============================================================
    // MOBILE — touch: durante il drag lo scroll segue il dito (con
    // il fattore di rallentamento), applicato via rAF per restare
    // fluido. Al rilascio parte un motore di inerzia indipendente
    // dal framerate, che decelera in base alla velocità reale del
    // dito appena prima del rilascio: è la "coda" dello scroll.
    // ============================================================
    const stopMomentum = () => {
      if (momentumRafRef.current !== null) {
        cancelAnimationFrame(momentumRafRef.current);
      }
      momentumRafRef.current = null;
      momentumLastTimeRef.current = null;
      touchVelocityRef.current = 0;
    };

    const momentumTick = (timestamp: number) => {
      const scrollEl2 = scrollRef.current;
      if (!scrollEl2) {
        stopMomentum();
        return;
      }

      if (momentumLastTimeRef.current === null) {
        momentumLastTimeRef.current = timestamp;
        momentumRafRef.current = requestAnimationFrame(momentumTick);
        return;
      }

      const dt = timestamp - momentumLastTimeRef.current;
      momentumLastTimeRef.current = timestamp;

      const velocity = touchVelocityRef.current;
      if (Math.abs(velocity) < MOBILE_MOMENTUM_MIN_VELOCITY) {
        stopMomentum();
        return;
      }

      const maxScrollTop = Math.max(0, scrollEl2.scrollHeight - scrollEl2.clientHeight);
      const distance = velocity * dt;
      const next = Math.max(0, Math.min(maxScrollTop, scrollEl2.scrollTop + distance));
      scrollEl2.scrollTop = next;

      // Stop se abbiamo raggiunto un limite: evita di "spingere" contro il bordo.
      if (next === 0 || next === maxScrollTop) {
        stopMomentum();
        return;
      }

      // Decadimento frame-rate independent, così la coda ha sempre
      // la stessa "sensazione" indipendentemente dagli fps del device.
      const decay = Math.pow(MOBILE_MOMENTUM_FRICTION, dt / 16.6667);
      touchVelocityRef.current = velocity * decay;

      momentumRafRef.current = requestAnimationFrame(momentumTick);
    };

    const startMomentum = () => {
      if (Math.abs(touchVelocityRef.current) < MOBILE_MOMENTUM_MIN_VELOCITY) return;
      if (momentumRafRef.current !== null) return;
      momentumLastTimeRef.current = null;
      momentumRafRef.current = requestAnimationFrame(momentumTick);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (isDesktop) return;
      // Un nuovo tocco interrompe subito qualunque inerzia residua.
      stopMomentum();

      if (event.touches.length !== 1) {
        touchYRef.current = null;
        touchLastTimeRef.current = null;
        return;
      }
      touchYRef.current = event.touches[0]?.clientY ?? null;
      touchLastTimeRef.current = performance.now();
    };

    const onTouchMove = (event: TouchEvent) => {
      if (isDesktop) return;
      if (event.touches.length !== 1) {
        touchYRef.current = null;
        touchLastTimeRef.current = null;
        return;
      }

      const currentTouchY = event.touches[0]?.clientY;
      const lastTouchY = touchYRef.current;
      const now = performance.now();
      const lastTime = touchLastTimeRef.current;

      if (currentTouchY === undefined || lastTouchY === null || lastTime === null) {
        touchYRef.current = currentTouchY ?? null;
        touchLastTimeRef.current = now;
        return;
      }

      event.preventDefault();
      const rawDelta = lastTouchY - currentTouchY;
      const dt = Math.max(1, now - lastTime); // evita divisioni per ~0

      touchYRef.current = currentTouchY;
      touchLastTimeRef.current = now;

      const maxScrollTop = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
      const baseTarget = scrollEl.scrollTop;
      const clampedDelta = Math.max(
        -MOBILE_TOUCH_MAX_DELTA,
        Math.min(MOBILE_TOUCH_MAX_DELTA, rawDelta),
      );
      const slowedDelta = clampedDelta * MOBILE_TOUCH_SLOWDOWN_FACTOR;
      const nextTarget = Math.max(0, Math.min(maxScrollTop, baseTarget + slowedDelta));

      scrollEl.scrollTop = nextTarget;

      // Velocità istantanea del movimento "già rallentato", smussata
      // con una media mobile per non avere una coda nervosa/erratica.
      const instantVelocity = Math.max(
        -MOBILE_MOMENTUM_MAX_VELOCITY,
        Math.min(MOBILE_MOMENTUM_MAX_VELOCITY, slowedDelta / dt),
      );
      touchVelocityRef.current =
        touchVelocityRef.current * (1 - MOBILE_VELOCITY_SMOOTHING) +
        instantVelocity * MOBILE_VELOCITY_SMOOTHING;
    };

    const onTouchEnd = () => {
      touchYRef.current = null;
      touchLastTimeRef.current = null;
      startMomentum();
    };

    scrollEl.addEventListener("wheel", onWheel, { passive: false });
    if (!isDesktop) {
      scrollEl.addEventListener("touchstart", onTouchStart, { passive: true });
      scrollEl.addEventListener("touchmove", onTouchMove, { passive: false });
      scrollEl.addEventListener("touchend", onTouchEnd, { passive: true });
      scrollEl.addEventListener("touchcancel", onTouchEnd, { passive: true });
    }

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    measureHeights();

    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      scrollEl.removeEventListener("wheel", onWheel);
      scrollEl.removeEventListener("touchstart", onTouchStart);
      scrollEl.removeEventListener("touchmove", onTouchMove);
      scrollEl.removeEventListener("touchend", onTouchEnd);
      scrollEl.removeEventListener("touchcancel", onTouchEnd);
      resizeObserver.disconnect();

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (smoothRafRef.current !== null) cancelAnimationFrame(smoothRafRef.current);
      if (momentumRafRef.current !== null) cancelAnimationFrame(momentumRafRef.current);

      smoothRafRef.current = null;
      smoothTargetScrollTopRef.current = null;
      momentumRafRef.current = null;
      momentumLastTimeRef.current = null;
      touchVelocityRef.current = 0;
      touchYRef.current = null;
      touchLastTimeRef.current = null;
    };
  }, [isDesktop, measureHeights, normalizeScroll]);

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const onHomeReset = () => {
      if (smoothRafRef.current !== null) cancelAnimationFrame(smoothRafRef.current);
      if (momentumRafRef.current !== null) cancelAnimationFrame(momentumRafRef.current);

      smoothRafRef.current = null;
      smoothTargetScrollTopRef.current = null;
      momentumRafRef.current = null;
      momentumLastTimeRef.current = null;
      touchVelocityRef.current = 0;
      touchYRef.current = null;
      touchLastTimeRef.current = null;
      adjustingRef.current = false;
      scrollEl.scrollTop = 0;
    };

    window.addEventListener("radura:home-scroll-reset", onHomeReset as EventListener);
    return () => {
      window.removeEventListener("radura:home-scroll-reset", onHomeReset as EventListener);
    };
  }, []);

  return (
    <section
      ref={scrollRef}
      id="home"
      className={styles.scrollRoot}
      data-internal-scroll
      data-lenis-prevent
    >
      <div ref={introRef} className={styles.cover} data-home-cover>
        <HomePhoto
          src={HOME_COVER}
          alt="Radura"
          onLoad={measureHeights}
          priority
        />
        <div className={styles.coverCta}>
          <Link href="/music/acque" className={styles.coverCtaLink}>
            Listen to &lsquo;Acque&rsquo; &mdash; Out now
          </Link>
        </div>
      </div>

      <div className={`${gridShellClass} ${styles.shell} in-flow-page-content`}>
        <div className={styles.grid}>
          <div className={styles.galleryCol}>
            <div ref={trackRef} className={styles.track}>
              {galleryRows.map((row) => (
                <div
                  key={row.key}
                  className={`${styles.photoRow}${
                    row.span === "full" || row.photos.length === 1
                      ? ` ${styles.photoRowFull}`
                      : ""
                  }`}
                >
                  {row.photos.map((photo) => {
                    const photoSrc = photo.src as (typeof HOME_PHOTOS)[number];
                    const objectPosition = isDesktop
                      ? getHomePhotoObjectPosition(photoSrc)
                      : MOBILE_OBJECT_POSITIONS[photoSrc] ?? getHomePhotoObjectPosition(photoSrc);

                    return (
                      <div key={`${photo.loopIndex}-${photo.src}`} className={styles.photoItem}>
                        <HomePhoto
                          src={photo.src}
                          alt={`Radura ${photo.layoutIndex + 1}`}
                          priority={photo.loopIndex < activePhotos.length}
                          objectPosition={objectPosition}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}