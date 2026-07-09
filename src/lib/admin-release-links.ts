import { readJsonConfig, writeJsonConfig } from "@/lib/kv-config";

export type ReleaseLinksConfig = {
  acqueBandcampUrl?: string;
};

function normalizeBandcampUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function parseReleaseLinksConfig(raw: unknown): ReleaseLinksConfig {
  const config = raw as ReleaseLinksConfig;
  return {
    acqueBandcampUrl: normalizeBandcampUrl(config?.acqueBandcampUrl),
  };
}

export async function readReleaseLinksConfig(): Promise<ReleaseLinksConfig> {
  return readJsonConfig<ReleaseLinksConfig>({
    fileName: "release-links.json",
    redisKey: "radura:release-links",
    fallback: {},
    parse: parseReleaseLinksConfig,
  });
}

export async function writeReleaseLinksConfig(config: ReleaseLinksConfig) {
  await writeJsonConfig("release-links.json", "radura:release-links", config);
}

export function validateReleaseLinksPayload(
  payload: unknown,
): payload is ReleaseLinksConfig {
  if (!payload || typeof payload !== "object") return false;
  const value = payload as { acqueBandcampUrl?: unknown };
  if (value.acqueBandcampUrl === undefined) return true;
  if (typeof value.acqueBandcampUrl !== "string") return false;

  const trimmed = value.acqueBandcampUrl.trim();
  if (!trimmed) return true;
  if (!trimmed.startsWith("https://")) return false;
  if (!trimmed.includes("bandcamp.com")) return false;
  return true;
}
