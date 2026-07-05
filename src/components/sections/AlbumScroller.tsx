"use client";

import Image from "next/image";
import { gridShellClass } from "@/lib/grid";
import type { Release } from "@/lib/releases";
import styles from "@/components/sections/AlbumScroller.module.css";

type AlbumScrollerProps = {
  releases: Release[];
  onOpen: (id: string) => void;
  pendingReleaseId?: string | null;
  isActive?: boolean;
};

export function AlbumScroller({
  releases,
  onOpen,
  pendingReleaseId = null,
}: AlbumScrollerProps) {
  return (
    <div className={`${gridShellClass} in-flow-page-content ${styles.shell}`}>
      <ul className={styles.row}>
        {releases.map((release) => {
          const coverSrc = release.bandcampArtUrl ?? release.cover;
          const isLoading = pendingReleaseId === release.id;

          return (
            <li key={release.id} className={styles.item}>
              <button
                type="button"
                onClick={() => onOpen(release.id)}
                disabled={isLoading}
                aria-busy={isLoading}
                aria-label={`Apri ${release.title}`}
                className={`${styles.albumButton} ${isLoading ? styles.albumButtonLoading : ""}`}
              >
                <div className={styles.cover}>
                  <Image
                    src={coverSrc}
                    alt={release.title}
                    fill
                    quality={90}
                    draggable={false}
                    className="pointer-events-none object-cover object-center select-none"
                    sizes="(max-width: 767px) 50vw, 180px"
                  />
                </div>
                <span className={styles.title}>{release.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
