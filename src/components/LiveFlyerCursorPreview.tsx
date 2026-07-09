"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const CURSOR_GAP = 16;
const MAX_WIDTH_PX = 340;

const preloadedFlyers = new Set<string>();

export function resolveLiveFlyerSrc(src: string) {
  if (typeof window === "undefined" || src.startsWith("http")) return src;
  return `${window.location.origin}${src}`;
}

function resolveFlyerSrc(src: string) {
  return resolveLiveFlyerSrc(src);
}

export function preloadLiveFlyer(src: string) {
  const resolved = resolveFlyerSrc(src);
  if (preloadedFlyers.has(resolved)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      preloadedFlyers.add(resolved);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = resolved;
  });
}

type LiveFlyerCursorPreviewProps = {
  src: string;
  alt: string;
  x: number;
  y: number;
};

export function LiveFlyerCursorPreview({
  src,
  alt,
  x,
  y,
}: LiveFlyerCursorPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const resolvedSrc = resolveFlyerSrc(src);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed z-[100] will-change-transform"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${x + CURSOR_GAP}px, ${y + CURSOR_GAP}px, 0)`,
        maxWidth: MAX_WIDTH_PX,
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt={alt}
        className="block max-h-[58vh] w-auto max-w-[340px] object-contain"
        draggable={false}
      />
    </div>,
    document.body,
  );
}
