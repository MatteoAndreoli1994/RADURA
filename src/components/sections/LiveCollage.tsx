"use client";

import { useCallback, useRef, useState } from "react";
import { LazyLiveImage } from "@/components/LazyLiveImage";

type CollageItem = {
  id: string;
  src: string;
  alt: string;
  aspect: string;
  desktop: string;
  fit?: "cover" | "contain";
};

function rectsOverlap(a: DOMRect, b: DOMRect) {
  return !(
    a.right <= b.left ||
    a.left >= b.right ||
    a.bottom <= b.top ||
    a.top >= b.bottom
  );
}

function zIndexOf(el: HTMLElement) {
  return Number.parseInt(window.getComputedStyle(el).zIndex, 10) || 0;
}

export function LiveCollage({ items }: { items: CollageItem[] }) {
  const figureRefs = useRef(new Map<string, HTMLElement>());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dimmedIds, setDimmedIds] = useState<Set<string>>(new Set());

  const handleMouseEnter = useCallback((id: string) => {
    const hoveredEl = figureRefs.current.get(id);
    if (!hoveredEl) return;

    const hoveredRect = hoveredEl.getBoundingClientRect();
    const hoveredZ = zIndexOf(hoveredEl);
    const nextDimmed = new Set<string>();

    for (const [otherId, el] of figureRefs.current) {
      if (otherId === id) continue;
      if (
        zIndexOf(el) > hoveredZ &&
        rectsOverlap(hoveredRect, el.getBoundingClientRect())
      ) {
        nextDimmed.add(otherId);
      }
    }

    setHoveredId(id);
    setDimmedIds(nextDimmed);
  }, []);

  const clearHover = useCallback(() => {
    setHoveredId(null);
    setDimmedIds(new Set());
  }, []);

  const handleFigureMouseLeave = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const next = event.relatedTarget;
      if (next instanceof Element && next.closest(".live-collage figure")) {
        return;
      }
      clearHover();
    },
    [clearHover],
  );

  return (
    <div
      className="live-collage relative isolate mx-auto hidden h-full w-full max-w-5xl md:block"
      onMouseLeave={clearHover}
    >
      {items.map((item) => {
        const isHovered = hoveredId === item.id;
        const isDimmed = hoveredId !== null && dimmedIds.has(item.id);

        return (
          <LazyLiveImage
            key={item.id}
            src={item.src}
            alt={item.alt}
            aspect={item.aspect}
            fit={item.fit}
            figureRef={(node) => {
              if (node) figureRefs.current.set(item.id, node);
              else figureRefs.current.delete(item.id);
            }}
            onFigureMouseEnter={() => handleMouseEnter(item.id)}
            onFigureMouseLeave={handleFigureMouseLeave}
            figureStyle={isHovered ? { zIndex: 50 } : undefined}
            className={`${item.desktop} ${
              hoveredId !== null ? "transition-opacity duration-[1200ms] ease" : ""
            }${isDimmed ? " opacity-[0.42]" : ""}`}
          />
        );
      })}
    </div>
  );
}
