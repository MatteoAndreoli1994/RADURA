import { pathFromMusic } from "@/lib/view-routes";
import type { Release } from "@/lib/releases";

type ShareReleaseOptions = {
  release: Release;
  trackTitle?: string | null;
};

export function getReleaseShareUrl(releaseId: string): string {
  const path = pathFromMusic(releaseId);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function getReleaseShareTitle(
  release: Release,
  trackTitle?: string | null,
): string {
  if (trackTitle) {
    return `${trackTitle} — ${release.title} · Radura`;
  }
  return `${release.title} — Radura`;
}

export function getReleaseShareText(
  release: Release,
  trackTitle?: string | null,
): string {
  if (trackTitle) {
    return `Listen to "${trackTitle}" from ${release.title} by Radura.`;
  }
  return `Listen to ${release.title} by Radura.`;
}

export function getReleaseShareClipboardText(
  release: Release,
  trackTitle?: string | null,
): string {
  return `${getReleaseShareText(release, trackTitle)}\n${getReleaseShareUrl(release.id)}`;
}

async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy copy
    }
  }

  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export async function shareRelease({
  release,
  trackTitle,
}: ShareReleaseOptions): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  const clipboardText = getReleaseShareClipboardText(release, trackTitle);

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      // Telegram and others often drop `text` when `url` is passed separately.
      // Share message + link together in `text`, like Wordle does.
      await navigator.share({ text: clipboardText });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  const copied = await copyText(clipboardText);
  return copied ? "copied" : "failed";
}
