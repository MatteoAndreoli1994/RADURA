"use client";

import { CookieSettingsLink } from "@/components/CookieSettingsLink";
import { LegalLink } from "@/components/LegalLink";
import styles from "@/components/DesktopSiteFooter.module.css";

type AboutDesktopFooterProps = {
  tone?: "dark" | "light";
  showLegalLinks?: boolean;
};

export function AboutDesktopFooter({
  tone = "dark",
  showLegalLinks = false,
}: AboutDesktopFooterProps) {
  const linkClass =
    tone === "light" ? `${styles.aboutLink} ${styles.aboutLinkLight}` : styles.aboutLink;

  if (!showLegalLinks) {
    return null;
  }

  return (
    <footer className={`in-flow-page-footer ${styles.aboutFooterInFlow} ${styles.aboutFooterLegalLeft}`}>
      <div className={styles.aboutFooterInner}>
        <div className={styles.aboutLegalLinksCol}>
          <LegalLink lang="en" className={linkClass} />
          <CookieSettingsLink lang="en" className={linkClass} />
        </div>
      </div>
    </footer>
  );
}
