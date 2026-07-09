"use client";

import { LiveDates } from "@/components/sections/LiveDates";
import { grid12Style, gridShellClass, mobileContentBelowNavClass } from "@/lib/grid";
import type { LiveDate } from "@/lib/live-dates";
import styles from "@/components/sections/LiveGallery.module.css";

type LiveGalleryProps = {
  liveDates: LiveDate[];
};

export function LiveGallery({ liveDates }: LiveGalleryProps) {
  return (
    <section
      id="lives"
      className={`relative flex w-full flex-col overflow-hidden bg-background max-md:h-dvh ${mobileContentBelowNavClass} md:min-h-full md:flex-1 md:overflow-visible md:pt-0`}
    >
      <div className={`${gridShellClass} in-flow-page-content flex min-h-0 w-full flex-1 flex-col md:min-h-full`}>
        <div className={`${styles.layout} flex-1`} style={grid12Style}>
          <div className={styles.contentCol}>
            <LiveDates dates={liveDates} />
          </div>
        </div>
      </div>
    </section>
  );
}
