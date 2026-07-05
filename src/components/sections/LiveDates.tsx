"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLinkIcon } from "@/components/ArrowIcon";
import { preloadLiveFlyer } from "@/components/LiveFlyerCursorPreview";
import {
  formatLiveDateDisplay,
  formatLiveDateLineup,
  getLiveDateStatus,
  getNearestLiveWithFlyer,
  sortLiveDatesByStatus,
  type LiveDate,
  type LiveDateStatus,
} from "@/lib/live-dates";
import styles from "@/components/sections/LiveDates.module.css";

type HoveredFlyer = {
  src: string;
  alt: string;
};

type LiveDatesProps = {
  dates: LiveDate[];
  onFlyerHover?: (flyer: HoveredFlyer | null) => void;
};

function flyerAlt(show: LiveDate) {
  return `${show.city} — ${show.venue}`;
}

function flyerFromShow(show: LiveDate): HoveredFlyer | null {
  const src = show.flyer?.trim();
  if (!src) return null;
  return { src, alt: flyerAlt(show) };
}

function defaultFlyerForTab(dates: LiveDate[], status: LiveDateStatus): HoveredFlyer | null {
  const nearest = getNearestLiveWithFlyer(dates, status);
  return nearest ? flyerFromShow(nearest) : null;
}

function canHoverPreview() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function LiveDateRow({
  show,
  onFlyerHover,
}: {
  show: LiveDate;
  onFlyerHover?: (flyer: HoveredFlyer | null) => void;
}) {
  const link = show.link.trim();
  const hasLink = Boolean(link);
  const lineup = formatLiveDateLineup(show);
  const venue = show.venue.trim();
  const city = show.city.trim();
  const flyer = show.flyer?.trim();
  const hasFlyer = Boolean(flyer);

  function showFlyerPreview() {
    if (!hasFlyer || !onFlyerHover) return;
    const preview = flyerFromShow(show);
    if (preview) onFlyerHover(preview);
  }

  function clearFlyerPreview() {
    if (!onFlyerHover || !canHoverPreview()) return;
    onFlyerHover(null);
  }

  function handleRowClick() {
    if (!hasFlyer || canHoverPreview()) return;
    showFlyerPreview();
  }

  return (
    <li
      className={`${styles.row}${hasFlyer ? ` ${styles.rowWithFlyer}` : ""}`}
      onMouseEnter={hasFlyer ? showFlyerPreview : undefined}
      onMouseLeave={hasFlyer ? clearFlyerPreview : undefined}
      onFocus={hasFlyer ? showFlyerPreview : undefined}
      onBlur={hasFlyer ? clearFlyerPreview : undefined}
      onClick={hasFlyer ? handleRowClick : undefined}
    >
      <div className={styles.rowMain}>
        <span className={styles.dateCell}>{formatLiveDateDisplay(show.date)}</span>
        <span className={styles.codeCell}>{show.code ?? ""}</span>
        <span className={styles.cityCell}>{city}</span>
        <span className={styles.venueCell}>{venue}</span>
        {lineup ? (
          <span className={styles.lineupCell}>{lineup}</span>
        ) : (
          <span className={styles.lineupCell} aria-hidden="true" />
        )}
        {hasLink ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Apri link esterno — ${show.city}`}
            className={`${styles.linkCell} ${styles.link}`}
            onClick={(event) => event.stopPropagation()}
          >
            <span>Link</span>
            <ExternalLinkIcon size={12} />
          </a>
        ) : (
          <span className={styles.linkCell} aria-hidden="true" />
        )}
      </div>
    </li>
  );
}

export function LiveDates({ dates, onFlyerHover }: LiveDatesProps) {
  const [activeTab, setActiveTab] = useState<LiveDateStatus>("upcoming");

  const groupedDates = useMemo(() => {
    const upcoming = sortLiveDatesByStatus(
      dates.filter((show) => getLiveDateStatus(show) !== "past"),
      "upcoming",
    );
    const past = sortLiveDatesByStatus(
      dates.filter((show) => getLiveDateStatus(show) === "past"),
      "past",
    );

    return { upcoming, past };
  }, [dates]);

  const visibleDates =
    activeTab === "past" ? groupedDates.past : groupedDates.upcoming;

  useEffect(() => {
    if (canHoverPreview()) {
      onFlyerHover?.(null);
      return;
    }

    onFlyerHover?.(defaultFlyerForTab(dates, activeTab));
  }, [activeTab, dates, onFlyerHover]);

  useEffect(() => {
    visibleDates.forEach((show) => {
      const src = show.flyer?.trim();
      if (src) void preloadLiveFlyer(src);
    });

    const nearest = getNearestLiveWithFlyer(dates, activeTab);
    const nearestSrc = nearest?.flyer?.trim();
    if (nearestSrc) void preloadLiveFlyer(nearestSrc);
  }, [activeTab, dates, visibleDates]);

  return (
    <div className={styles.shell}>
      <div className={styles.tabs} role="tablist" aria-label="Live dates">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "upcoming"}
          className={`${styles.tab}${activeTab === "upcoming" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "past"}
          className={`${styles.tab}${activeTab === "past" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Past
        </button>
      </div>

      {visibleDates.length === 0 ? (
        <p className={styles.empty}>
          {activeTab === "upcoming"
            ? "No upcoming dates scheduled. Please check back soon."
            : "No past dates yet."}
        </p>
      ) : (
        <ul className={styles.list}>
          {visibleDates.map((show) => (
            <LiveDateRow key={show.id} show={show} onFlyerHover={onFlyerHover} />
          ))}
        </ul>
      )}
    </div>
  );
}
