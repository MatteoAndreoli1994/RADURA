"use client";

import { GridOverlayProvider } from "@/components/GridOverlayProvider";

export function GridOverlayRoot({ children }: { children: React.ReactNode }) {
  return <GridOverlayProvider>{children}</GridOverlayProvider>;
}
