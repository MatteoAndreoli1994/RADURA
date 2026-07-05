"use client";

import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { AlbumScroller } from "@/components/sections/AlbumScroller";
import { MobileDiscographyList } from "@/components/sections/MobileDiscographyList";
import { ReleasePlayer } from "@/components/sections/ReleasePlayer";
import { gridShellClass, mobileContentBelowNavClass } from "@/lib/grid";
import { RELEASES, type Release } from "@/lib/releases";

export function Discography({ releases = RELEASES }: { releases?: Release[] }) {
  const {
    viewReleaseId,
    pendingReleaseId,
    openRelease,
    closeReleaseView,
    getReleaseTracks,
  } = useBandcampSession();

  const viewRelease =
    releases.find((release) => release.id === viewReleaseId) ?? null;
  const showDiscographyList = !viewReleaseId;

  return (
    <section
      id="discography"
      className={`relative flex w-full flex-1 flex-col bg-background max-md:h-dvh max-md:max-h-dvh max-md:min-h-0 max-md:overflow-x-hidden max-md:pt-0 max-md:no-scrollbar max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:min-h-full md:overflow-visible ${
        showDiscographyList ? "max-md:overflow-y-auto" : "max-md:overflow-hidden"
      }`}
      {...(showDiscographyList
        ? {
            "data-lenis-prevent": true,
            "data-internal-scroll": true,
            style: { WebkitOverflowScrolling: "touch" as const },
          }
        : {})}
    >
      {showDiscographyList ? (
        <>
          <div className="music-list-desktop relative hidden md:block">
            <AlbumScroller
              releases={releases}
              onOpen={openRelease}
              pendingReleaseId={pendingReleaseId}
            />
          </div>
          <div className={`music-mobile-list relative ${mobileContentBelowNavClass} md:hidden`}>
            <MobileDiscographyList
              releases={releases}
              pendingReleaseId={pendingReleaseId}
              onOpen={openRelease}
            />
          </div>
        </>
      ) : null}

      {viewRelease ? (
        <div
          className={`${gridShellClass} in-flow-page-content flex w-full flex-1 flex-col bg-transparent max-md:pt-0 max-md:h-full max-md:min-h-0 max-md:overflow-hidden md:overflow-visible md:pb-0`}
        >
          <ReleasePlayer
            key={viewRelease.id}
            release={viewRelease}
            tracks={getReleaseTracks(viewRelease.id)}
            isOpen
            onBack={closeReleaseView}
          />
        </div>
      ) : null}
    </section>
  );
}
