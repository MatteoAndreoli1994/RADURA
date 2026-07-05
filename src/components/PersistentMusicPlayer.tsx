"use client";

import { MusicPlayerBar } from "@/components/MusicPlayerBar";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { useView } from "@/components/ViewProvider";
import { grid12Style, gridShellClass } from "@/lib/grid";

export function PersistentMusicPlayer() {
  const { view } = useView();
  const { nowPlaying, playbackEngaged, viewReleaseId } = useBandcampSession();
  const onHome = view === "home";
  if (!playbackEngaged || !nowPlaying || viewReleaseId) return null;

  return (
    <div
      className={`site-chrome-control pointer-events-auto fixed inset-x-0 bottom-0 z-30 transition-colors duration-300 md:hidden ${
        onHome ? "text-white bg-transparent" : "text-black bg-background/95"
      }`}
    >
      <div className={`${gridShellClass} max-w-none pt-0 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]`}>
        <div className="grid items-center" style={grid12Style}>
          <MusicPlayerBar
            className="col-span-12"
            variant="dock"
            tone={onHome ? "light" : "dark"}
          />
        </div>
      </div>
    </div>
  );
}
