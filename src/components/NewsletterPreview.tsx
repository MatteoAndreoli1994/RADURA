"use client";

import Link from "next/link";
import { type FormEvent, useLayoutEffect, useRef, useState } from "react";
import { SiteFooterBar } from "@/components/SiteFooterBar";
import { ebGaramond, inter } from "@/lib/fonts";
import { LEGAL_CONSENT_LABEL } from "@/lib/legal-copy";

const NEWSLETTER_BG_IMAGE = "/images/fotoRadura/new1.jpg";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim());
}

export function NewsletterPreview() {
  const bgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const trimmed = email.trim();
  const showValidationError = submitted && !isValidEmail(trimmed);

  useLayoutEffect(() => {
    const img = bgRef.current;
    if (img?.complete) setReady(true);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValidEmail(email)) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!res.ok) throw new Error("submit failed");
      setStatus("success");
      setEmail("");
      setSubmitted(false);
    } catch {
      setStatus("error");
    }
  }

  const feedbackMessage = showValidationError
    ? "Please enter a valid email address"
    : status === "success"
      ? "Thank you!"
      : status === "error"
        ? "Something went wrong. Please try again later."
        : "";

  return (
    <div
      className={`newsletter-page fixed inset-0 z-0 overflow-hidden transition-opacity duration-150 ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <img
        ref={bgRef}
        src={NEWSLETTER_BG_IMAGE}
        alt=""
        aria-hidden
        fetchPriority="high"
        loading="eager"
        decoding="sync"
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
        className="absolute inset-0 h-full w-full object-cover object-[40%_87%] md:object-[50%_87%]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-black/30"
        aria-hidden
      />

      <div className="relative z-10 flex h-full items-center justify-center px-5 sm:px-8">
        <div className="relative flex translate-y-[2vh] flex-col items-center sm:translate-y-[1vh]">
          <h1
            className={`${ebGaramond.className} newsletter-radura-logo absolute bottom-full left-1/2 mb-8 -translate-x-1/2 text-white sm:mb-7`}
          >
            RADURA
          </h1>

          <div className={`${inter.className} flex w-full flex-col items-center`}>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex w-[min(76vw,278px)] flex-col gap-2 sm:w-[min(82vw,310px)]"
            >
              <input
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@example.com"
                aria-invalid={showValidationError}
                className={`${inter.className} w-full min-w-0 rounded-lg border border-black/15 bg-white px-3 py-2.5 text-[13px] leading-none font-normal text-black placeholder:font-normal placeholder:text-black/40 focus:border-black/25 focus:outline-none sm:px-3.5 sm:py-3 sm:text-[14px]`}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full shrink-0 cursor-pointer rounded-lg border-0 bg-[#2f2f2f] px-4 py-2.5 text-[13px] leading-none font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:cursor-default disabled:opacity-60 sm:px-4 sm:py-3 sm:text-[14px]"
              >
                Subscribe
              </button>
            </form>

            <p
              className={`${inter.className} mt-2 w-[min(76vw,278px)] text-center text-[11px] leading-snug font-medium text-white/90 sm:w-[min(82vw,310px)]`}
            >
              By subscribing, you agree to the{" "}
              <Link
                href="/legal#privacy"
                className="underline underline-offset-2 transition-colors hover:text-white"
              >
                {LEGAL_CONSENT_LABEL.en}
              </Link>
              .
            </p>

            <p
              className={`${inter.className} mt-1 h-4 w-[min(76vw,278px)] text-center text-[12px] leading-4 font-normal text-white/85 sm:w-[min(82vw,310px)]`}
              aria-live="polite"
            >
              {feedbackMessage || "\u00A0"}
            </p>
          </div>
        </div>
      </div>

      <SiteFooterBar
        tone="light"
        className="pointer-events-auto fixed inset-x-0 bottom-0 z-20 px-3 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] sm:px-8"
      />
    </div>
  );
}
