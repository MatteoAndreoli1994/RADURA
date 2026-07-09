"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { pathFromView, viewFromPath } from "@/lib/view-routes";
import { ensureAboutPageReady } from "@/lib/preload-about-page";
import { ensureMusicPageReady } from "@/lib/preload-music-page";

export type SiteView = "home" | "about" | "live" | "music";

export type PageTransitionPhase = "idle" | "out" | "in";

export const PAGE_FADE_OUT_MS = 200;
export const PAGE_FADE_IN_MS = 280;

export const VIEW_ORDER: SiteView[] = ["home", "about", "live", "music"];

export const VIEW_LINKS: { view: SiteView; label: string }[] = [
  { view: "music", label: "Music" },
  { view: "live", label: "Live" },
  { view: "about", label: "About" },
];

function prepareForView(next: SiteView): Promise<void> | void {
  if (next === "music") return ensureMusicPageReady();
  if (next === "about") return ensureAboutPageReady();
}

type ViewContextValue = {
  view: SiteView;
  goToView: (view: SiteView) => void;
  commitView: (view: SiteView) => void;
  runTransition: (onMidpoint: () => void) => boolean;
  isTransitioning: boolean;
  transitionPhase: PageTransitionPhase;
};

const ViewContext = createContext<ViewContextValue | null>(null);

function isLegalPath(pathname: string) {
  return pathname === "/legal" || pathname.startsWith("/legal/");
}

export function ViewProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<SiteView>(() => viewFromPath(pathname));

  const viewRef = useRef(view);
  viewRef.current = view;
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const pathnameSyncedRef = useRef(false);
  const skipPathSyncRef = useRef(false);
  const transitionTimersRef = useRef<{ out?: number; in?: number }>({});
  const [transitionPhase, setTransitionPhase] = useState<PageTransitionPhase>("idle");

  useEffect(() => {
    return () => {
      if (transitionTimersRef.current.out) {
        window.clearTimeout(transitionTimersRef.current.out);
      }
      if (transitionTimersRef.current.in) {
        window.clearTimeout(transitionTimersRef.current.in);
      }
    };
  }, []);

  const runTransition = useCallback(
    (
      onMidpoint: () => void | Promise<void>,
      options?: { prepare?: () => void | Promise<void> },
    ) => {
      if (transitionTimersRef.current.out) {
        window.clearTimeout(transitionTimersRef.current.out);
      }
      if (transitionTimersRef.current.in) {
        window.clearTimeout(transitionTimersRef.current.in);
      }

      setTransitionPhase("out");

      const fadeOut = new Promise<void>((resolve) => {
        transitionTimersRef.current.out = window.setTimeout(resolve, PAGE_FADE_OUT_MS);
      });

      const prepare = Promise.resolve(options?.prepare?.());

      void Promise.all([fadeOut, prepare]).then(async () => {
        await onMidpoint();
        setTransitionPhase("in");

        transitionTimersRef.current.in = window.setTimeout(() => {
          setTransitionPhase("idle");
        }, PAGE_FADE_IN_MS);
      });

      return true;
    },
    [],
  );

  const commitView = useCallback((next: SiteView) => {
    setView(next);
  }, []);

  const goToView = useCallback(
    (next: SiteView) => {
      if (next === viewRef.current) return;

      const targetPath = pathFromView(next);
      skipPathSyncRef.current = true;

      runTransition(
        () => {
          commitView(next);
          if (pathnameRef.current !== targetPath) {
            router.push(targetPath);
          }
        },
        { prepare: () => prepareForView(next) },
      );
    },
    [commitView, router, runTransition],
  );

  useEffect(() => {
    if (isLegalPath(pathname)) {
      skipPathSyncRef.current = false;
      return;
    }

    const fromPath = viewFromPath(pathname);
    if (fromPath === viewRef.current) {
      skipPathSyncRef.current = false;
      return;
    }

    if (!pathnameSyncedRef.current) {
      pathnameSyncedRef.current = true;
      if (fromPath === "music") {
        void ensureMusicPageReady().then(() => setView(fromPath));
        return;
      }
      if (fromPath === "about") {
        void ensureAboutPageReady().then(() => setView(fromPath));
        return;
      }
      setView(fromPath);
      skipPathSyncRef.current = false;
      return;
    }

    if (skipPathSyncRef.current) {
      return;
    }

    runTransition(() => setView(fromPath), { prepare: () => prepareForView(fromPath) });
  }, [pathname, runTransition]);

  const goByOffset = useCallback(
    (delta: number) => {
      const idx = VIEW_ORDER.indexOf(viewRef.current);
      const nextIdx = Math.min(
        VIEW_ORDER.length - 1,
        Math.max(0, idx + delta),
      );
      if (nextIdx === idx) return;
      goToView(VIEW_ORDER[nextIdx]);
    },
    [goToView],
  );

  useEffect(() => {
    const COOLDOWN = 120;
    let lastTrigger = 0;

    const canTrigger = () => {
      const now = Date.now();
      if (now - lastTrigger < COOLDOWN) return false;
      lastTrigger = now;
      return true;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        if (!canTrigger()) return;
        goByOffset(1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        if (!canTrigger()) return;
        goByOffset(-1);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goByOffset]);

  const value = useMemo(
    () => ({
      view,
      goToView,
      commitView,
      runTransition,
      isTransitioning: transitionPhase !== "idle",
      transitionPhase,
    }),
    [view, goToView, commitView, runTransition, transitionPhase],
  );

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useView() {
  const ctx = useContext(ViewContext);
  if (!ctx) {
    throw new Error("useView must be used within ViewProvider");
  }
  return ctx;
}
