import { ImageResponse } from "next/og";
import { loadEbGaramondFont, raduraIconMarkup } from "@/lib/radura-favicon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(raduraIconMarkup(128), {
    ...size,
    fonts: [
      {
        name: "EB Garamond",
        data: await loadEbGaramondFont(),
        style: "normal",
        weight: 400,
      },
    ],
  });
}
