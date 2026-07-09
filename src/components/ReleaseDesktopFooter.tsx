"use client";

import { AboutDesktopPlayer } from "@/components/AboutDesktopPlayer";
import styles from "@/components/ReleaseDesktopFooter.module.css";

export function ReleaseDesktopFooter() {
  return (
    <footer className={`in-flow-page-footer ${styles.footer}`}>
      <div className={styles.inner}>
        <div className={styles.playerCol}>
          <AboutDesktopPlayer className={styles.playerShell} />
        </div>
      </div>
    </footer>
  );
}
