import { pathFromMusic } from "@/lib/view-routes";
import { getReleaseCoverSrc } from "@/lib/preload-release-cover";
import type { Release } from "@/lib/releases";

const SHARE_ARTIST = "Radura";

type ShareReleaseOptions = {
  release: Release;
};

export function getReleaseShareUrl(releaseId: string): string {
  const path = pathFromMusic(releaseId);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function getReleaseShareTitle(release: Release): string {
  return `${release.title} — ${SHARE_ARTIST}`;
}

export function getReleaseShareText(release: Release): string {
  return `Listen to ${release.title} by ${SHARE_ARTIST}.`;
}

export function getReleaseShareClipboardText(release: Release): string {
  return `${getReleaseShareText(release)}\n${getReleaseShareUrl(release.id)}`;
}

function resolveReleaseCoverUrl(release: Release): string {
  const coverSrc = getReleaseCoverSrc(release);
  if (coverSrc.startsWith("http")) return coverSrc;
  if (typeof window === "undefined") return coverSrc;
  return `${window.location.origin}${coverSrc}`;
}

async function getReleaseCoverFile(release: Release): Promise<File | null> {
  if (typeof window === "undefined") return null;

  try {
    const response = await fetch(resolveReleaseCoverUrl(release));
    if (!response.ok) return null;

    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;

    const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const safeSlug = release.slug.replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "");
    return new File([blob], `${safeSlug || "release"}-cover.${extension}`, {
      type: blob.type,
    });
  } catch {
    return null;
  }
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
}: ShareReleaseOptions): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  const clipboardText = getReleaseShareClipboardText(release);
  const title = getReleaseShareTitle(release);
  const text = getReleaseShareText(release);
  const url = getReleaseShareUrl(release.id);

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      const coverFile = await getReleaseCoverFile(release);
      const shareData: ShareData = {
        title,
        text: `${text}\n${url}`,
      };

      if (
        coverFile &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [coverFile] })
      ) {
        await navigator.share({ ...shareData, files: [coverFile] });
        return "shared";
      }

      // Telegram and others often drop `text` when `url` is passed separately.
      await navigator.share(shareData);
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
