import { readFile } from "node:fs/promises";
import { join } from "node:path";

let fontDataPromise: Promise<ArrayBuffer> | null = null;

export function loadEbGaramondFont() {
  if (!fontDataPromise) {
    fontDataPromise = readFile(
      join(process.cwd(), "public/fonts/EBGaramond-Regular.ttf"),
    ).then((buffer) => {
      const arrayBuffer = new ArrayBuffer(buffer.byteLength);
      new Uint8Array(arrayBuffer).set(buffer);
      return arrayBuffer;
    });
  }

  return fontDataPromise;
}

export function raduraIconMarkup(fontSize: number) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        color: "#000000",
        fontSize,
        fontFamily: "EB Garamond",
        fontWeight: 400,
        letterSpacing: "-0.05em",
      }}
    >
      R
    </div>
  );
}
