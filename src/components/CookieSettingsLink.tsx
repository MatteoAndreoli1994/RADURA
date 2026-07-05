"use client";

import { COOKIE_SETTINGS_LABEL, type LegalLang } from "@/lib/legal-copy";

type CookieSettingsLinkProps = {
  lang?: LegalLang;
  className?: string;
};

function isDialogVisible() {
  const dialog = document.getElementById("CybotCookiebotDialog");
  if (!(dialog instanceof HTMLElement)) return false;

  const style = getComputedStyle(dialog);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    dialog.getAttribute("aria-hidden") !== "true"
  );
}

function openCookiebotDialog() {
  const cookiebot = window.Cookiebot;
  if (!cookiebot) return false;

  cookiebot.renew?.();
  cookiebot.show?.();

  return isDialogVisible();
}

export function CookieSettingsLink({
  lang = "en",
  className = "",
}: CookieSettingsLinkProps) {
  function openCookieSettings() {
    if (openCookiebotDialog()) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (openCookiebotDialog() || attempts >= 30) {
        window.clearInterval(timer);
      }
    }, 100);
  }

  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={`cursor-pointer border-0 bg-transparent p-0 transition-colors hover:opacity-70 ${className}`}
    >
      {COOKIE_SETTINGS_LABEL[lang]}
    </button>
  );
}
