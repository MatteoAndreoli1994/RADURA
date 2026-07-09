"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROW_HEIGHT = 33;

function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim());
}

type NewsletterSignupChipProps = {
  initialExpanded?: boolean;
  privacyPolicyHref?: string;
  textTone?: "black" | "gray";
  persistentExpanded?: boolean;
};

export function NewsletterSignupChip({
  initialExpanded = false,
  privacyPolicyHref = "/legal#privacy",
  textTone = "black",
  persistentExpanded = false,
}: NewsletterSignupChipProps = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackId = useId();
  const [expanded, setExpanded] = useState(initialExpanded || persistentExpanded);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const trimmed = email.trim();
  const showValidationError = submitted && expanded && !isValidEmail(trimmed);
  const toneTextClass = textTone === "gray" ? "text-[#696969]" : "text-black";
  const tonePlaceholderClass =
    textTone === "gray" ? "placeholder:text-[#7e7e7e]" : "placeholder:text-black";

  useEffect(() => {
    if (persistentExpanded) return;
    if (!expanded) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [expanded, persistentExpanded]);

  useEffect(() => {
    if (persistentExpanded) {
      setExpanded(true);
      return;
    }
  }, [persistentExpanded]);

  useEffect(() => {
    if (persistentExpanded) return;
    if (!expanded) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setExpanded(false);
        setSubmitted(false);
        setStatus("idle");
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [expanded, persistentExpanded]);

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

  const feedbackClass = showValidationError
    ? "text-[#b42318]"
    : status === "error"
      ? "text-[#b42318]"
      : toneTextClass;

  return (
    <div ref={rootRef} className="flex w-full min-w-0 flex-col justify-end">
      <div
        className="font-inconsolata flex w-full min-w-0 flex-col justify-end overflow-hidden rounded-[8px] bg-[#ededed] transition-[height] duration-300 ease-out"
        style={{
          height: expanded ? ROW_HEIGHT * 2 : ROW_HEIGHT,
        }}
      >
        {expanded ? (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex h-[33px] shrink-0 items-center justify-center gap-2 border-b border-black/5 px-3"
          >
            <input
              ref={inputRef}
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
              placeholder="Email"
              aria-invalid={showValidationError}
              aria-describedby={expanded ? feedbackId : undefined}
              className={`min-w-0 flex-1 border-0 bg-transparent p-0 text-center text-[11px] leading-none tracking-normal caret-current focus:outline-none ${toneTextClass} ${tonePlaceholderClass}`}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              aria-label="Subscribe to newsletter"
              className={`group flex shrink-0 cursor-pointer items-center border-0 bg-transparent p-0 disabled:cursor-default disabled:opacity-40 ${toneTextClass}`}
            >
              <ArrowIcon
                size={12}
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              />
            </button>
          </form>
        ) : null}

        <button
          type="button"
          onClick={() => {
            if (!persistentExpanded) setExpanded(true);
          }}
          className={`flex h-[33px] w-full shrink-0 items-center justify-center border-0 bg-transparent px-3 text-center text-[11px] leading-none tracking-normal whitespace-nowrap ${
            persistentExpanded ? "cursor-default" : "cursor-pointer"
          } ${toneTextClass}`}
        >
          Sign up to the Newsletter
        </button>
      </div>

      {expanded ? (
        <>
          <p
            id={feedbackId}
            className={`font-inconsolata mt-0.5 h-[12px] text-center text-[11px] leading-[12px] tracking-normal ${feedbackClass}`}
            aria-live="polite"
          >
            {feedbackMessage || "\u00A0"}
          </p>
          <p className={`font-inconsolata mt-1 text-center text-[12px] leading-[14px] font-medium ${toneTextClass}`}>
            By subscribing, you agree to the{" "}
            <Link href={privacyPolicyHref} className={`underline underline-offset-2 ${toneTextClass}`}>
              legal notice
            </Link>
            .
          </p>
        </>
      ) : null}
    </div>
  );
}
