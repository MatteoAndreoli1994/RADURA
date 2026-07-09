import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  isUpstashConfigured,
  readRedisConfig,
  writeRedisConfig,
} from "@/lib/kv-config";
import { normalizeLiveDate, type LiveDate } from "@/lib/live-dates";

const REDIS_KEY = "radura:live-dates";
const DEV_STORE_DIR = ".data";
const DEV_STORE_FILE = "live-dates.json";
const LEGACY_SEED_FILE = "live-dates.json";

type LiveDatesConfig = {
  dates: LiveDate[];
};

function parseLiveDatesConfig(raw: unknown): LiveDatesConfig {
  const config = raw as LiveDatesConfig;
  return {
    dates: (Array.isArray(config.dates) ? config.dates : []).map(normalizeLiveDate),
  };
}

function isLocalDevBackendEnabled() {
  return !isUpstashConfigured() && !process.env.VERCEL;
}

function devStorePath() {
  return join(process.cwd(), DEV_STORE_DIR, DEV_STORE_FILE);
}

function readDevStore(): LiveDatesConfig {
  const path = devStorePath();

  if (!existsSync(path)) {
    const legacyPath = join(process.cwd(), LEGACY_SEED_FILE);
    if (existsSync(legacyPath)) {
      try {
        const legacy = parseLiveDatesConfig(
          JSON.parse(readFileSync(legacyPath, "utf-8")),
        );
        writeDevStore(legacy);
        return legacy;
      } catch {
        return { dates: [] };
      }
    }
    return { dates: [] };
  }

  try {
    return parseLiveDatesConfig(JSON.parse(readFileSync(path, "utf-8")));
  } catch {
    return { dates: [] };
  }
}

function writeDevStore(config: LiveDatesConfig) {
  const dir = join(process.cwd(), DEV_STORE_DIR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(devStorePath(), `${JSON.stringify(config, null, 2)}\n`, "utf-8");
}

export function isLiveDatesBackendReady() {
  return isUpstashConfigured() || isLocalDevBackendEnabled();
}

export async function readLiveDatesConfig(): Promise<LiveDatesConfig> {
  if (isUpstashConfigured()) {
    return readRedisConfig(REDIS_KEY, { dates: [] }, parseLiveDatesConfig);
  }

  if (isLocalDevBackendEnabled()) {
    return readDevStore();
  }

  return { dates: [] };
}

export async function writeLiveDatesConfig(dates: LiveDate[]) {
  if (isUpstashConfigured()) {
    await writeRedisConfig(REDIS_KEY, { dates });
    return;
  }

  if (isLocalDevBackendEnabled()) {
    writeDevStore({ dates });
    return;
  }

  throw new Error(
    "Backend date live non disponibile. In locale usa npm run dev; in produzione configura Upstash Redis.",
  );
}

export function validateLiveDates(dates: unknown): dates is LiveDate[] {
  if (!Array.isArray(dates)) return false;
  return dates.every(
    (d) =>
      d &&
      typeof d === "object" &&
      typeof (d as LiveDate).id === "string" &&
      typeof (d as LiveDate).date === "string" &&
      typeof (d as LiveDate).city === "string" &&
      typeof (d as LiveDate).venue === "string" &&
      (typeof (d as LiveDate).link === "string" ||
        (d as LiveDate).link === undefined) &&
      ((d as LiveDate).flyer === undefined ||
        typeof (d as LiveDate).flyer === "string"),
  );
}
