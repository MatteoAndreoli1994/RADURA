import { getImageProps } from "next/image";
import { getReleaseCoverSrc } from "@/lib/preload-release-cover";
import { RELEASES, type Release } from "@/lib/releases";

const COVER_QUALITY = 90;
const DESKTOP_COVER_WIDTH = 360;
const MOBILE_COVER_WIDTH = 828;

let readyPromise: Promise<void> | null = null;

function preloadOptimizedImage(
  src: string,
  width: number,
  quality = COVER_QUALITY,
): Promise<void> {
  const { props } = getImageProps({
    alt: "",
    width,
    height: width,
    quality,
    src,
  });

  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";

    const done = () => resolve();
    image.onload = done;
    image.onerror = done;

    if (typeof props.srcSet === "string") {
      image.srcset = props.srcSet;
    }
    if (typeof props.sizes === "string") {
      image.sizes = props.sizes;
    }

    image.src = typeof props.src === "string" ? props.src : String(props.src);
  });
}

function preloadDiscographyCover(src: string): Promise<void> {
  return Promise.all([
    preloadOptimizedImage(src, DESKTOP_COVER_WIDTH),
    preloadOptimizedImage(src, MOBILE_COVER_WIDTH),
  ]).then(() => undefined);
}

export function ensureMusicPageReady(releases: Release[] = RELEASES): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = Promise.all(
    releases.map((release) => preloadDiscographyCover(getReleaseCoverSrc(release))),
  ).then(() => undefined);

  return readyPromise;
}

export function warmupMusicPage(releases: Release[] = RELEASES): void {
  void ensureMusicPageReady(releases);
}
