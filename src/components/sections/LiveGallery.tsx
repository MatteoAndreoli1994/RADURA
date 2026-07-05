"use client";

import { useEffect, useState } from "react";
import { LiveDates } from "@/components/sections/LiveDates";
import { resolveLiveFlyerSrc } from "@/components/LiveFlyerCursorPreview";
import { grid12Style, gridShellClass, mobileContentBelowNavClass } from "@/lib/grid";
import type { LiveDate } from "@/lib/live-dates";
import styles from "@/components/sections/LiveGallery.module.css";

type HoveredFlyer = {
  src: string;
  alt: string;
};

type LiveGalleryProps = {
  liveDates: LiveDate[];
};

export function LiveGallery({ liveDates }: LiveGalleryProps) {
  const [hoveredFlyer, setHoveredFlyer] = useState<HoveredFlyer | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const flyerSrc = hoveredFlyer ? resolveLiveFlyerSrc(hoveredFlyer.src) : null;

  return (
    <section
      id="lives"
      className={`relative flex w-full flex-col overflow-hidden bg-background max-md:h-dvh ${mobileContentBelowNavClass} md:min-h-full md:flex-1 md:overflow-visible md:pt-0`}
    >
      <div className={`${gridShellClass} in-flow-page-content flex min-h-0 w-full flex-1 flex-col md:min-h-full`}>
        <div className={`${styles.layout} flex-1`} style={grid12Style}>
          <div className={styles.imageCol} aria-hidden={!hoveredFlyer}>
            <div className={styles.imageFrame}>
              {mounted && flyerSrc && hoveredFlyer ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={flyerSrc}
                  src={flyerSrc}
                  alt={hoveredFlyer.alt}
                  className={styles.flyerImage}
                  draggable={false}
                />
              ) : null}
            </div>
          </div>

          <div className={styles.contentCol}>
            <LiveDates dates={liveDates} onFlyerHover={setHoveredFlyer} />
          </div>
        </div>
      </div>
    </section>
  );
}
