"use client";

import { useEffect } from "react";
import { applyAppHeight } from "@/lib/viewport-height";

const MOBILE_MAX_WIDTH = 767;

function syncMobileNativeScroll() {
  const isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
  document.documentElement.classList.toggle("mobile-native-scroll", isMobile);
}

export function SafariViewportFix() {
  useEffect(() => {
    applyAppHeight();
    syncMobileNativeScroll();

    window.addEventListener("resize", applyAppHeight);
    window.addEventListener("orientationchange", applyAppHeight);
    window.visualViewport?.addEventListener("resize", applyAppHeight);
    window.visualViewport?.addEventListener("scroll", applyAppHeight);
    window.addEventListener("resize", syncMobileNativeScroll);
    window.addEventListener("orientationchange", syncMobileNativeScroll);

    return () => {
      window.removeEventListener("resize", applyAppHeight);
      window.removeEventListener("orientationchange", applyAppHeight);
      window.visualViewport?.removeEventListener("resize", applyAppHeight);
      window.visualViewport?.removeEventListener("scroll", applyAppHeight);
      window.removeEventListener("resize", syncMobileNativeScroll);
      window.removeEventListener("orientationchange", syncMobileNativeScroll);
    };
  }, []);

  return null;
}
