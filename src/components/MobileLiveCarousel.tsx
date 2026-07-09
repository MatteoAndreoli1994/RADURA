"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";

type MobileLiveImage = {
  src: string;
  alt: string;
  aspect: string;
  fit: "cover" | "contain";
};

type MobileLiveCarouselProps = {
  images: readonly MobileLiveImage[];
  startIndex: number;
};

const LOOP_SETS = 3;

function centerSlide(container: HTMLElement, slide: HTMLElement) {
  const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
  const containerCenter = container.clientWidth / 2;
  container.scrollLeft = slideCenter - containerCenter;
}

function getCenteredSlideIndex(
  container: HTMLElement,
  slides: (HTMLElement | null)[],
) {
  const centerX = container.scrollLeft + container.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  slides.forEach((slide, index) => {
    if (!slide) return;
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(slideCenter - centerX);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export function MobileLiveCarousel({
  images,
  startIndex,
}: MobileLiveCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const loopReadyRef = useRef(false);
  const isAdjustingRef = useRef(false);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const loopedImages = useMemo(
    () => Array.from({ length: LOOP_SETS }, () => images).flat(),
    [images],
  );

  const normalizeLoop = useCallback(() => {
    if (!loopReadyRef.current || isAdjustingRef.current) return;

    const container = scrollRef.current;
    if (!container) return;

    const centeredIndex = getCenteredSlideIndex(container, slideRefs.current);
    const setIndex = Math.floor(centeredIndex / images.length);
    const indexInSet = centeredIndex % images.length;

    if (setIndex === 0) {
      const target = slideRefs.current[images.length + indexInSet];
      if (!target) return;
      isAdjustingRef.current = true;
      centerSlide(container, target);
      isAdjustingRef.current = false;
      return;
    }

    if (setIndex === LOOP_SETS - 1) {
      const target = slideRefs.current[images.length + indexInSet];
      if (!target) return;
      isAdjustingRef.current = true;
      centerSlide(container, target);
      isAdjustingRef.current = false;
    }
  }, [images.length]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    const slide = slideRefs.current[images.length + startIndex];
    if (!container || !slide) return;

    centerSlide(container, slide);
    loopReadyRef.current = true;
  }, [images.length, startIndex]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scheduleNormalize = () => {
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
      scrollEndTimerRef.current = setTimeout(normalizeLoop, 120);
    };

    const handleScrollEnd = () => {
      normalizeLoop();
    };

    container.addEventListener("scroll", scheduleNormalize, { passive: true });
    container.addEventListener("scrollend", handleScrollEnd);

    return () => {
      container.removeEventListener("scroll", scheduleNormalize);
      container.removeEventListener("scrollend", handleScrollEnd);
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, [normalizeLoop]);

  return (
    <div
      ref={scrollRef}
      className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:gap-4 sm:px-8 md:hidden [&::-webkit-scrollbar]:hidden"
      aria-label="Galleria live"
    >
      {loopedImages.map((img, index) => (
        <figure
          key={`${img.src}-${index}`}
          ref={(node) => {
            slideRefs.current[index] = node;
          }}
          className={`relative shrink-0 snap-center overflow-hidden ${img.aspect} w-[min(68vw,260px)]`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority
            loading="eager"
            sizes="68vw"
            className={
              img.fit === "contain" ? "object-contain" : "object-cover"
            }
          />
        </figure>
      ))}
    </div>
  );
}
