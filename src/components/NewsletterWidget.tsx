"use client";

import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { useView } from "@/components/ViewProvider";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROW_HEIGHT = 33;

function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim());
}

export function NewsletterWidget() {
  const { view } = useView();
  const { nowPlaying, playbackEngaged } = useBandcampSession();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const trimmed = email.trim();
  const showValidationError = submitted && expanded && !isValidEmail(trimmed);

  useEffect(() => {
    if (view === "home") {
      setExpanded(false);
      setSubmitted(false);
      setStatus("idle");
    }
  }, [view]);

  useEffect(() => {
    if (!expanded) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [expanded]);

  useEffect(() => {
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
  }, [expanded]);

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

  if (view === "home") return null;

  return (
    <div
      ref={rootRef}
      className={`pointer-events-auto fixed left-[50px] z-40 max-[767px]:left-3 md:hidden ${
        playbackEngaged && nowPlaying
          ? "bottom-[calc(50px+2.75rem+env(safe-area-inset-bottom,0px))] max-[767px]:bottom-[calc(1rem+2.75rem+env(safe-area-inset-bottom,0px))]"
          : "bottom-[50px] max-[767px]:bottom-4"
      }`}
    >
      <div
        className="font-inconsolata w-max overflow-hidden rounded-[8px] bg-[#ededed] transition-[height] duration-300 ease-out"
        style={{
          height: expanded ? ROW_HEIGHT * 2 : ROW_HEIGHT,
        }}
      >
        {expanded ? (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex h-[33px] items-center justify-center gap-3 px-8"
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
              aria-describedby={showValidationError ? errorId : undefined}
              className="w-[148px] border-0 bg-transparent p-0 text-center text-[11px] leading-none tracking-normal text-[#757575] caret-[#757575] placeholder:text-[#757575] focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              aria-label="Iscriviti alla newsletter"
              className="group flex shrink-0 cursor-pointer items-center border-0 bg-transparent p-0 text-[#757575] disabled:cursor-default disabled:opacity-40"
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
          onClick={() => setExpanded(true)}
          className="flex h-[33px] w-full items-center justify-center border-0 bg-transparent px-8 text-center text-[11px] leading-none tracking-normal text-[#757575] whitespace-nowrap"
        >
          Sign up to the Newsletter
        </button>
      </div>

      {expanded && (showValidationError || status === "success" || status === "error") ? (
        <p
          id={showValidationError ? errorId : undefined}
          className="font-inconsolata mt-0.5 px-8 text-center text-[11px] leading-none tracking-normal text-[#757575]"
        >
          {showValidationError
            ? "Inserisci un indirizzo email valido"
            : status === "success"
              ? "Grazie!"
              : "Errore, riprova più tardi."}
        </p>
      ) : null}
    </div>
  );
}
