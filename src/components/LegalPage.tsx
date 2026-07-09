"use client";

import { useEffect, useState } from "react";
import { gridShellClass, mobileContentBelowNavClass } from "@/lib/grid";
import { LEGAL_COPY, type LegalLang } from "@/lib/legal-copy";
import styles from "@/components/LegalPage.module.css";

type LegalPageProps = {
  section?: "privacy" | "cookies";
};

function LegalLangToggle({
  lang,
  onChange,
}: {
  lang: LegalLang;
  onChange: (lang: LegalLang) => void;
}) {
  return (
    <div className={styles.langToggle} role="group" aria-label="Legal page language">
      {(["en", "it"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={lang === value}
          className={`${styles.langButton}${lang === value ? ` ${styles.langButtonActive}` : ""}`}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function LegalPage({ section }: LegalPageProps) {
  const [lang, setLang] = useState<LegalLang>("en");
  const copy = LEGAL_COPY[lang];

  useEffect(() => {
    if (!section) return;
    const target = document.getElementById(section);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [section]);

  return (
    <section
      className={`legal-page no-scrollbar flex w-full flex-col overflow-x-hidden bg-white text-black max-md:h-dvh max-md:overflow-y-auto ${mobileContentBelowNavClass} md:min-h-full md:flex-1 md:overflow-visible md:pb-0 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden ${styles.page}`}
    >
      <div
        className={`${gridShellClass} in-flow-page-content flex flex-1 flex-col md:max-w-none ${styles.content}`}
      >
        <div className={styles.grid}>
          <aside className={styles.labelCol}>
            <h1 className={styles.title}>{copy.title}</h1>
            <p className={styles.updated}>{copy.updated}</p>
          </aside>

          <div className={styles.langCol}>
            <LegalLangToggle lang={lang} onChange={setLang} />
          </div>

          <div className={styles.contentCol}>
            <section id="privacy" className={styles.section}>
              <h2 className={styles.sectionTitle}>{copy.privacyTitle}</h2>
              <div className={styles.sectionBody}>
                {copy.privacy.map((block) => (
                  <p key={block.body}>{block.body}</p>
                ))}
              </div>
            </section>

            <section id="cookies" className={styles.section}>
              <h2 className={styles.sectionTitle}>{copy.cookiesTitle}</h2>
              <div className={styles.sectionBody}>
                <p>{copy.cookiesIntro}</p>
              </div>
            </section>
          </div>

          <div className={styles.released}>
            <p className={styles.releasedLabel}>RELEASED</p>
            <p className={styles.releasedDate}>July 10, 2026</p>
          </div>
        </div>
      </div>
    </section>
  );
}
