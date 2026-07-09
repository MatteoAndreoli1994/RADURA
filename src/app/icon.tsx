import { ImageResponse } from "next/og";
import { loadEbGaramondFont, raduraIconMarkup } from "@/lib/radura-favicon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(raduraIconMarkup(22), {
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
