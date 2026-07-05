"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { ReleaseShareButton } from "@/components/ReleaseShareButton";
import type { BandcampTrack } from "@/lib/bandcamp-album";
import { getReleaseCoverSrc } from "@/lib/preload-release-cover";
import { mobileContentBelowNavClass, releaseViewTopPaddingClass } from "@/lib/grid";
import { isReleasePlayable, type Release } from "@/lib/releases";
import styles from "@/components/sections/ReleasePlayer.module.css";

type ReleasePlayerProps = {
  release: Release;
  tracks: BandcampTrack[];
  isOpen: boolean;
  onBack: () => void;
};

type CreditEntry = {
  role: string;
  detail: string;
};

type ReleaseCreditsData = {
  released: string;
  entries: readonly CreditEntry[];
};

const EFFETTO_CREDITS: ReleaseCreditsData = {
  released: "April 7, 2021",
  entries: [
    { role: "Songs", detail: "Written and performed by Radura" },
    {
      role: "Guest vocals",
      detail:
        "Gianluca Nicastro (Øjne), Giuseppe Del Re (Chivàla) on Tutto Il Tempo Che Ho Passato A Non Vedere",
    },
    {
      role: "Violin",
      detail: "Lucia Castiglioni on Costellazione||Pareidolia",
    },
    { role: "Recorded", detail: "Mario Rizzotto · Scatola Nera Studio, Milano" },
    { role: "Drums", detail: "Frequenze Studio, Monza" },
    {
      role: "Mixed & mastered",
      detail: "Riccardo Pasini · Studio 73, Ravenna",
    },
    { role: "Photos", detail: "Luca Giuseppe D'Aloia" },
    { role: "Graphic design", detail: "Alice Blu" },
  ],
};

const FARO_CREDITS: ReleaseCreditsData = {
  released: "October 1, 2017",
  entries: [
    { role: "Artwork", detail: "Novilunium Eyes" },
    { role: "Recording", detail: "Radura" },
    { role: "Drums", detail: "Marco Bergamini · SAE Institute, Milan" },
    { role: "Guitars", detail: "Stefano Reale" },
    { role: "Vocals", detail: "Luca · Frequenze Studio" },
    { role: "Mixing", detail: "Mario Rizzotto" },
    { role: "Mastering", detail: "Will Killingsworth · Dead Air Studios" },
    { role: "Production", detail: "Self-produced with Dischi Decenti" },
  ],
};

const RADURA_EP_CREDITS: ReleaseCreditsData = {
  released: "May 2, 2016",
  entries: [
    { role: "Lyrics & vocals", detail: "Luca" },
    { role: "Second voice", detail: "Ietto" },
    {
      role: "Recording",
      detail:
        "First demo EP, recorded in a school without effects, samples or triggers",
    },
    { role: "Recorded & mixed", detail: "EMIT Feltrinelli Scholars" },
    { role: "Mastered", detail: "Federico Ascari · Wavemotion Recordings" },
    { role: "Artbooks & photos", detail: "Emanuele Hueller" },
  ],
};

const SPLIT_CREDITS: ReleaseCreditsData = {
  released: "December 16, 2018",
  entries: [
    {
      role: "Recorded, mixed & mastered",
      detail: "Mario Rizzotto · Pioggiadanza Produzioni · July–August 2018",
    },
    { role: "Cover photo", detail: "Jacopo Bertoglio" },
    { role: "Graphic design", detail: "Natty Peterkin" },
    { role: "Booklet photo", detail: "Mauro Tiozzo" },
    {
      role: "Co-production",
      detail:
        "Callous Records, Dischi Decenti, Krampus MGMT, Non Ti Seguo Records, Vox Hole Collective",
    },
  ],
};

function creditsForRelease(release: Release): ReleaseCreditsData | null {
  if (release.slug === "effetto-della-veduta-dinsieme" || release.id === "apr-2021") {
    return EFFETTO_CREDITS;
  }
  if (release.slug === "la-fine-degli-uomini-faro" || release.id === "2017") {
    return FARO_CREDITS;
  }
  if (release.slug === "radura-ep" || release.id === "2016") {
    return RADURA_EP_CREDITS;
  }
  if (release.slug === "split-w-flowers-shelters" || release.id === "2018") {
    return SPLIT_CREDITS;
  }
  return null;
}

function creditParagraphs(release: Release): string[] {
  if (release.credits?.paragraphs?.length) {
    return release.credits.paragraphs;
  }

  const legacy = creditsForRelease(release);
  if (!legacy) return [];

  return legacy.entries.map((entry) => `${entry.role}: ${entry.detail}`);
}

function releasedDateForRelease(release: Release): string | null {
  return release.releaseDate ?? creditsForRelease(release)?.released ?? null;
}

type ReleaseTracklistProps = {
  release: Release;
  tracks: BandcampTrack[];
  canPlayRelease: boolean;
};

