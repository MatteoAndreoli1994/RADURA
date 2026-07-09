"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { GridOverlay } from "@/components/GridOverlay";

type GridOverlayContextValue = {
  visible: boolean;
  toggle: () => void;
};

const GridOverlayContext = createContext<GridOverlayContextValue | null>(null);

export function useGridOverlay() {
  const context = useContext(GridOverlayContext);
  if (!context) {
    throw new Error("useGridOverlay must be used within GridOverlayProvider");
  }
  return context;
}

export function GridOverlayProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toggle = useCallback(() => setVisible((current) => !current), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const value = useMemo(
    () => ({
      visible,
      toggle,
    }),
    [visible, toggle],
  );

  return (
    <GridOverlayContext.Provider value={value}>
      {children}
      {visible && mounted ? createPortal(<GridOverlay />, document.body) : null}
    </GridOverlayContext.Provider>
  );
}
