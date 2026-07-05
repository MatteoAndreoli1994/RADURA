import type { SiteMode } from "@/lib/site-mode";
import { readJsonConfig, writeJsonConfig } from "@/lib/kv-config";

type SiteModeConfig = {
  mode: SiteMode;
};

function parseSiteModeConfig(raw: unknown): SiteModeConfig {
  const config = raw as SiteModeConfig;
  return { mode: config.mode === "full" ? "full" : "newsletter" };
}

export async function readSiteModeConfig(): Promise<SiteModeConfig> {
  return readJsonConfig<SiteModeConfig>({
    fileName: "site-mode.json",
    redisKey: "radura:site-mode",
    fallback: { mode: "newsletter" },
    parse: parseSiteModeConfig,
  });
}

export async function writeSiteModeConfig(mode: SiteMode) {
  await writeJsonConfig("site-mode.json", "radura:site-mode", { mode });
}
