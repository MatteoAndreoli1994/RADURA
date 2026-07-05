"use client";

import { type FormEvent, useId, useState } from "react";
import styles from "@/components/AboutNewsletterField.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim());
}

export function AboutNewsletterField() {
  const feedbackId = useId();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const trimmed = email.trim();
  const showValidationError = submitted && !isValidEmail(trimmed);

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

  return (
    <div className={styles.root}>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
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
          placeholder="Enter Email"
          aria-invalid={showValidationError}
          aria-describedby={feedbackMessage ? feedbackId : undefined}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={styles.button}
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>

      <p
        id={feedbackId}
        className={styles.feedback}
        aria-live="polite"
      >
        {feedbackMessage || "\u00A0"}
      </p>
    </div>
  );
}
