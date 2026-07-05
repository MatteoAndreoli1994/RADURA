"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";
import { LEGAL_CONSENT_LABEL } from "@/lib/legal-copy";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim());
}

type NewsletterFormProps = {
  variant?: "hero" | "footer" | "popup";
  hideLabel?: boolean;
  centered?: boolean;
  lightTheme?: boolean;
};

export function NewsletterForm({
  variant = "hero",
  hideLabel = false,
  centered = false,
  lightTheme = false,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const trimmed = email.trim();
  const showValidationError = submitted && !isValidEmail(trimmed);
  const isFooter = variant === "footer";
  const isPopup = variant === "popup";
  const isCenteredFooter = isFooter && centered;
  const isCompactLight = isFooter || isPopup;

  const footerMicroText =
    "text-[11px] leading-[13px] tracking-[0.06em] md:text-site md:leading-site md:tracking-[0.08em]";

  const footerInputText =
    "max-md:!text-[11px] max-md:!leading-[13px] max-md:tracking-[0.06em] md:text-site md:leading-site md:tracking-[0.08em]";

  const labelClass = isCompactLight
    ? `${footerMicroText} text-black/80`
    : `text-site tracking-[0.06em] ${lightTheme ? "text-black/80" : "text-white"}`;

  const inputSizeClass = isCompactLight
    ? footerInputText
    : "text-[16px] leading-[17px] sm:text-site sm:leading-site";

  const footerPlaceholderClass =
    "placeholder:text-[11px] placeholder:leading-[13px] placeholder:tracking-[0.06em] md:placeholder:text-site md:placeholder:leading-site";

  const inputClass = isFooter
    ? `min-w-0 flex-1 bg-transparent py-0 [text-size-adjust:100%] ${inputSizeClass} text-black/90 caret-black focus:outline-none ${footerPlaceholderClass} ${
        isCenteredFooter
          ? "pl-5 text-center placeholder:text-center placeholder:text-black/45"
          : "pl-0 text-left placeholder:text-left placeholder:text-black/45"
      }`
    : isPopup
      ? `min-w-0 flex-1 bg-transparent py-0 [text-size-adjust:100%] ${inputSizeClass} text-black/90 caret-black focus:outline-none ${footerPlaceholderClass} pl-5 text-center placeholder:text-center placeholder:text-black/45`
    : `w-full bg-transparent px-7 py-1 text-center ${inputSizeClass} ${
        lightTheme
          ? "text-black/90 caret-black placeholder:text-black/45"
          : "text-white/95 caret-white placeholder:text-white/70"
      } placeholder:text-center focus:outline-none`;

  const borderClass = isCompactLight || lightTheme
    ? "border-black/40 focus-within:border-black/70"
    : "border-white/85 focus-within:border-white";

  const arrowClass = isCompactLight || lightTheme
    ? "text-black/80 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
    : "text-white transition-transform duration-200 ease-out group-hover:translate-x-0.5";

  const messageClass = isCompactLight
    ? `${footerMicroText} text-black/55`
    : `text-site ${lightTheme ? "text-black/55" : "text-white/80"}`;

  const successClass = isCompactLight
    ? `${footerMicroText} text-black/65`
    : `text-site ${lightTheme ? "text-black/70" : "text-white/90"}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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

  return (
    <div
      className={`relative w-full ${
        isFooter
          ? isCenteredFooter
            ? "max-w-[220px]"
            : "max-w-[132px] md:max-w-[168px]"
          : isPopup
            ? "max-w-[220px]"
          : "max-w-xs sm:max-w-sm"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`flex w-full flex-col gap-0.5 ${
          isFooter
            ? isCenteredFooter
              ? "items-center text-center"
              : "items-start text-left"
            : isPopup
              ? "items-center text-center"
            : "items-center gap-1 text-center"
        }`}
      >
        {!hideLabel && (
          <p
            className={`w-full ${
              (isFooter && !isCenteredFooter) ? "text-left" : "text-center"
            } ${labelClass}`}
          >
            Newsletter
          </p>
        )}

        <div
          className={`relative w-full overflow-visible border-b pb-0.5 ${borderClass}`}
        >
          <div
            className={
              isCompactLight ? "flex items-center gap-1 md:gap-1.5" : "relative"
            }
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused ? "" : "your@email.com"}
              aria-invalid={showValidationError}
              aria-describedby={
                showValidationError ? "email-error" : undefined
              }
              className={inputClass}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              aria-label="Iscriviti alla newsletter"
              className={`group flex shrink-0 items-center justify-center leading-none cursor-pointer disabled:cursor-default disabled:opacity-40 ${
                isCompactLight
                  ? arrowClass
                  : `absolute top-1/2 right-0 -translate-y-1/2 ${arrowClass}`
              }`}
            >
              {status === "loading" ? (
                <span className={isCompactLight ? footerMicroText : "text-site"}>
                  ...
                </span>
              ) : isCompactLight ? (
                <>
                  <ArrowIcon
                    className={`block ${arrowClass} md:hidden`}
                    size={12}
                  />
                  <ArrowIcon
                    className={`hidden md:block ${arrowClass}`}
                    size={16}
                  />
                </>
              ) : (
                <ArrowIcon className={arrowClass} size={18} />
              )}
            </button>
          </div>
        </div>
      </form>

      {isCompactLight ? (
        <p className={`${footerMicroText} pointer-events-auto mt-1 font-medium text-black/65`}>
          By subscribing, you agree to the{" "}
          <Link href="/legal#privacy" className="underline underline-offset-2">
            {LEGAL_CONSENT_LABEL.en}
          </Link>
          .
        </p>
      ) : null}

      <div
        className={`pointer-events-none absolute top-full left-0 w-full ${
          isCompactLight ? "pt-1.5" : "pt-3"
        } ${isCenteredFooter || isPopup || !isCompactLight ? "text-center" : "text-left"}`}
      >
        {showValidationError && (
          <p id="email-error" className={messageClass}>
            Inserisci un indirizzo email valido
          </p>
        )}

        {status === "success" && (
          <p className={successClass}>Grazie!</p>
        )}

        {status === "error" && (
          <p className={successClass}>Errore, riprova più tardi.</p>
        )}
      </div>
    </div>
  );
}
