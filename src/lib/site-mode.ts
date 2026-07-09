import { readJsonConfig } from "@/lib/kv-config";

export type SiteMode = "full" | "newsletter";

type SiteModeConfig = {
  mode: SiteMode;
};

function parseSiteModeConfig(raw: unknown): SiteModeConfig {
  const config = raw as SiteModeConfig;
  return { mode: config.mode === "full" ? "full" : "newsletter" };
}

export async function getSiteMode(): Promise<SiteMode> {
  const envMode = process.env.SITE_MODE?.trim();
  if (envMode === "full" || envMode === "newsletter") {
    return envMode;
  }

  const config = await readJsonConfig<SiteModeConfig>({
    fileName: "site-mode.json",
    redisKey: "radura:site-mode",
    fallback: { mode: "newsletter" },
    parse: parseSiteModeConfig,
  });

  return config.mode;
}
