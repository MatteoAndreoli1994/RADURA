"use client";

import { AudioProvider } from "@/components/AudioProvider";
import { BandcampSessionProvider, useBandcampSession } from "@/components/BandcampSessionProvider";
import { DesktopSiteFooter } from "@/components/DesktopSiteFooter";
import { SiteMusicPlayer } from "@/components/SiteMusicPlayer";
import { Navbar } from "@/components/Navbar";
import { NewsletterPopupProvider } from "@/components/NewsletterPopup";
import { HomePage } from "@/components/pages/HomePage";
import { SafariViewportFix } from "@/components/SafariViewportFix";
import { ViewProvider, useView } from "@/components/ViewProvider";
import { Biography } from "@/components/sections/Biography";
import { Discography } from "@/components/sections/Discography";
import { LiveGallery } from "@/components/sections/LiveGallery";
import type { LiveDate } from "@/lib/live-dates";

type FullSiteClientProps = {
  tempestaStreamUrl: string | null;
  liveDates: LiveDate[];
};

function Pages({ liveDates }: { liveDates: LiveDate[] }) {
  const { view } = useView();
  const { viewReleaseId } = useBandcampSession();
  const onHome = view === "home";
  const allowPageScroll =
    view === "about" ||
    view === "home" ||
    view === "live" ||
    view === "music" ||
    Boolean(viewReleaseId);

  return (
    <div
      key={view}
      className={
        onHome
          ? "flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden max-md:h-full md:min-h-0"
          : allowPageScroll
            ? "flex h-full min-h-0 w-full flex-col max-md:h-[var(--app-height)] md:min-h-full"
            : "flex h-dvh min-h-0 w-full flex-col max-md:min-h-dvh"
      }
    >
      {view === "home" ? <HomePage /> : null}
      {view === "about" ? <Biography /> : null}
      {view === "live" ? <LiveGallery liveDates={liveDates} /> : null}
      {view === "music" ? <Discography /> : null}
    </div>
  );
}

function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="site-chrome pointer-events-none absolute top-0 right-0 left-0 z-30 h-0 overflow-visible"
      aria-hidden={false}
    >
      {children}
    </div>
  );
}

function SiteShell({ liveDates }: { liveDates: LiveDate[] }) {
  const { view } = useView();
  const { viewReleaseId } = useBandcampSession();
  const onAbout = view === "about";
  const onHome = view === "home";
  const onLive = view === "live";
  const onMusic = view === "music";
  const onRelease = Boolean(viewReleaseId);
  const allowPageScroll = onAbout || onHome || onLive || onMusic || onRelease;

  return (
    <div
      className={`site-shell fixed top-0 right-0 left-0 h-dvh min-h-dvh w-full max-md:overflow-visible${
        onHome
          ? " site-shell--home"
          : allowPageScroll
            ? " site-shell--about"
            : " overflow-hidden min-[1281px]:overflow-visible"
      }`}
    >
      <div
        className={`site-shell-scale relative w-full ${
          allowPageScroll ? "min-h-full" : "h-full"
        }`}
      >
        <main
          className={`site-content z-0 w-full max-md:overflow-visible ${
            onHome
              ? "relative flex h-full min-h-0 flex-col overflow-hidden max-md:h-full md:min-h-0"
              : allowPageScroll
                ? "relative md:min-h-full"
                : "absolute top-0 right-0 left-0 h-dvh min-h-dvh overflow-hidden"
          }`}
        >
          <Pages liveDates={liveDates} />
        </main>
        <Navbar />
        <SiteChrome>
          <DesktopSiteFooter />
        </SiteChrome>
        <SiteMusicPlayer />
      </div>
    </div>
  );
}

export function FullSiteClient({
  tempestaStreamUrl,
  liveDates,
}: FullSiteClientProps) {
  return (
    <AudioProvider initialStreamUrl={tempestaStreamUrl}>
      <ViewProvider>
        <BandcampSessionProvider>
          <NewsletterPopupProvider>
            <SafariViewportFix />
            <SiteShell liveDates={liveDates} />
          </NewsletterPopupProvider>
        </BandcampSessionProvider>
      </ViewProvider>
    </AudioProvider>
  );
}
