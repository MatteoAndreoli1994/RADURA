"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { gridShellClass } from "@/lib/grid";
import { getHomePhotoDesktopLayout, getHomePhotoObjectPosition, HOME_PHOTOS } from "@/lib/home-photos";
import styles from "@/components/HomeHeroGallery.module.css";

const LOOP_COPY_COUNT = 2;
const LOOP_PHOTOS = [...HOME_PHOTOS.slice(1), HOME_PHOTOS[0]];

function loopPhotoNumber(loopIndex: number) {
  return loopIndex === LOOP_PHOTOS.length - 1 ? 1 : loopIndex + 2;
}

function homePhotoIndexFromLoop(loopIndex: number) {
  const index = loopIndex % LOOP_PHOTOS.length;
  return index === LOOP_PHOTOS.length - 1 ? 0 : index + 1;
}

function photoItemClassName(photoIndex: number) {
  const layout = getHomePhotoDesktopLayout(photoIndex);
  return [
    styles.photoItem,
    layout.span === "full" ? styles.photoItemFull : styles.photoItemHalf,
    layout.orientation === "portrait"
      ? styles.photoItemPortrait
      : styles.photoItemLandscape,
  ].join(" ");
}

type HomePhotoProps = {
  src: string;
  alt: string;
  priority?: boolean;
  onLoad?: () => void;
  objectPosition?: string;
};

function HomePhoto({
  src,
  alt,
  priority = false,
  onLoad,
  objectPosition,
}: HomePhotoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={styles.image}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onLoad={onLoad}
      style={objectPosition ? { objectPosition } : undefined}
    />
  );
}

export function HomeHeroGallery() {
  const scrollRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introHeightRef = useRef(0);
  const loopCycleHeightRef = useRef(0);
  const adjustingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const loopCopies = useMemo(
    () => Array.from({ length: LOOP_COPY_COUNT }, () => [...LOOP_PHOTOS]).flat(),
    [],
  );

  const measureHeights = useCallback(() => {
    const track = trackRef.current;
    const intro = introRef.current;
    if (!track || !intro) return;

    const introHeight = intro.offsetHeight;
    const loopHeight = track.offsetHeight - introHeight;

    introHeightRef.current = introHeight;
    loopCycleHeightRef.current = loopHeight > 0 ? loopHeight / LOOP_COPY_COUNT : 0;
  }, []);

  const normalizeScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    const introHeight = introHeightRef.current;
    const loopCycleHeight = loopCycleHeightRef.current;
    if (!scrollEl || introHeight <= 0 || loopCycleHeight <= 0 || adjustingRef.current) return;

    const loopStart = introHeight;
    const loopEnd = introHeight + loopCycleHeight;
    const { scrollTop } = scrollEl;

    if (scrollTop < loopEnd) return;

    adjustingRef.current = true;
    const loopOffset = scrollTop - loopStart;
    const normalizedOffset = loopOffset % loopCycleHeight;
    scrollEl.scrollTop = loopStart + normalizedOffset;
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
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    measureHeights();

    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [measureHeights, normalizeScroll]);

  return (
    <section
      ref={scrollRef}
      id="home"
      className={styles.scrollRoot}
      data-internal-scroll
      data-lenis-prevent
    >
      <div className={`${gridShellClass} ${styles.shell} in-flow-page-content`}>
        <div className={styles.grid}>
          <div className={styles.galleryCol}>
            <div ref={trackRef} className={styles.track}>
              <div ref={introRef} className={photoItemClassName(0)}>
                <HomePhoto
                  src={HOME_PHOTOS[0]}
                  alt="Radura 1"
                  priority
                  onLoad={measureHeights}
                  objectPosition={getHomePhotoObjectPosition(HOME_PHOTOS[0])}
                />
              </div>

              {loopCopies.map((src, index) => {
                const photoIndex = loopPhotoNumber(index % LOOP_PHOTOS.length);
                const layoutIndex = homePhotoIndexFromLoop(index % LOOP_PHOTOS.length);
                const objectPosition = getHomePhotoObjectPosition(src);

                return (
                  <div key={`${index}-${src}`} className={photoItemClassName(layoutIndex)}>
                    <HomePhoto
                      src={src}
                      alt={`Radura ${photoIndex}`}
                      priority={index < 2}
                      onLoad={measureHeights}
                      objectPosition={objectPosition}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
