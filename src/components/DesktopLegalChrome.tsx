"use client";

import { CookieSettingsLink } from "@/components/CookieSettingsLink";
import { LegalLink } from "@/components/LegalLink";
import { grid12Style, gridShellClass } from "@/lib/grid";
import styles from "@/components/DesktopLegalChrome.module.css";

type DesktopLegalChromeProps = {
  light?: boolean;
};

export function DesktopLegalChrome({ light = false }: DesktopLegalChromeProps) {
  const linkClass = light ? `${styles.link} ${styles.linkLight}` : styles.link;

  return (
    <div
      className={`${styles.shell} site-chrome-control pointer-events-none fixed inset-x-0 bottom-0 z-50 hidden md:block`}
      style={{
        paddingBottom: `calc(
          var(--site-player-bar-height, 28px) + var(--site-chrome-bottom) +
            env(safe-area-inset-bottom, 0px) + env(safe-area-inset-bottom, 0px)
        )`,
      }}
    >
      <div className={gridShellClass}>
        <div className={styles.inner} style={grid12Style}>
          <div className={styles.linksCol}>
            <LegalLink lang="en" className={linkClass} />
            <CookieSettingsLink lang="en" className={linkClass} />
          </div>
        </div>
      </div>
    </div>
  );
}
