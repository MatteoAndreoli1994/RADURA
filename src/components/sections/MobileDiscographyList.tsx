"use client";

import Image from "next/image";
import { gridShellClass } from "@/lib/grid";
import type { Release } from "@/lib/releases";

type MobileDiscographyListProps = {
  releases: Release[];
  pendingReleaseId: string | null;
  onOpen: (id: string) => void;
};

const getYear = (release: Release) => {
  const match = release.releaseDate?.match(/\d{4}/);
  return match ? match[0] : "";
};

export function MobileDiscographyList({
  releases,
  pendingReleaseId,
  onOpen,
}: MobileDiscographyListProps) {
  return (
    <div className={gridShellClass}>
      <ul className="m-0 flex list-none flex-col gap-6 p-0">
        {releases.map((release, index) => {
          const coverSrc = release.bandcampArtUrl ?? release.cover;
          const year = getYear(release);
          const isLoading = pendingReleaseId === release.id;
          const priority = index < 2;

          return (
            <li key={release.id}>
              <button
                type="button"
                onClick={() => onOpen(release.id)}
                disabled={isLoading}
                aria-busy={isLoading}
                aria-label={`Apri ${release.title}`}
                className={`block w-full cursor-pointer touch-manipulation border-0 bg-transparent p-0 text-left text-black transition-opacity duration-200 ${
                  isLoading ? "opacity-50" : ""
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#f5f5f3]">
                  <Image
                    src={coverSrc}
                    alt={release.title}
                    fill
                    quality={90}
                    priority={priority}
                    draggable={false}
                    className="pointer-events-none object-cover object-center select-none"
                    sizes="100vw"
                  />
                </div>

                <div className="mt-2 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="m-0">{release.title}</p>
                    <p className="m-0 mt-0.5 mb-0.5">Radura</p>
                  </div>

                  {year ? (
                    <span className="shrink-0 pt-px tabular-nums">{year}</span>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
