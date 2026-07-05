"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TempestaPlayer } from "@/components/TempestaPlayer";
import { ACQUE_RELEASE, TEMPESTA_RELEASE } from "@/lib/releases";

type TitleBlockStyle = {
  offsetY: number;
  opacity: number;
};

type TempestaTitleStyle = TitleBlockStyle & {
  anchored?: boolean;
  playerOpacity?: number;
};

type ScrollTitleStageProps = {
  hero: TitleBlockStyle;
  tempesta: TempestaTitleStyle;
  tempestaStreamUrl?: string | null;
  /** Su mobile il titolo Tempesta vive nel pannello sticky, non nel portal fixed. */
  showTempesta?: boolean;
};

// Centro viewport → top player: metà blocco titolo (~2rem) + gap stretto
const TEMPESTA_PLAYER_OFFSET_FROM_CENTER = "2.5rem";
const MOBILE_TEMPESTA_ANCHOR = "44%";

type TempestaTitleOverlayProps = {
  titleOpacity: number;
  playerOpacity?: number;
  streamUrl?: string | null;
  className?: string;
  style?: CSSProperties;
  offsetY?: number;
  dark?: boolean;
  mobileLayout?: boolean;
};

export function TempestaTitleOverlay({
  titleOpacity,
  playerOpacity = 0,
  streamUrl = null,
  className = "",
  style,
  offsetY = 0,
  dark = false,
  mobileLayout = false,
}: TempestaTitleOverlayProps) {
  const textClass = dark ? "text-black" : "text-white";
  const anchor = mobileLayout ? MOBILE_TEMPESTA_ANCHOR : "50%";
  return (
    <div
      className={`pointer-events-none ${className}`.trim()}
      style={style}
    >
      <div
        className="absolute inset-x-0 flex justify-center px-5 will-change-[transform,opacity] sm:px-8"
        style={{
          top: anchor,
          transform: `translateY(calc(-50% + ${offsetY}px))`,
        }}
      >
        <div
          className={`flex w-full max-w-[min(100%,320px)] flex-col items-center text-center font-garamond text-site tracking-[0.06em] ${textClass} sm:max-w-[400px]`}
          style={{ opacity: titleOpacity }}
        >
          <p className="m-0 italic">New Single from &ldquo;Acque&rdquo;</p>
          <h2 className="m-0 font-normal not-italic">TEMPESTA</h2>
        </div>
      </div>

      {streamUrl ? (
        <div
          className="absolute inset-x-0 flex justify-center px-5 sm:px-8"
          style={{
            top: anchor,
            transform: `translateY(calc(${offsetY}px + ${TEMPESTA_PLAYER_OFFSET_FROM_CENTER}))`,
            opacity: playerOpacity,
            pointerEvents: playerOpacity > 0.35 ? "auto" : "none",
          }}
        >
          <div className="w-full max-w-[min(100%,320px)] sm:max-w-[400px]">
            <TempestaPlayer
              streamUrl={streamUrl}
              title={TEMPESTA_RELEASE.title}
              inline
              showTitle={false}
              tone={dark ? "dark" : "light"}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function titlePositionStyle(offsetY: number, opacity: number): CSSProperties {
  return {
    top: "50%",
    transform: `translateY(calc(-50% + ${offsetY}px))`,
    opacity,
  };
}

export function ScrollTitleStage({
  hero,
  tempesta,
  tempestaStreamUrl = null,
  showTempesta = true,
}: ScrollTitleStageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stage = (
    <div className="pointer-events-none fixed inset-0 z-[60] h-dvh overflow-hidden">
      <div
        className="absolute inset-x-0 flex justify-center px-5 will-change-[transform,opacity] sm:px-8"
        style={{
          ...titlePositionStyle(hero.offsetY, hero.opacity),
          pointerEvents: hero.opacity > 0.35 ? "auto" : "none",
        }}
      >
        <div className="flex w-full max-w-[min(100%,320px)] flex-col items-center text-center font-garamond text-[18px] leading-[20px] tracking-[0.06em] text-white sm:max-w-[400px]">
          <p className="m-0 italic">New Album</p>
          <p className="m-0 mt-0 tracking-[0.06em]">{ACQUE_RELEASE.title}</p>
        </div>
      </div>

      {showTempesta ? (
        <TempestaTitleOverlay
          className="absolute inset-x-0 top-0 h-dvh will-change-[transform,opacity]"
          offsetY={tempesta.anchored ? 0 : tempesta.offsetY}
          titleOpacity={tempesta.opacity}
          playerOpacity={tempesta.playerOpacity}
          streamUrl={tempestaStreamUrl}
        />
      ) : null}
    </div>
  );

  if (!mounted) return null;

  return createPortal(stage, document.body);
}
