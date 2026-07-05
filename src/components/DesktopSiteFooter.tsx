"use client";

import {
  SiteCompactFooter,
  siteCompactFooterShellClass,
} from "@/components/SiteCompactFooter";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { useView } from "@/components/ViewProvider";
import { gridShellClass } from "@/lib/grid";

export function DesktopSiteFooter() {
  const { view } = useView();
  const { viewReleaseId } = useBandcampSession();
  const onAbout = view === "about";
  const onHome = view === "home";
  const onMusic = view === "music";
  const onLive = view === "live";
  const onRelease = Boolean(viewReleaseId);

  if (onAbout || onHome || onMusic || onLive || onRelease) {
    return null;
  }

  return (
    <div className="site-chrome-control site-desktop-footer pointer-events-auto fixed inset-x-0 bottom-0 z-20 hidden bg-transparent md:block">
      <div className={`${gridShellClass} max-w-none bg-transparent ${siteCompactFooterShellClass}`}>
        <SiteCompactFooter tone="dark" />
      </div>
    </div>
  );
}
