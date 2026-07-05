"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type LiveFlyerPopupProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function LiveFlyerPopup({ src, alt, onClose }: LiveFlyerPopupProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    void preloadImage(src).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (!ready) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, ready]);

  if (!ready) return null;

  return createPortal(
    <div
      className="pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center p-2"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        aria-label="Chiudi flyer"
        className="absolute inset-0 cursor-default border-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 w-fit max-w-[94vw]">
        <button
          type="button"
          aria-label="Chiudi"
          onClick={onClose}
          className="absolute top-2 right-2 z-20 flex h-8 w-8 cursor-pointer items-center justify-center border-0 bg-white/90 p-0 text-[20px] leading-none text-black/70 transition-colors hover:text-black"
        >
          ×
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="block max-h-[92dvh] w-auto max-w-full"
        />
      </div>
    </div>,
    document.body,
  );
}
