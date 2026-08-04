"use client";

import { useEffect } from "react";

const HIDDEN_BANNER_IDS = [
  "CybotCookiebotDialogBodyButtonDecline",
  "CybotCookiebotDialogGpcIcon",
  "CybotCookiebotDialogBodyContentCheckboxPersonalInformation",
];

const CUSTOMIZE_LABEL = "Cookie settings";
const SAVE_LABEL = "Save preferences";
const BANNER_TEXT =
  "We use essential cookies to run this website and remember your cookie choices. If you play music, embedded Bandcamp players may set their own cookies. We do not use advertising or social media tracking on this site.";
const BACK_BTN_CLASS = "radura-cookie-back-btn";
const SETTINGS_VIEW_CLASS = "radura-cookie-settings-view";
const BANNER_OPEN_CLASS = "radura-cookie-banner-open";
const BANNER_HEIGHT_VAR = "--radura-cookie-banner-height";

function hideElement(el: HTMLElement) {
  el.style.setProperty("display", "none", "important");
  el.style.setProperty("visibility", "hidden", "important");
  el.style.setProperty("pointer-events", "none", "important");
}

function showFlexButton(el: HTMLElement) {
  el.classList.remove("CybotCookiebotDialogHide");
  el.style.removeProperty("visibility");
  el.style.removeProperty("pointer-events");
  el.style.removeProperty("height");
  el.style.removeProperty("overflow");
  el.style.setProperty("display", "flex", "important");
}

function isSettingsView() {
  const details = document.getElementById("CybotCookiebotDialogNavDetails");
  const about = document.getElementById("CybotCookiebotDialogNavAbout");
  if (details?.getAttribute("aria-selected") === "true") return true;
  if (about?.getAttribute("aria-selected") === "true") return true;

  const tabDetails = document.getElementById("CybotCookiebotDialogTabContentDetails");
  if (tabDetails instanceof HTMLElement) {
    const style = window.getComputedStyle(tabDetails);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  return false;
}

function ensureBackButton(dialog: HTMLElement) {
  const host =
    dialog.querySelector("#CybotCookiebotDialogBodyButtonsWrapper") ??
    dialog.querySelector("#CybotCookiebotDialogFooter");
  if (!(host instanceof HTMLElement)) return null;

  let back = host.querySelector(`.${BACK_BTN_CLASS}`);
  if (!(back instanceof HTMLButtonElement)) {
    const newBack = document.createElement("button");
    newBack.type = "button";
    newBack.className = `${BACK_BTN_CLASS} CybotCookiebotDialogBodyButton`;
    newBack.textContent = "Back";
    newBack.addEventListener("click", () => {
      document.getElementById("CybotCookiebotDialogNavDeclaration")?.click();
    });
    host.appendChild(newBack);
    back = newBack;
  }

  return back instanceof HTMLButtonElement ? back : null;
}

function hideDoNotSellElements(dialog: HTMLElement) {
  for (const id of HIDDEN_BANNER_IDS) {
    const el = document.getElementById(id);
    if (el instanceof HTMLElement) hideElement(el);
  }

  dialog
    .querySelectorAll('[id*="Decline"], [id*="DoNotSell"], [id*="PersonalInformation"]')
    .forEach((node) => {
      if (node instanceof HTMLElement) hideElement(node);
    });

  dialog.querySelectorAll("button, a.CybotCookiebotDialogBodyButton").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.id === "CybotCookiebotDialogBodyButtonAccept") return;
    if (node.id === "CybotCookiebotDialogBodyLevelButtonCustomize") return;
    if (node.id === "CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection") return;
    if (node.classList.contains(BACK_BTN_CLASS)) return;

    const label = node.textContent?.trim().toLowerCase() ?? "";
    if (label.includes("do not sell") || label.includes("personal information")) {
      hideElement(node);
    }
  });
}

function applyViewState(dialog: HTMLElement) {
  const settings = isSettingsView();
  dialog.classList.toggle(SETTINGS_VIEW_CLASS, settings);

  const contentWrapper = dialog.querySelector(".CybotCookiebotDialogContentWrapper");
  if (contentWrapper instanceof HTMLElement) {
    if (settings) {
      contentWrapper.style.setProperty("overflow-y", "auto", "important");
      contentWrapper.style.setProperty("overflow-x", "hidden", "important");
      contentWrapper.style.setProperty("-webkit-overflow-scrolling", "touch");
      contentWrapper.style.setProperty("overscroll-behavior", "contain");
      contentWrapper.style.setProperty("touch-action", "pan-y");
      contentWrapper.style.setProperty(
        "max-height",
        "min(70dvh, calc(100dvh - env(safe-area-inset-top, 0px)))",
        "important",
      );
    } else {
      contentWrapper.style.removeProperty("overflow-y");
      contentWrapper.style.removeProperty("overflow-x");
      contentWrapper.style.removeProperty("-webkit-overflow-scrolling");
      contentWrapper.style.removeProperty("overscroll-behavior");
      contentWrapper.style.removeProperty("touch-action");
      contentWrapper.style.removeProperty("max-height");
    }
  }

  const save = document.getElementById("CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection");
  const accept = document.getElementById("CybotCookiebotDialogBodyButtonAccept");
  const customize = document.getElementById("CybotCookiebotDialogBodyLevelButtonCustomize");
  const back = ensureBackButton(dialog);

  if (settings) {
    if (save instanceof HTMLElement) {
      save.textContent = SAVE_LABEL;
      showFlexButton(save);
    }

    if (back instanceof HTMLElement) showFlexButton(back);
    if (accept instanceof HTMLElement) hideElement(accept);
    if (customize instanceof HTMLElement) hideElement(customize);
    return;
  }

  if (save instanceof HTMLElement) hideElement(save);
  if (back instanceof HTMLElement) hideElement(back);

  if (accept instanceof HTMLElement) showFlexButton(accept);
  if (customize instanceof HTMLElement) {
    customize.textContent = CUSTOMIZE_LABEL;
    showFlexButton(customize);
  }
}

