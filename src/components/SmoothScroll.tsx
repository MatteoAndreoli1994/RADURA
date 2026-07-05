"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { useScrollControl } from "@/components/ScrollControl";
import "lenis/dist/lenis.css";

const DEFAULT_LERP = 0.07;
const DEFAULT_DURATION = 1.35;
const LOCKED_LERP = 0.48;
const LOCKED_DURATION = 0.55;
const LOCKED_WHEEL_FACTOR = 0.52;
const MOBILE_LOCKED_WHEEL_FACTOR = 0.26;
const MOBILE_MAX_WIDTH = 767;

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { isPlayerScrollLocked } = useScrollControl();
  const lenisRef = useRef<Lenis | null>(null);
  const lockRef = useRef(false);
  const wasLockedRef = useRef(false);

  useEffect(() => {
    lockRef.current = isPlayerScrollLocked;

    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.options.lerp = isPlayerScrollLocked ? LOCKED_LERP : DEFAULT_LERP;
    lenis.options.duration = isPlayerScrollLocked
      ? LOCKED_DURATION
      : DEFAULT_DURATION;

    if (isPlayerScrollLocked !== wasLockedRef.current) {
      lenis.scrollTo(lenis.scroll, { immediate: true });
    }

    wasLockedRef.current = isPlayerScrollLocked;
  }, [isPlayerScrollLocked]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: DEFAULT_LERP,
      duration: DEFAULT_DURATION,
      smoothWheel: true,
      autoRaf: true,
      anchors: true,
      virtualScroll: (data) => {
        if (!lockRef.current) return true;

        const wheelFactor =
          window.innerWidth <= MOBILE_MAX_WIDTH
            ? MOBILE_LOCKED_WHEEL_FACTOR
            : LOCKED_WHEEL_FACTOR;
        data.deltaY *= wheelFactor;
        data.deltaX *= wheelFactor;
        return true;
      },
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return children;
}
