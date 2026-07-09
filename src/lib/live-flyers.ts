import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { upstashDel, upstashGet, upstashSet } from "@/lib/kv-config";

const FLYER_DIR = "public/live-flyers";
const REDIS_PREFIX = "radura:live-flyer:";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/x-webp": ".webp",
  "image/gif": ".gif",
};

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

type StoredFlyer = {
  data: string;
  contentType: string;
};

function hasUpstash() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export function liveFlyerApiPath(id: string, version?: number | string) {
  const base = `/api/live-flyers/${encodeURIComponent(id)}`;
  if (version === undefined) return base;
  return `${base}?v=${encodeURIComponent(String(version))}`;
}

export function liveFlyerVersionFromBuffer(buffer: Buffer) {
  let hash = 2166136261;
  for (const byte of buffer) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function resolveFlyerUploadContentType(file: Pick<File, "name" | "type">) {
  const type = file.type.trim().toLowerCase();
  if (LIVE_FLYER_ALLOWED_TYPES.has(type)) {
    return type === "image/x-webp" ? "image/webp" : type;
  }

  const match = file.name.trim().toLowerCase().match(/(\.[a-z0-9]+)$/);
  const ext = match?.[1];
  if (!ext) return null;

  const contentType = EXT_TO_MIME[ext];
  if (!contentType || !LIVE_FLYER_ALLOWED_TYPES.has(contentType)) {
    return null;
  }

  return contentType;
}

export function extensionForMime(contentType: string) {
  return MIME_TO_EXT[contentType] ?? ".jpg";
}

function flyerDirPath() {
  return join(process.cwd(), FLYER_DIR);
}

function flyerFilePath(id: string, ext: string) {
  return join(flyerDirPath(), `${id}${ext}`);
}

function removePublicFlyerFiles(id: string) {
  for (const ext of Object.keys(EXT_TO_MIME)) {
    const path = flyerFilePath(id, ext);
    if (existsSync(path)) {
      unlinkSync(path);
    }
  }
}

export async function saveLiveFlyer(
  id: string,
  buffer: Buffer,
  contentType: string,
) {
  const ext = extensionForMime(contentType);

  removePublicFlyerFiles(id);

  let fileSaved = false;
  try {
    const dir = flyerDirPath();
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(flyerFilePath(id, ext), buffer);
    fileSaved = true;
  } catch {
    // Read-only filesystem (es. alcuni ambienti serverless).
  }

  if (hasUpstash()) {
    const payload: StoredFlyer = {
      data: buffer.toString("base64"),
      contentType,
    };
    await upstashSet(`${REDIS_PREFIX}${id}`, JSON.stringify(payload));
    return;
  }

  if (!fileSaved) {
    throw new Error(
      "Impossibile salvare il flyer: filesystem non scrivibile e Upstash Redis non configurato.",
    );
  }
}

export async function readLiveFlyer(
  id: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (hasUpstash()) {
    const cached = await upstashGet(`${REDIS_PREFIX}${id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as StoredFlyer;
        return {
          buffer: Buffer.from(parsed.data, "base64"),
          contentType: parsed.contentType,
        };
      } catch {
        // fall through to public files
      }
    }
  }

  for (const ext of Object.keys(EXT_TO_MIME)) {
    const path = flyerFilePath(id, ext);
    if (existsSync(path)) {
      return {
        buffer: readFileSync(path),
        contentType: EXT_TO_MIME[ext] ?? "image/jpeg",
      };
    }
  }

  return null;
}

export async function deleteLiveFlyer(id: string) {
  removePublicFlyerFiles(id);
  await upstashDel(`${REDIS_PREFIX}${id}`);
}

export const LIVE_FLYER_MAX_BYTES = 5 * 1024 * 1024;
export const LIVE_FLYER_ALLOWED_TYPES = new Set(Object.keys(MIME_TO_EXT));
