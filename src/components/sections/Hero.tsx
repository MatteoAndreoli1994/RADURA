"use client";

import { type CSSProperties } from "react";
import { ACQUE_RELEASE } from "@/lib/releases";

const HERO_IMAGE_SCALE = 1.65;

type HeroProps = {
  className?: string;
  panPx?: number;
  imageScale?: number;
  showFullHeight?: boolean;
  showTitle?: boolean;
  titleOffsetY?: number;
  titleOpacity?: number;
};

export function Hero({
  className = "",
  panPx = 0,
  imageScale = HERO_IMAGE_SCALE,
  showFullHeight = false,
  showTitle = true,
  titleOffsetY = 0,
  titleOpacity = 1,
}: HeroProps) {
  const titleStyle: CSSProperties = {
    top: "50%",
    transform: `translateY(calc(-50% + ${titleOffsetY}px))`,
    opacity: titleOpacity,
    pointerEvents: titleOpacity > 0.4 ? "auto" : "none",
  };

  return (
    <div className={`relative h-dvh overflow-hidden ${className}`}>
      <div
        aria-hidden
        className={
          showFullHeight
            ? "absolute inset-0 bg-[length:auto_100%] bg-center bg-no-repeat"
            : "absolute left-0 w-full bg-cover bg-top bg-no-repeat will-change-transform"
        }
        style={{
          height: showFullHeight ? "100%" : `${imageScale * 100}vh`,
          backgroundImage: "url(/images/copertina.jpg)",
          transform: showFullHeight
            ? undefined
            : `translate3d(0, -${panPx}px, 0)`,
        }}
      />

      {showTitle ? (
        <div
          className="absolute inset-x-0 z-10 flex justify-center px-5 will-change-[transform,opacity] sm:px-8"
          style={titleStyle}
        >
          <div className="flex w-full max-w-[min(100%,320px)] flex-col items-center text-center font-garamond text-[18px] leading-[20px] tracking-[0.06em] text-white sm:max-w-[400px]">
            <p className="m-0 italic">New Album</p>
            <p className="m-0 mt-0 tracking-[0.06em]">{ACQUE_RELEASE.title}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
