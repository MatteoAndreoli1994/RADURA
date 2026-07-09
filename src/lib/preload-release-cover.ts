import type { Release } from "@/lib/releases";

export function getReleaseCoverSrc(release: Release): string {
  return release.bandcampArtUrl ?? release.cover;
}

export function preloadReleaseCover(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}
