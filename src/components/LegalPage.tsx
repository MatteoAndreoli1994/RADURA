"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LEGAL_COPY, type LegalLang } from "@/lib/legal-copy";

const COOKIEBOT_ID = process.env.NEXT_PUBLIC_COOKIEBOT_ID;

type LegalPageProps = {
  section?: "privacy" | "cookies";
};

export function LegalPage({ section }: LegalPageProps) {
  const [lang, setLang] = useState<LegalLang>("en");
  const copy = LEGAL_COPY[lang];

  useEffect(() => {
    if (!section) return;
    const target = document.getElementById(section);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [section]);

  return (
    <main className="h-dvh overflow-y-auto overscroll-contain bg-white px-5 py-10 text-black sm:px-8 md:px-14">
      {COOKIEBOT_ID ? (
        <Script
          id="CookieDeclaration"
          src={`https://consent.cookiebot.com/${COOKIEBOT_ID}/cd.js`}
          strategy="afterInteractive"
        />
      ) : null}

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-10">
        <header className="border-b border-black/10 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-discography m-0 text-black">{copy.title}</h1>
            <div className="inline-flex items-center rounded-md border border-black/20 p-0.5">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`h-7 px-3 text-[11px] leading-none ${
                  lang === "en" ? "bg-black text-white" : "text-black/70"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("it")}
                className={`h-7 px-3 text-[11px] leading-none ${
                  lang === "it" ? "bg-black text-white" : "text-black/70"
                }`}
              >
                IT
              </button>
            </div>
          </div>
          <p className="m-0 mt-2 text-site text-black/70">{copy.updated}</p>
        </header>

        <section id="privacy" className="scroll-mt-6 text-site leading-[1.5] text-black/85">
          <h2 className="text-nav m-0 text-black">{copy.privacyTitle}</h2>
          <div className="mt-3 flex flex-col gap-3">
            {copy.privacy.map((block) => (
              <p key={block.body} className="m-0">
                {block.body}
              </p>
            ))}
          </div>
        </section>

        <section id="cookies" className="scroll-mt-6 text-site leading-[1.5] text-black/85">
          <h2 className="text-nav m-0 text-black">{copy.cookiesTitle}</h2>
          <p className="m-0 mt-3">{copy.cookiesIntro}</p>
          {COOKIEBOT_ID ? (
            <div id="CookieDeclaration" className="mt-4" />
          ) : (
            <p className="m-0 mt-3 text-black/60">
              Cookie declaration is not configured yet.
            </p>
          )}
        </section>

        <p className="text-site">
          <Link href="/" className="underline underline-offset-2">
            {copy.back}
          </Link>
        </p>
      </div>
    </main>
  );
}
