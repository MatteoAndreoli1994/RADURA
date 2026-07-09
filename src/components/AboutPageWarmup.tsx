"use client";

import { useEffect } from "react";
import { warmupAboutPage } from "@/lib/preload-about-page";

export function AboutPageWarmup() {
  useEffect(() => {
    const run = () => warmupAboutPage();

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }

    const id = globalThis.setTimeout(run, 1500);
    return () => globalThis.clearTimeout(id);
  }, []);

  return null;
}
