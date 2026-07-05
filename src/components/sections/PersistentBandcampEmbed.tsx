"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getReleasePlayerEmbed } from "@/lib/bandcamp";
import {
  pauseBandcampPlayerSoft,
  registerBandcampPlayer,
  subscribeBandcampPlayer,
} from "@/lib/bandcamp-player-control";
import { useAudio } from "@/components/AudioProvider";
import type { Release } from "@/lib/releases";

type PersistentBandcampEmbedProps = {
  release: Release;
  onReady?: () => void;
};

const HIDDEN_PLAYER_SIZE = 420;

export function PersistentBandcampEmbed({
  release,
  onReady,
}: PersistentBandcampEmbedProps) {
  const { muted } = useAudio();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const hiddenRootRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  const [mounted, setMounted] = useState(false);
  const embed = getReleasePlayerEmbed(release.bandcampEmbedUrl);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted || !embed || !hiddenRootRef.current) return;

    if (!frameRef.current) {
      const frame = document.createElement("div");
      frame.className = "overflow-hidden";
      frame.setAttribute("data-bandcamp-frame", release.id);

      const iframe = document.createElement("iframe");
      iframe.title = `${release.title} — Bandcamp`;
      iframe.src = embed.player;
      iframe.className = "block h-full w-full border-0";
      iframe.allow = "autoplay *; encrypted-media";
      iframe.setAttribute(
        "allow",
        "autoplay *; encrypted-media; fullscreen; picture-in-picture",
      );
      iframe.addEventListener("load", () => {
        subscribeBandcampPlayer(iframe);
        registerBandcampPlayer(release.id, iframe);
        if (muted) pauseBandcampPlayerSoft(iframe);
        onReadyRef.current?.();
      });

      frame.appendChild(iframe);
      hiddenRootRef.current.appendChild(frame);
      frameRef.current = frame;
      iframeRef.current = iframe;
      registerBandcampPlayer(release.id, iframe);
    }
  }, [mounted, embed, release.id, release.title, muted]);

  useEffect(() => {
    if (!mounted) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    return registerBandcampPlayer(release.id, iframe);
  }, [mounted, release.id]);

  useEffect(() => {
    if (!muted) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    pauseBandcampPlayerSoft(iframe);
  }, [muted]);

  if (!embed || !mounted) return null;

  return createPortal(
    <div
      ref={hiddenRootRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 overflow-hidden"
      style={{
        width: HIDDEN_PLAYER_SIZE,
        height: HIDDEN_PLAYER_SIZE,
        transform: "translate3d(0, -10000px, 0)",
      }}
    />,
    document.body,
  );
}
