"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLinkIcon } from "@/components/ArrowIcon";
import { resolveLiveFlyerSrc } from "@/components/LiveFlyerCursorPreview";
import {
  formatLiveDateDisplay,
  formatLiveDateLineup,
  getLiveDateStatus,
  sortLiveDatesByStatus,
  type LiveDate,
  type LiveDateStatus,
} from "@/lib/live-dates";
import styles from "@/components/sections/LiveDates.module.css";

const FLYER_TOOLTIP_GAP = 16;

function useFlyerHoverEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return enabled;
}

function FlyerCursorTooltip({
  show,
  x,
  y,
}: {
  show: LiveDate;
  x: number;
  y: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const venue = show.venue.trim();
  const city = show.city.trim();
  const location = [venue, city].filter(Boolean).join(", ");

  return createPortal(
    <div
      className={styles.flyerTooltip}
      style={{
        transform: `translate3d(${x + FLYER_TOOLTIP_GAP}px, ${y + FLYER_TOOLTIP_GAP}px, 0)`,
      }}
      aria-hidden
    >
      <span className={styles.flyerTooltipDate}>{formatLiveDateDisplay(show.date)}</span>
      {location ? <span className={styles.flyerTooltipVenue}>{location}</span> : null}
    </div>,
    document.body,
  );
}

type ViewMode = "list" | "flyers";

type LiveDatesProps = {
  dates: LiveDate[];
};

function flyerAlt(show: LiveDate) {
  return `${show.city} — ${show.venue}`;
}

function LiveDateRow({ show }: { show: LiveDate }) {
  const link = show.link.trim();
  const hasLink = Boolean(link);
  const lineup = formatLiveDateLineup(show);
  const venue = show.venue.trim();
  const city = show.city.trim();

  return (
    <li className={styles.row}>
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

function ViewModeToggle({
  mode,
  onToggle,
}: {
  mode: ViewMode;
  onToggle: () => void;
}) {
  const showingFlyers = mode === "flyers";
  return (
    <button
      type="button"
      className={`${styles.viewToggle}${showingFlyers ? ` ${styles.viewToggleFlyers}` : ` ${styles.viewToggleList}`}`}
      onClick={onToggle}
      aria-pressed={showingFlyers}
      aria-label={showingFlyers ? "Mostra lista" : "Mostra flyer"}
      title={showingFlyers ? "Lista" : "Flyer"}
    >
      <span className={styles.viewToggleGlyph} aria-hidden>
        {showingFlyers ? "⁝" : "⊹"}
      </span>
    </button>
  );
}

export function LiveDates({ dates }: LiveDatesProps) {
  const [activeTab, setActiveTab] = useState<LiveDateStatus>("upcoming");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const flyerHoverEnabled = useFlyerHoverEnabled();
  const [hoverFlyer, setHoverFlyer] = useState<{
    show: LiveDate;
    x: number;
    y: number;
  } | null>(null);

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

  const flyerDates = useMemo(
    () => visibleDates.filter((show) => Boolean(show.flyer?.trim())),
    [visibleDates],
  );

  const showingFlyers = viewMode === "flyers";

  return (
    <div className={styles.shell}>
      <div className={styles.tabs} role="tablist" aria-label="Live dates">
        <ViewModeToggle
          mode={viewMode}
          onToggle={() => {
            setHoverFlyer(null);
            setViewMode((mode) => (mode === "list" ? "flyers" : "list"));
          }}
        />
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

      {showingFlyers ? (
        flyerDates.length === 0 ? (
          <p className={styles.empty}>No flyers available.</p>
        ) : (
          <div className={styles.flyerGrid}>
            {flyerDates.map((show) => {
              const flyer = show.flyer?.trim();
              if (!flyer) return null;
              const src = resolveLiveFlyerSrc(flyer);
              const link = show.link.trim();
              const image = (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={flyerAlt(show)}
                  className={styles.flyerGridImage}
                  draggable={false}
                  loading="lazy"
                />
              );

              return (
                <div
                  key={show.id}
                  className={styles.flyerGridItem}
                  {...(flyerHoverEnabled
                    ? {
                        onMouseEnter: (event) =>
                          setHoverFlyer({
                            show,
                            x: event.clientX,
                            y: event.clientY,
                          }),
                        onMouseMove: (event) =>
                          setHoverFlyer({
                            show,
                            x: event.clientX,
                            y: event.clientY,
                          }),
                        onMouseLeave: () =>
                          setHoverFlyer((prev) =>
                            prev?.show.id === show.id ? null : prev,
                          ),
                      }
                    : {})}
                >
                  {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {image}
                    </a>
                  ) : (
                    image
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : visibleDates.length === 0 ? (
        <p className={styles.empty}>
          {activeTab === "upcoming"
            ? "No upcoming dates scheduled. Please check back soon."
            : "No past dates yet."}
        </p>
      ) : (
        <ul className={styles.list}>
          {visibleDates.map((show) => (
            <LiveDateRow key={show.id} show={show} />
          ))}
        </ul>
      )}

      {showingFlyers && flyerHoverEnabled && hoverFlyer ? (
        <FlyerCursorTooltip
          show={hoverFlyer.show}
          x={hoverFlyer.x}
          y={hoverFlyer.y}
        />
      ) : null}
    </div>
  );
}
