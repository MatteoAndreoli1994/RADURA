"use client";

import { SiteCompactFooter, siteCompactFooterShellClass } from "@/components/SiteCompactFooter";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { useView } from "@/components/ViewProvider";
import { gridShellClass } from "@/lib/grid";

export function MobileBottomChrome() {
  const { view } = useView();
  const { playbackEngaged, nowPlaying } = useBandcampSession();

  const onHome = view === "home";
  const onAbout = view === "about";
  const onMusic = view === "music";
  const onLive = view === "live";
  const showGlobalPlayer = playbackEngaged && Boolean(nowPlaying);
  const tone = onHome ? "light" : "dark";

  if (onHome || onAbout || onMusic || onLive) {
    return null;
  }

  if (showGlobalPlayer) {
    return null;
  }

  return (
    <div
      className={`site-chrome-control site-mobile-bottom pointer-events-auto fixed inset-x-0 bottom-0 z-30 bg-transparent md:hidden ${
        onHome ? "text-white" : "text-black"
      }`}
      style={{
        paddingBottom:
          "calc(var(--site-music-player-height, 0px) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className={`${gridShellClass} max-w-none bg-transparent ${siteCompactFooterShellClass}`}>
        <SiteCompactFooter tone={tone} copyrightOnly={onHome} />
      </div>
    </div>
  );
}
