"use client";

import { useGridOverlay } from "@/components/GridOverlayProvider";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { useView } from "@/components/ViewProvider";

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden
      className="block h-[19px] w-[19px] md:h-[17px] md:w-[17px]"
    >
      <rect
        x="1"
        y="1.5"
        width="13"
        height="12"
        stroke="currentColor"
        strokeWidth="1"
      />
      {Array.from({ length: 11 }, (_, index) => {
        const x = 1 + ((index + 1) * 13) / 12;
        return (
          <line
            key={index}
            x1={x}
            y1="1.5"
            x2={x}
            y2="13.5"
            stroke="currentColor"
            strokeWidth={active ? 1 : 0.75}
            opacity={active ? 1 : 0.85}
          />
        );
      })}
    </svg>
  );
}

export function GridOverlayToggle({
  dark,
  className = "",
}: {
  dark: boolean;
  className?: string;
}) {
  const { visible, toggle } = useGridOverlay();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={visible}
      aria-label={visible ? "Nascondi griglia colonne" : "Mostra griglia colonne"}
      className={`inline-flex cursor-pointer items-center border-0 bg-transparent p-0 not-italic transition-transform duration-300 ease-out hover:scale-105 ${
        dark ? "text-black" : "text-white"
      } ${visible ? "opacity-100" : "opacity-70"} ${className}`}
    >
      <GridIcon active={visible} />
    </button>
  );
}

export function GridOverlayToggleDock() {
  const { view } = useView();
  const { nowPlaying, playbackEngaged } = useBandcampSession();
  const dark = true;
  const showPlayerChrome = playbackEngaged && Boolean(nowPlaying);

  return (
    <div
      className={`site-chrome-control pointer-events-auto fixed z-30 transition-[bottom] duration-300 ${
        showPlayerChrome
          ? "bottom-[calc(var(--site-music-player-height,0px)+env(safe-area-inset-bottom,0px))] md:bottom-[calc(var(--desktop-site-footer-offset)+var(--site-music-player-height,0px))]"
          : "bottom-[calc(var(--nav-bottom-lift)+env(safe-area-inset-bottom,0px))] md:bottom-[var(--desktop-site-footer-offset)]"
      } right-3 md:right-[var(--site-grid-margin-x,50px)]`}
    >
      <GridOverlayToggle dark={dark} />
    </div>
  );
}