function ReleaseTracklist({ release, tracks, canPlayRelease }: ReleaseTracklistProps) {
  const { nowPlaying, isPlaying, playTrack, togglePlayback } = useBandcampSession();

  return (
    <div className={styles.tracklistBlock}>
      <p className={styles.metaLabel}>Tracklist</p>
      <ul className={styles.tracklist}>
        {tracks.length === 0 ? (
          <li className={styles.trackItem}>
            <span className={styles.trackButton}>Tracklist unavailable</span>
          </li>
        ) : null}
        {tracks.map((track, index) => {
          const isCurrentTrack =
            nowPlaying?.releaseId === release.id && nowPlaying.trackId === track.id;
          const isPlayingTrack = isCurrentTrack && isPlaying;

          const onActivateTrack = () => {
            if (!canPlayRelease) return;
            if (isCurrentTrack && isPlaying) {
              togglePlayback();
              return;
            }
            playTrack(release, track, tracks);
          };

          return (
            <li key={track.id} className={styles.trackItem}>
              <button
                type="button"
                onClick={onActivateTrack}
                disabled={!canPlayRelease}
                className={`${styles.trackButton} ${
                  isPlayingTrack ? styles.trackButtonActive : ""
                } ${!canPlayRelease ? styles.trackButtonInactive : ""}`}
              >
                <span className={styles.trackIndex}>{index + 1}.</span>{" "}
                <span className={styles.trackTitle}>{track.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type ReleaseReleasedMetaProps = {
  release: Release;
  releasedDate: string;
  shareTrackTitle: string | null;
};

function ReleaseReleasedMeta({
  release,
  releasedDate,
  shareTrackTitle,
  showShare = true,
}: ReleaseReleasedMetaProps & { showShare?: boolean }) {
  return (
    <div className={styles.metaBlock}>
      <div className={styles.releasedHeaderRow}>
        <div className={styles.releasedInfo}>
          <p className={styles.metaLabel}>Released</p>
          <p className={styles.releasedDate}>{releasedDate}</p>
        </div>
        {showShare ? (
          <ReleaseShareButton
            release={release}
            trackTitle={shareTrackTitle}
            label="Share"
            className={styles.inlineShare}
          />
        ) : null}
      </div>
    </div>
  );
}

export function ReleasePlayer({ release, tracks, isOpen, onBack }: ReleasePlayerProps) {
  const { nowPlaying } = useBandcampSession();
  const coverSrc = getReleaseCoverSrc(release);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!isOpen || event.key !== "Escape") return;
      onBack();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onBack]);

  const canPlayRelease = isReleasePlayable(release);
  const creditLines = creditParagraphs(release);
  const releasedDate = releasedDateForRelease(release);
  const shareTrackTitle =
    nowPlaying?.releaseId === release.id ? nowPlaying.trackTitle : null;

  const coverImage = (
    <div className={styles.coverFrame}>
      <Image
        src={coverSrc}
        alt={release.title}
        width={960}
        height={960}
        priority
        quality={95}
        className={styles.coverImage}
        sizes="(max-width: 767px) 100vw, 25vw"
      />
    </div>
  );

  const albumHeader = (
    <div className={styles.albumHeader}>
      <h2 className={styles.albumTitle}>{release.title}</h2>
      <p className={styles.artistName}>
        <Link href="/music" onClick={onBack} className={styles.artistLink}>
          Radura
        </Link>
      </p>
    </div>
  );

  const creditsBlock =
    creditLines.length > 0 ? (
      <div className={styles.credits}>
        {creditLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    ) : null;

  return (
    <div className="release-page-body flex min-h-0 w-full flex-col max-md:flex-1">
      <div
        className={`${styles.section} flex min-h-0 w-full flex-1 flex-col max-md:overflow-y-auto max-md:overscroll-contain max-md:pb-0 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:overflow-visible md:pb-0`}
        data-internal-scroll
        data-lenis-prevent
      >
        <div className={styles.mobileLayout}>
          <div className={`${styles.mobileReleaseShell} ${mobileContentBelowNavClass}`}>
            {coverImage}
            <div className={styles.mobileAlbumHeaderRow}>
              {albumHeader}
              <ReleaseShareButton
                release={release}
                trackTitle={shareTrackTitle}
                label="Share"
                className={styles.inlineShare}
              />
            </div>
            {releasedDate ? (
              <ReleaseReleasedMeta
                release={release}
                releasedDate={releasedDate}
                shareTrackTitle={shareTrackTitle}
                showShare={false}
              />
            ) : null}
            <ReleaseTracklist
              release={release}
              tracks={tracks}
              canPlayRelease={canPlayRelease}
            />
            {creditsBlock}
          </div>
          <div className={styles.mobilePlayerSpacer} aria-hidden />
        </div>

        <div className={`${styles.desktopLayout} ${releaseViewTopPaddingClass}`}>
          <div className={styles.leftCol}>
            {coverImage}
            {releasedDate ? (
              <ReleaseReleasedMeta
                release={release}
                releasedDate={releasedDate}
                shareTrackTitle={shareTrackTitle}
              />
            ) : null}
            <ReleaseTracklist
              release={release}
              tracks={tracks}
              canPlayRelease={canPlayRelease}
            />
          </div>

          <div className={styles.rightCol}>
            {albumHeader}
            {creditsBlock}
          </div>
        </div>
      </div>
    </div>
  );
}
