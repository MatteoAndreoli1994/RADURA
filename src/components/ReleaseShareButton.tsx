"use client";

import { useState } from "react";
import { shareRelease } from "@/lib/share-release";
import type { Release } from "@/lib/releases";

type ReleaseShareButtonProps = {
  release: Release;
  className?: string;
  label?: string;
  copiedLabel?: string;
};

export function ReleaseShareButton({
  release,
  className = "",
  label = "Share",
  copiedLabel = "Copied",
}: ReleaseShareButtonProps) {
  const [buttonLabel, setButtonLabel] = useState(label);

  async function onShareClick() {
    const result = await shareRelease({ release });

    if (result === "copied") {
      setButtonLabel(copiedLabel);
      window.setTimeout(() => setButtonLabel(label), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={onShareClick}
      className={className}
      aria-label={`Share ${release.title} on Radura`}
    >
      {buttonLabel}
    </button>
  );
}
