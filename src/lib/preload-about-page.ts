import { getImageProps } from "next/image";

export const ABOUT_IMAGE_SRC = "/images/live4.jpg";

const IMAGE_QUALITY = 90;
const MOBILE_ABOUT_WIDTH = 828;
const DESKTOP_ABOUT_WIDTH = 360;

let readyPromise: Promise<void> | null = null;

function preloadOptimizedImage(
  src: string,
  width: number,
  height: number,
  sizes: string,
  quality = IMAGE_QUALITY,
): Promise<void> {
  const { props } = getImageProps({
    alt: "",
    width,
    height,
    quality,
    sizes,
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

function preloadAboutImageVariants(): Promise<void> {
  return Promise.all([
    preloadOptimizedImage(
      ABOUT_IMAGE_SRC,
      960,
      1280,
      "(max-width: 767px) 100vw, 180px",
    ),
    preloadOptimizedImage(
      ABOUT_IMAGE_SRC,
      960,
      1280,
      "(min-width: 768px) 16vw, 100vw",
    ),
    preloadOptimizedImage(ABOUT_IMAGE_SRC, MOBILE_ABOUT_WIDTH, 1104, "100vw"),
    preloadOptimizedImage(ABOUT_IMAGE_SRC, DESKTOP_ABOUT_WIDTH, 480, "16vw"),
  ]).then(() => undefined);
}

export function ensureAboutPageReady(): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = preloadAboutImageVariants();
  return readyPromise;
}

export function warmupAboutPage(): void {
  void ensureAboutPageReady();
}
