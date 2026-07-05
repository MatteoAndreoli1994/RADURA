"use client";

import { useEffect, useRef, useState } from "react";

type BackgroundVideoProps = {
  src: string;
  className?: string;
  startAt?: number;
  endAt?: number;
  active?: boolean;
  fadeIn?: boolean;
};

export function BackgroundVideo({
  src,
  className = "",
  startAt,
  endAt,
  active = true,
  fadeIn = false,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hasSegment =
      typeof startAt === "number" &&
      typeof endAt === "number" &&
      endAt > startAt;

    let segmentStart = startAt ?? 0;
    let segmentEnd = endAt ?? Infinity;
    let segmentActive = hasSegment;

    video.muted = true;

    const play = () => {
      if (!active) return;
      void video.play().catch(() => {});
    };

    const pause = () => {
      video.pause();
    };

    const markReady = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setIsReady(true);
      }
    };

    const syncSegment = () => {
      if (!hasSegment) return;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (duration > 0) {
        if (startAt! >= duration || endAt! <= startAt! + 0.2) {
          segmentActive = false;
          video.loop = true;
          return;
        }

        segmentStart = Math.max(0, Math.min(startAt!, duration - 0.2));
        segmentEnd = Math.max(segmentStart + 0.2, Math.min(endAt!, duration));
      }
      if (video.currentTime < segmentStart || video.currentTime >= segmentEnd) {
        video.currentTime = segmentStart;
      }
    };

    const onTimeUpdate = () => {
      if (!segmentActive) return;
      if (video.currentTime >= segmentEnd - 0.05) {
        video.currentTime = segmentStart;
        play();
      }
    };

    video.loop = !hasSegment;
    syncSegment();
    markReady();

    if (active) {
      play();
    } else {
      pause();
    }

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("loadedmetadata", syncSegment);
    video.addEventListener("loadedmetadata", markReady);
    video.addEventListener("canplay", markReady);
    video.addEventListener("canplay", play);
    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("loadedmetadata", syncSegment);
      video.removeEventListener("loadedmetadata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("canplay", play);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [active, src, startAt, endAt]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none relative h-full w-full overflow-hidden bg-black ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop={false}
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        controlsList="nodownload noplaybackrate noremoteplayback"
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          !fadeIn || isReady ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
