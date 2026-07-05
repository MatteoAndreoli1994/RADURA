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

export type SiteView = "home" | "about" | "live" | "music";

export const VIEW_ORDER: SiteView[] = ["home", "about", "live", "music"];

export const VIEW_LINKS: { view: SiteView; label: string }[] = [
  { view: "music", label: "Music" },
  { view: "live", label: "Live" },
  { view: "about", label: "About" },
];

type ViewContextValue = {
  view: SiteView;
  goToView: (view: SiteView) => void;
  commitView: (view: SiteView) => void;
  runTransition: (onMidpoint: () => void) => boolean;
  isTransitioning: boolean;
};

const ViewContext = createContext<ViewContextValue | null>(null);

export function ViewProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<SiteView>(() => viewFromPath(pathname));

  const viewRef = useRef(view);
  viewRef.current = view;
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const pathnameSyncedRef = useRef(false);

  const runTransition = useCallback((onMidpoint: () => void) => {
    onMidpoint();
    return true;
  }, []);

  const commitView = useCallback((next: SiteView) => {
    setView(next);
  }, []);

  const goToView = useCallback(
    (next: SiteView) => {
      if (next === viewRef.current) return;

      const targetPath = pathFromView(next);

      runTransition(() => {
        if (pathnameRef.current !== targetPath) {
          router.push(targetPath);
        }
        commitView(next);
      });
    },
    [commitView, router, runTransition],
  );

  useEffect(() => {
    const fromPath = viewFromPath(pathname);
    if (fromPath === viewRef.current) return;

    if (!pathnameSyncedRef.current) {
      pathnameSyncedRef.current = true;
      setView(fromPath);
      return;
    }

    runTransition(() => setView(fromPath));
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
      isTransitioning: false,
    }),
    [view, goToView, commitView, runTransition],
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
