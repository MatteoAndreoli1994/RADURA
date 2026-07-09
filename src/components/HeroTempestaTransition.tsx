"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollControl } from "@/components/ScrollControl";
import {
  ScrollTitleStage,
  TempestaTitleOverlay,
} from "@/components/ScrollTitleStage";
import { Hero } from "@/components/sections/Hero";
import { TempestaPanel } from "@/components/sections/TempestaPanel";

const HERO_IMAGE_SCALE = 1.65;
const TEMPESTA_PAN_SCALE = 1.48;

const TEMPESTA_BG_TOP_MARGIN = 0.12;

const HERO_TITLE_VIEWPORT_ANCHOR = 0.5;

// Mobile: il titolo Tempesta completa il fade-in quando raggiunge il centro del viewport
const MOBILE_TEMPESTA_TITLE_FADE_START_VH = 1.0; // inizia a fadersi quando entra nel viewport (top = 100vh)
const MOBILE_TEMPESTA_TITLE_FADE_END_VH = 0.5;   // completamente visibile quando top = 50vh (centro)

const TEMPESTA_HANDOFF_RANGE = 0.42;

const TEMPESTA_PLAYER_REVEAL_VH = 0.1;
const TEMPESTA_PLAYER_VISIBLE_VH = 0.28;
const TEMPESTA_PLAYER_EXIT_VH = 0.12;

const TEMPESTA_SECTION_SCALE =
  TEMPESTA_PAN_SCALE +
  TEMPESTA_PLAYER_REVEAL_VH +
  TEMPESTA_PLAYER_VISIBLE_VH +
  TEMPESTA_PLAYER_EXIT_VH;

const MOBILE_MAX_WIDTH = 767;

const MOBILE_PLAYER_REVEAL_VH = 0.12;
const MOBILE_PLAYER_VISIBLE_VH = 0.22;
const MOBILE_PLAYER_EXIT_VH = 0.1;
const MOBILE_SECTION_VH =
  1 + MOBILE_PLAYER_REVEAL_VH + MOBILE_PLAYER_VISIBLE_VH + MOBILE_PLAYER_EXIT_VH;

function isMobileViewport() {
  return window.innerWidth <= MOBILE_MAX_WIDTH;
}

function getMobileTempestaScrollPhases(rect: DOMRect, viewport: number) {
  const revealScrollable = viewport * MOBILE_PLAYER_REVEAL_VH;
  const visibleScrollable = viewport * MOBILE_PLAYER_VISIBLE_VH;
  const exitScrollable = viewport * MOBILE_PLAYER_EXIT_VH;
  const holdScrollable = revealScrollable + visibleScrollable;
  const totalScrollable = holdScrollable + exitScrollable;

  const panComplete = rect.top <= 0;
  const scrolled = panComplete ? clamp(-rect.top, 0, totalScrollable) : 0;

  let playerOpacity = 0;
  if (scrolled > 0 && revealScrollable > 0 && scrolled < revealScrollable) {
    playerOpacity = scrolled / revealScrollable;
  } else if (scrolled >= revealScrollable && scrolled < holdScrollable) {
    playerOpacity = 1;
  } else if (scrolled >= holdScrollable && exitScrollable > 0) {
    playerOpacity = 1 - clamp((scrolled - holdScrollable) / exitScrollable, 0, 1);
  }

  const exitProgress =
    exitScrollable > 0
      ? clamp((scrolled - holdScrollable) / exitScrollable, 0, 1)
      : 0;

  return { panComplete, playerOpacity, exitProgress };
}

