export const GRID_COLUMNS = 12;
export const GRID_MARGIN = 50;
export const GRID_GUTTER = 20;

/** Horizontal page padding on mobile — matches navbar `--home-mobile-pad-x`. */
export const mobileSitePadXClass =
  "max-[767px]:pl-[var(--home-mobile-pad-x)] max-[767px]:pr-[var(--home-mobile-pad-x)]";

/** Top offset below fixed mobile navbar — matches home. */
export const mobileContentBelowNavClass =
  "max-[767px]:pt-[var(--mobile-content-below-nav)]";

export const gridShellClass =
  `mx-auto w-full max-w-[1600px] pl-[50px] pr-[50px] ${mobileSitePadXClass}`;

/** Matches release player + release-view top nav column gap on desktop */
export const releaseLayoutGapClass = "md:gap-x-12";

export const releaseLayoutGridClass =
  `md:grid md:grid-cols-12 ${releaseLayoutGapClass}`;

export const releaseContentColumnClass = "md:col-span-8 md:col-start-5";

export const releaseViewTopPaddingClass =
  "md:pt-[calc(var(--nav-offset)+1.5rem)]";

export const grid12Style = {
  display: "grid",
  gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
  columnGap: GRID_GUTTER,
} as const;
