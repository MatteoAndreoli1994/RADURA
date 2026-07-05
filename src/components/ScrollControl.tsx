"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ScrollControlContextValue = {
  isPlayerScrollLocked: boolean;
  setPlayerScrollLock: (locked: boolean) => void;
};

const ScrollControlContext = createContext<ScrollControlContextValue | null>(
  null,
);

export function ScrollControlProvider({ children }: { children: ReactNode }) {
  const [isPlayerScrollLocked, setLocked] = useState(false);

  const setPlayerScrollLock = useCallback((locked: boolean) => {
    setLocked(locked);
  }, []);

  const value = useMemo(
    () => ({ isPlayerScrollLocked, setPlayerScrollLock }),
    [isPlayerScrollLocked, setPlayerScrollLock],
  );

  return (
    <ScrollControlContext.Provider value={value}>
      {children}
    </ScrollControlContext.Provider>
  );
}

export function useScrollControl() {
  const ctx = useContext(ScrollControlContext);
  if (!ctx) {
    throw new Error("useScrollControl must be used within ScrollControlProvider");
  }
  return ctx;
}