type HeroTempestaTransitionProps = {
  tempestaStreamUrl: string | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getSectionPan(rect: DOMRect, sectionHeight: number, imageHeight: number) {
  const viewport = window.innerHeight;
  const scrollable = sectionHeight - viewport;
  if (scrollable <= 0) return 0;

  const scrolled = clamp(-rect.top, 0, scrollable);
  const progress = scrolled / scrollable;
  const maxPan = imageHeight - viewport;

  return progress * maxPan;
}

function getTempestaPan(rect: DOMRect, viewport: number) {
  const panScrollable = viewport * (TEMPESTA_PAN_SCALE - 1);
  if (panScrollable <= 0) return 0;

  const scrolled = clamp(-rect.top, 0, panScrollable);
  return (scrolled / panScrollable) * panScrollable;
}

function getTempestaScrollPhases(rect: DOMRect, viewport: number) {
  const panScrollable = viewport * (TEMPESTA_PAN_SCALE - 1);
  const revealScrollable = viewport * TEMPESTA_PLAYER_REVEAL_VH;
  const visibleScrollable = viewport * TEMPESTA_PLAYER_VISIBLE_VH;
  const exitScrollable = viewport * TEMPESTA_PLAYER_EXIT_VH;
  const holdScrollable = revealScrollable + visibleScrollable;
  const totalScrollable = panScrollable + holdScrollable + exitScrollable;

  const scrolled = clamp(-rect.top, 0, totalScrollable);
  const panComplete = scrolled >= panScrollable;
  const afterPan = scrolled - panScrollable;

  let playerOpacity = 0;
  if (afterPan > 0 && revealScrollable > 0 && afterPan < revealScrollable) {
    playerOpacity = afterPan / revealScrollable;
  } else if (afterPan >= revealScrollable && afterPan < holdScrollable) {
    playerOpacity = 1;
  } else if (afterPan >= holdScrollable && exitScrollable > 0) {
    playerOpacity = 1 - clamp((afterPan - holdScrollable) / exitScrollable, 0, 1);
  }

  const exitProgress =
    exitScrollable > 0
      ? clamp((afterPan - holdScrollable) / exitScrollable, 0, 1)
      : 0;

  return { panComplete, playerOpacity, exitProgress };
}

export function HeroTempestaTransition({
  tempestaStreamUrl,
}: HeroTempestaTransitionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const tempestaRef = useRef<HTMLElement>(null);
  const playerScrollLockRef = useRef(false);
  const heroPanLockRef = useRef<number | null>(null);
  const { setPlayerScrollLock } = useScrollControl();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [heroPanPx, setHeroPanPx] = useState(0);
  const [tempestaPanPx, setTempestaPanPx] = useState(0);
  const [showTitleStage, setShowTitleStage] = useState(true);
  const [heroImageVisible, setHeroImageVisible] = useState(true);
  const [heroTitle, setHeroTitle] = useState({ offsetY: 0, opacity: 1 });
  const [tempestaTitle, setTempestaTitle] = useState({
    offsetY: 0,
    opacity: 0,
    anchored: false,
    playerOpacity: 0,
  });
  const [tempestaOverlayActive, setTempestaOverlayActive] = useState(false);

  useEffect(() => {
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMedia = window.matchMedia(
      `(max-width: ${MOBILE_MAX_WIDTH}px)`,
    );

    const updateMotion = () => setReducedMotion(motionMedia.matches);
    const updateMobile = () => setIsMobile(mobileMedia.matches);

    updateMotion();
    updateMobile();
    motionMedia.addEventListener("change", updateMotion);
    mobileMedia.addEventListener("change", updateMobile);

    return () => {
      motionMedia.removeEventListener("change", updateMotion);
      mobileMedia.removeEventListener("change", updateMobile);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let frame = 0;

    const update = () => {
      const heroEl = heroRef.current;
      const tempestaEl = tempestaRef.current;
      if (!heroEl || !tempestaEl) return;

      const viewport = window.innerHeight;
      const mobile = isMobileViewport();
      const heroImageScale = mobile ? 1 : HERO_IMAGE_SCALE;
      const heroSectionHeight = viewport * heroImageScale;
      const heroImageHeight = viewport * heroImageScale;

      const heroRect = heroEl.getBoundingClientRect();
      const tempestaRect = tempestaEl.getBoundingClientRect();

      const handoffFromTempesta = clamp(
        (1 - tempestaRect.top / viewport) / TEMPESTA_HANDOFF_RANGE,
        0,
        1,
      );

      let heroPan = 0;
      if (!mobile) {
        const rawHeroPan = getSectionPan(
          heroRect,
          heroSectionHeight,
          heroImageHeight,
        );
        heroPan = rawHeroPan;

        if (handoffFromTempesta > 0) {
          if (heroPanLockRef.current === null) {
            heroPanLockRef.current = rawHeroPan;
          }
          heroPan = heroPanLockRef.current;
        } else {
          heroPanLockRef.current = null;
        }
      } else {
        heroPanLockRef.current = null;
      }

      const tempestaInView =
        tempestaRect.bottom > 0 && tempestaRect.top < viewport * 1.05;

      const risingOffsetY =
        tempestaRect.top + viewport * TEMPESTA_BG_TOP_MARGIN - viewport * 0.5;

      const tempestaAnchored = mobile
        ? tempestaRect.top <= 0
        : risingOffsetY <= 0;

      const tempestaPan = mobile
        ? 0
        : getTempestaPan(tempestaRect, viewport);

      let panComplete = false;
      let scrollPlayerOpacity = 0;
      let exitProgress = 0;

      if (mobile) {
        const phases = getMobileTempestaScrollPhases(tempestaRect, viewport);
        panComplete = phases.panComplete && tempestaAnchored;
        scrollPlayerOpacity = phases.playerOpacity;
        exitProgress = phases.exitProgress;
      } else {
        const phases = getTempestaScrollPhases(tempestaRect, viewport);
        panComplete = phases.panComplete;
        scrollPlayerOpacity = phases.playerOpacity;
        exitProgress = phases.exitProgress;
      }

      setHeroPanPx(heroPan);
      setTempestaPanPx(tempestaPan);

      const tempestaBgTop = Math.max(tempestaRect.top, 0);
      const heroTitleAnchorY = viewport * HERO_TITLE_VIEWPORT_ANCHOR;

      let heroTitleFade = 0;
      if (tempestaBgTop < viewport) {
        const fadeTravel = viewport - heroTitleAnchorY;
        heroTitleFade = clamp(
          1 - (tempestaBgTop - heroTitleAnchorY) / fadeTravel,
          0,
          1,
        );
      }

      let heroOpacity = 0;
      if (heroRect.bottom > 0 || tempestaBgTop < viewport) {
        heroOpacity = clamp(1 - heroTitleFade, 0, 1);
      }

      let tempestaOffsetY = 0;
      let tempestaOpacity = 0;
      let playerOpacity = 0;

      if (tempestaInView) {
        if (mobile) {
          // Fade-in del titolo Tempesta su mobile:
          // inizia quando la sezione entra nel viewport (top = viewport)
          // completa quando il titolo è al centro del viewport (top = 50%)
          const fadeStart = viewport * MOBILE_TEMPESTA_TITLE_FADE_START_VH; // es. 1.0 * vh = bottom del viewport
          const fadeEnd = viewport * MOBILE_TEMPESTA_TITLE_FADE_END_VH;     // es. 0.5 * vh = centro viewport

          if (tempestaRect.top <= fadeStart && tempestaRect.top > fadeEnd) {
            // interpolazione lineare tra fadeStart e fadeEnd
            tempestaOpacity = clamp(
              1 - (tempestaRect.top - fadeEnd) / (fadeStart - fadeEnd),
              0,
              1,
            );
          } else if (tempestaRect.top <= fadeEnd) {
            tempestaOpacity = 1;
          }
        } else if (tempestaBgTop < viewport) {
          const titleFadeTravel = viewport - heroTitleAnchorY;
          tempestaOpacity = clamp(
            1 - (tempestaBgTop - heroTitleAnchorY) / titleFadeTravel,
            0,
            1,
          );
        }

        if (tempestaAnchored) {
          tempestaOffsetY = 0;

          if (panComplete) {
            playerOpacity = scrollPlayerOpacity;

            if (exitProgress > 0) {
              const exitFade = 1 - exitProgress;
              tempestaOpacity *= exitFade;
            }
          }
        } else if (!mobile) {
          tempestaOffsetY = risingOffsetY;
        }
      }

      setTempestaOverlayActive(
        mobile && tempestaRect.top <= viewport && tempestaRect.bottom > 0,
      );

      setShowTitleStage(heroRect.bottom > 0 || tempestaRect.bottom > 0);
      setHeroImageVisible(heroRect.bottom > 0);

      setHeroTitle({ offsetY: 0, opacity: heroOpacity });
      setTempestaTitle({
        offsetY: tempestaOffsetY,
        opacity: tempestaOpacity,
        anchored: tempestaAnchored,
        playerOpacity,
      });

      const shouldLockPlayerScroll = mobile
        ? panComplete && exitProgress < 0.12
        : panComplete && playerOpacity >= 0.85 && exitProgress < 0.08;
      if (shouldLockPlayerScroll !== playerScrollLockRef.current) {
        playerScrollLockRef.current = shouldLockPlayerScroll;
        setPlayerScrollLock(shouldLockPlayerScroll);
      }
    };

    const loop = () => {
      update();
      frame = requestAnimationFrame(loop);
    };

    loop();
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      if (playerScrollLockRef.current) {
        playerScrollLockRef.current = false;
        setPlayerScrollLock(false);
      }
    };
  }, [reducedMotion, setPlayerScrollLock]);

  if (reducedMotion) {
    return (
      <>
        <Hero />
        <section id="tempesta" className="relative min-h-dvh">
          <TempestaPanel streamUrl={tempestaStreamUrl} className="min-h-dvh" />
        </section>
      </>
    );
  }

  return (
    <div className="relative">
      <section
        id="hero"
        ref={heroRef}
        className="relative z-0"
        style={{
          height: isMobile ? "var(--app-height)" : `${HERO_IMAGE_SCALE * 100}vh`,
        }}
      >
        <div
          className="sticky top-0 h-dvh overflow-hidden"
          style={{
            visibility: heroImageVisible ? "visible" : "hidden",
            pointerEvents: heroImageVisible ? "auto" : "none",
          }}
        >
          <Hero
            className="h-full"
            panPx={heroPanPx}
            imageScale={isMobile ? 1 : HERO_IMAGE_SCALE}
            showFullHeight={isMobile}
            showTitle={false}
          />
        </div>
      </section>

      <section
        id="tempesta"
        ref={tempestaRef}
        className="relative md:h-auto"
        style={{
          height: isMobile
            ? `${MOBILE_SECTION_VH * 100}vh`
            : `${TEMPESTA_SECTION_SCALE * 100}vh`,
        }}
      >
        <div className="sticky top-0 h-dvh overflow-hidden">
          <TempestaPanel
            streamUrl={tempestaStreamUrl}
            className="h-full"
            panPx={tempestaPanPx}
            imageScale={isMobile ? 1 : TEMPESTA_PAN_SCALE}
            showTitle={false}
          />
          {isMobile && tempestaOverlayActive ? (
            <TempestaTitleOverlay
              className="absolute inset-0 z-10"
              mobileLayout
              titleOpacity={tempestaTitle.opacity}
              playerOpacity={tempestaTitle.playerOpacity}
              streamUrl={tempestaStreamUrl}
            />
          ) : null}
        </div>
      </section>

      {showTitleStage ? (
        <ScrollTitleStage
          hero={heroTitle}
          tempesta={tempestaTitle}
          tempestaStreamUrl={tempestaStreamUrl}
          showTempesta={!isMobile}
        />
      ) : null}
    </div>
  );
}