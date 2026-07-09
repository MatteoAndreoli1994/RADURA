"use client";

import { useEffect } from "react";
import { warmupMusicPage } from "@/lib/preload-music-page";

export function MusicPageWarmup() {
  useEffect(() => {
    const run = () => warmupMusicPage();

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = globalThis.setTimeout(run, 1200);
    return () => globalThis.clearTimeout(id);
  }, []);

  return null;
}
