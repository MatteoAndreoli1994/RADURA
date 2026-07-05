"use client";

import { type FormEvent, useId, useState } from "react";
import { ExternalLinkIcon } from "@/components/ArrowIcon";
import { inter } from "@/lib/fonts";

const NAVBAR_FIELD_HEIGHT = "h-[30px]";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim());
}

type NewsletterFooterFieldProps = {
  tone?: "light" | "dark";
  variant?: "default" | "navbar";
};

export function NewsletterFooterField({
  tone = "dark",
  variant = "default",
}: NewsletterFooterFieldProps) {
  const feedbackId = useId();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const trimmed = email.trim();
  const showValidationError = submitted && !isValidEmail(trimmed);

  const fieldClass =
    tone === "light"
      ? "border-white/25 text-white/60 placeholder:text-white/30 focus:border-white/45"
      : "border-black/20 text-black/50 placeholder:text-black/25 focus:border-black/35";

  const iconClass =
    tone === "light"
      ? "opacity-50 invert transition-opacity duration-200 hover:opacity-80"
      : "opacity-40 transition-opacity duration-200 hover:opacity-70";

  const feedbackClass =
    tone === "light" ? "text-white/55" : "text-black/40";

  const feedbackMessage = showValidationError
    ? "Invalid email"
    : status === "success"
      ? "Thank you!"
      : status === "error"
        ? "Try again later"
        : "";

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

  const isNavbar = variant === "navbar";

  return (
    <div
      className={`relative hidden min-w-0 md:block ${isNavbar ? `${NAVBAR_FIELD_HEIGHT} flex items-center` : ""}`}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`flex items-center ${isNavbar ? `${NAVBAR_FIELD_HEIGHT} gap-3` : "gap-2"}`}
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
          placeholder="EMAIL ADDRESS"
          aria-invalid={showValidationError}
          aria-describedby={feedbackMessage ? feedbackId : undefined}
          className={`shrink-0 border bg-transparent uppercase focus:outline-none ${fieldClass} ${
            isNavbar
              ? `${inter.className} box-border ${NAVBAR_FIELD_HEIGHT} w-[13.75rem] px-3.5 py-0 text-[18px] leading-[22px] tracking-[-0.01em] placeholder:text-[18px] placeholder:leading-[22px] placeholder:tracking-[-0.01em]`
              : "font-inconsolata w-[min(15rem,18vw)] min-w-[9.5rem] px-2.5 py-1.5 text-[10px] leading-none tracking-[0.14em]"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="Subscribe to newsletter"
          className={`group flex shrink-0 cursor-pointer items-center border-0 bg-transparent p-0 leading-none disabled:cursor-default disabled:opacity-40 ${iconClass}`}
        >
          {status === "loading" ? (
            <span
              className={`leading-[22px] ${isNavbar ? `${inter.className} text-[18px]` : "font-inconsolata text-[10px] leading-none"}`}
            >
              ...
            </span>
          ) : (
            <ExternalLinkIcon
              size={isNavbar ? 24 : 14}
              className="transition-transform duration-200 ease-out group-hover:translate-x-px group-hover:-translate-y-px"
            />
          )}
        </button>
      </form>

      <p
        id={feedbackId}
        className={`font-inconsolata pointer-events-none absolute top-full left-0 mt-1 text-left text-[9px] leading-none tracking-[0.08em] uppercase ${feedbackClass}`}
        aria-live="polite"
      >
        {feedbackMessage || "\u00A0"}
      </p>
    </div>
  );
}