function applyBannerCopy() {
  const text = document.getElementById("CybotCookiebotDialogBodyContentText");
  if (text instanceof HTMLElement) {
    text.textContent = BANNER_TEXT;
  }
}

function isDialogOpen(dialog: HTMLElement) {
  if (!dialog.classList.contains("CybotCookiebotDialogActive")) return false;
  if (dialog.getAttribute("aria-hidden") === "true") return false;

  const style = window.getComputedStyle(dialog);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (Number.parseFloat(style.opacity || "1") === 0) return false;

  const rect = dialog.getBoundingClientRect();
  return rect.height > 8 && rect.width > 8;
}

function syncBannerOpenState(dialog: HTMLElement | null) {
  const open = dialog instanceof HTMLElement ? isDialogOpen(dialog) : false;
  document.documentElement.classList.toggle(BANNER_OPEN_CLASS, open);

  if (!open || !(dialog instanceof HTMLElement)) {
    document.documentElement.style.removeProperty(BANNER_HEIGHT_VAR);
    return;
  }

  const height = Math.ceil(dialog.getBoundingClientRect().height);
  document.documentElement.style.setProperty(
    BANNER_HEIGHT_VAR,
    `${Math.max(height, 48)}px`,
  );
}

function enhanceCookieBanner() {
  const dialog = document.getElementById("CybotCookiebotDialog");
  if (!dialog) {
    syncBannerOpenState(null);
    return false;
  }

  applyBannerCopy();
  hideDoNotSellElements(dialog);
  applyViewState(dialog);
  syncBannerOpenState(dialog);
  return true;
}

function attachDialogObserver(scheduleEnhance: () => void) {
  const dialog = document.getElementById("CybotCookiebotDialog");
  if (!(dialog instanceof HTMLElement) || dialog.dataset.raduraObserved === "1") return;

  dialog.dataset.raduraObserved = "1";
  new MutationObserver(scheduleEnhance).observe(dialog, {
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-selected", "class", "style"],
  });
}

export function CookiebotBannerEnhancer() {
  useEffect(() => {
    let scheduled = false;
    let pollTimer: number | null = null;
    const delayedTimers = new Set<number>();

    const stopPolling = () => {
      if (pollTimer !== null) {
        window.clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const startPolling = () => {
      if (pollTimer !== null) return;
      pollTimer = window.setInterval(() => {
        const dialog = document.getElementById("CybotCookiebotDialog");
        if (!(dialog instanceof HTMLElement)) {
          syncBannerOpenState(null);
          stopPolling();
          return;
        }
        enhanceCookieBanner();
        if (!dialog.classList.contains("CybotCookiebotDialogActive")) {
          stopPolling();
        }
      }, 400);
    };

    const scheduleEnhance = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        if (enhanceCookieBanner()) {
          attachDialogObserver(scheduleEnhance);
          startPolling();
        }
      });
    };

    const scheduleEnhanceSoon = () => {
      scheduleEnhance();
      for (const delay of [50, 150, 350, 700]) {
        const timer = window.setTimeout(() => {
          delayedTimers.delete(timer);
          scheduleEnhance();
        }, delay);
        delayedTimers.add(timer);
      }
    };

    scheduleEnhanceSoon();

    const onCookiebotReady = () => scheduleEnhanceSoon();
    const onCookiebotHide = () => {
      syncBannerOpenState(document.getElementById("CybotCookiebotDialog"));
    };
    window.addEventListener("CookiebotOnLoad", onCookiebotReady);
    window.addEventListener("CookiebotOnDialogDisplay", onCookiebotReady);
    window.addEventListener("CookiebotOnAccept", onCookiebotHide);
    window.addEventListener("CookiebotOnDecline", onCookiebotHide);
    window.addEventListener("CookiebotOnDialogHidden", onCookiebotHide);

    const onDialogClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("#CybotCookiebotDialog")) return;

      if (
        target.closest("#CybotCookiebotDialogBodyLevelButtonCustomize") ||
        target.closest("#CybotCookiebotDialogNavDetails") ||
        target.closest("#CybotCookiebotDialogNavAbout") ||
        target.closest("#CybotCookiebotDialogNavDeclaration") ||
        target.closest(`.${BACK_BTN_CLASS}`)
      ) {
        scheduleEnhanceSoon();
      }
    };
    document.addEventListener("click", onDialogClick, true);

    const retryTimer = window.setInterval(() => {
      if (document.getElementById("CybotCookiebotDialog")) {
        scheduleEnhanceSoon();
        window.clearInterval(retryTimer);
      }
    }, 250);

    const stopRetry = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 10000);

    return () => {
      stopPolling();
      window.clearInterval(retryTimer);
      window.clearTimeout(stopRetry);
      for (const timer of delayedTimers) window.clearTimeout(timer);
      window.removeEventListener("CookiebotOnLoad", onCookiebotReady);
      window.removeEventListener("CookiebotOnDialogDisplay", onCookiebotReady);
      window.removeEventListener("CookiebotOnAccept", onCookiebotHide);
      window.removeEventListener("CookiebotOnDecline", onCookiebotHide);
      window.removeEventListener("CookiebotOnDialogHidden", onCookiebotHide);
      document.removeEventListener("click", onDialogClick, true);
      document.documentElement.classList.remove(BANNER_OPEN_CLASS);
      document.documentElement.style.removeProperty(BANNER_HEIGHT_VAR);
    };
  }, []);

  return null;
}
