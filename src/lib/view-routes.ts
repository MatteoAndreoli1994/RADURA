import type { SiteView } from "@/components/ViewProvider";
import { RELEASES } from "@/lib/releases";

const VIEW_PATHS: Record<SiteView, string> = {
  home: "/",
  about: "/about",
  live: "/live",
  music: "/music",
};

const PATH_TO_VIEW: Record<string, SiteView> = {
  "/": "home",
  "/about": "about",
  "/live": "live",
  "/music": "music",
};

const MUSIC_ALBUM_PATH = /^\/music\/([^/]+)$/;

export function pathFromView(view: SiteView): string {
  return VIEW_PATHS[view];
}

export function viewFromPath(pathname: string): SiteView {
  if (pathname === "/music" || MUSIC_ALBUM_PATH.test(pathname)) {
    return "music";
  }
  return PATH_TO_VIEW[pathname] ?? "home";
}

export function releaseSlugFromId(releaseId: string): string | null {
  const release = RELEASES.find((item) => item.id === releaseId);
  return release?.slug ?? null;
}

export function releaseIdFromSlug(slug: string): string | null {
  const release = RELEASES.find((item) => item.slug === slug);
  return release?.id ?? null;
}

export function pathFromMusic(releaseId?: string | null): string {
  if (!releaseId) return "/music";
  const slug = releaseSlugFromId(releaseId);
  return slug ? `/music/${slug}` : "/music";
}

export function releaseIdFromPath(pathname: string): string | null {
  const match = pathname.match(MUSIC_ALBUM_PATH);
  if (!match) return null;
  return releaseIdFromSlug(match[1]);
}
