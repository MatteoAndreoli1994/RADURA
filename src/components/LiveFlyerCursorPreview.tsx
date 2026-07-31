"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const CURSOR_GAP = 16;
const MAX_WIDTH_PX = 340;

export type LiveFlyerMeta = {
  width: number;
  height: number;
};

const preloadedFlyers = new Map<string, LiveFlyerMeta>();
const pendingFlyers = new Map<string, Promise<LiveFlyerMeta | null>>();

export function resolveLiveFlyerSrc(src: string) {
  if (typeof window === "undefined" || src.startsWith("http")) return src;
  return `${window.location.origin}${src}`;
}

function resolveFlyerSrc(src: string) {
  return resolveLiveFlyerSrc(src);
}

export function getLiveFlyerMeta(src: string): LiveFlyerMeta | null {
  return preloadedFlyers.get(resolveFlyerSrc(src)) ?? null;
}

export function isLiveFlyerPreloaded(src: string) {
  return preloadedFlyers.has(resolveFlyerSrc(src));
}

export function preloadLiveFlyer(src: string): Promise<LiveFlyerMeta | null> {
  const resolved = resolveFlyerSrc(src);
  const existing = preloadedFlyers.get(resolved);
  if (existing) return Promise.resolve(existing);

  const pending = pendingFlyers.get(resolved);
  if (pending) return pending;

  const request = new Promise<LiveFlyerMeta | null>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const meta: LiveFlyerMeta = {
        width: img.naturalWidth || 2,
        height: img.naturalHeight || 3,
      };
      preloadedFlyers.set(resolved, meta);
      pendingFlyers.delete(resolved);
      resolve(meta);
    };
    img.onerror = () => {
      pendingFlyers.delete(resolved);
      resolve(null);
    };
    img.src = resolved;
  });

  pendingFlyers.set(resolved, request);
  return request;
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
