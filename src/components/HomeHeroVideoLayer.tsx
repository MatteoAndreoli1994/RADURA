"use client";

import { BackgroundVideo } from "@/components/BackgroundVideo";
import { useView } from "@/components/ViewProvider";
import { HOME_HERO_VIDEO_SRC } from "@/lib/home-hero-video";

export function HomeHeroVideoLayer() {
  const { view } = useView();
  const onHome = view === "home";

  return (
    <div
      className={`home-video-layer ${onHome ? "opacity-100" : "pointer-events-none opacity-0"}`}
      aria-hidden={!onHome}
    >
      <BackgroundVideo
        src={HOME_HERO_VIDEO_SRC}
        active={onHome}
        fadeIn
        className="h-full w-full"
      />
    </div>
  );
}
