"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AboutNewsletterField } from "@/components/AboutNewsletterField";
import { gridShellClass, mobileContentBelowNavClass } from "@/lib/grid";
import { ABOUT_COPY, type AboutLang } from "@/lib/about-copy";
import styles from "@/components/sections/Biography.module.css";

const ABOUT_IMAGE_SRC = "/images/live4.jpg";

function preloadAboutImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = document.createElement("img");
    image.decoding = "async";
    const done = () => resolve();
    image.addEventListener("load", done, { once: true });
    image.addEventListener("error", done, { once: true });
    image.src = src;
    if (image.complete) done();
  });
}

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/raduramusic?igsh=d3F6bmh1ZGcwZGZz" },
  { label: "Youtube", href: "https://www.youtube.com/@Radura" },
  { label: "Bandcamp", href: "https://radura.bandcamp.com" },
] as const;

const CONTACT_EMAIL = "info@raduraband.com";

function AboutLangToggle({
  lang,
  onChange,
}: {
  lang: AboutLang;
  onChange: (lang: AboutLang) => void;
}) {
  return (
    <div className={styles.langToggle} role="group" aria-label="Lingua biografia">
      {(["it", "en"] as const).map((value) => (
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

function AboutSidebar() {
  const sidebarCopy = ABOUT_COPY.en;

  return (
    <div className={styles.sidebar}>
      <section className={styles.infoBlock}>
        <h2 className={styles.infoLabel}>{sidebarCopy.contactLabel}</h2>
        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.infoText}>
          {CONTACT_EMAIL}
        </a>
      </section>

      <section className={styles.infoBlock}>
        <h2 className={styles.infoLabel}>{sidebarCopy.socialLabel}</h2>
        <ul className={styles.socialList}>
          {SOCIAL_LINKS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.infoText}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.infoBlock} ${styles.infoBlockNewsletter}`}>
        <h2 className={styles.infoLabel}>{sidebarCopy.newsletterLabel}</h2>
        <p className={styles.newsletterCopy}>{sidebarCopy.newsletterCopy}</p>
        <AboutNewsletterField />
      </section>
    </div>
  );
}

export function Biography() {
  const [lang, setLang] = useState<AboutLang>("it");
  const [imageReady, setImageReady] = useState(false);
  const copy = ABOUT_COPY[lang];

  useEffect(() => {
    let cancelled = false;

    void preloadAboutImage(ABOUT_IMAGE_SRC).then(() => {
      if (!cancelled) setImageReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="biography"
      aria-busy={!imageReady}
      className={`no-scrollbar flex w-full flex-col overflow-x-hidden bg-white text-black max-md:h-dvh max-md:overflow-y-auto ${mobileContentBelowNavClass} md:min-h-full md:flex-1 md:overflow-visible md:pb-0 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden ${styles.section}`}
    >
      <div className={`${gridShellClass} in-flow-page-content flex flex-1 flex-col md:max-w-none ${styles.content}`}>
        {imageReady ? (
          <>
        <div className={`flex flex-1 flex-col md:hidden ${styles.mobileLayout}`}>
          <div className={styles.mobileImageFrame}>
            <Image
              src={ABOUT_IMAGE_SRC}
              alt="Radura"
              width={960}
              height={1280}
              className={styles.mobileImage}
              sizes="(max-width: 767px) 100vw, 180px"
              priority
            />
          </div>

          <div className={styles.mobileParagraphs}>
            <AboutLangToggle lang={lang} onChange={setLang} />
            <div className={styles.bioParagraphs}>
              {copy.paragraphs.map((paragraph, i) => (
                <p key={`${lang}-${i}`}>{paragraph}</p>
              ))}
            </div>
          </div>

          <AboutSidebar />
        </div>

        <div className={`${styles.desktopLayout} hidden md:grid`}>
          <div className={styles.desktopLeftCol}>
            <div className={styles.desktopImageFrame}>
              <Image
                src={ABOUT_IMAGE_SRC}
                alt="Radura"
                width={960}
                height={1280}
                className={styles.desktopImage}
                sizes="(min-width: 768px) 16vw, 100vw"
                priority
              />
            </div>

            <AboutSidebar />
          </div>

          <div className={styles.desktopRightCol}>
            <div className={styles.desktopParagraphs}>
              <AboutLangToggle lang={lang} onChange={setLang} />
              <div className={styles.bioParagraphs}>
                {copy.paragraphs.map((paragraph, i) => (
                  <p key={`${lang}-${i}`}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
