import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

function hasUpstash() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export function isUpstashConfigured() {
  return hasUpstash();
}

export async function upstashGet(key: string): Promise<string | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { result?: string | null };
  return data.result ?? null;
}

export async function upstashSet(key: string, value: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis non configurato");
  }

  const timeoutMs = value.length > 8_000 ? 30_000 : 8_000;
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    method: "POST",
    body: value,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = (await res.json()) as { error?: string };
      detail = data.error?.trim() ?? "";
    } catch {
      // ignore parse errors
    }
    throw new Error(
      detail
        ? `Impossibile salvare su Upstash Redis: ${detail}`
        : `Impossibile salvare su Upstash Redis (HTTP ${res.status})`,
    );
  }
}

export async function upstashDel(key: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  const res = await fetch(`${url}/del/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    method: "POST",
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Impossibile eliminare da Upstash Redis (HTTP ${res.status})`);
  }
}

export async function pingUpstashRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Upstash Redis non configurato. Aggiungi UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN in .env.local.",
    );
  }

  const res = await fetch(`${url}/ping`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Upstash Redis non raggiungibile (HTTP ${res.status})`);
  }

  const data = (await res.json()) as { result?: string };
  if (data.result !== "PONG") {
    throw new Error("Upstash Redis ha risposto in modo inatteso");
  }
}

export async function readRedisConfig<T>(
  redisKey: string,
  fallback: T,
  parse: (raw: unknown) => T,
): Promise<T> {
  if (!hasUpstash()) {
    return fallback;
  }

  const cached = await upstashGet(redisKey);
  if (!cached) {
    return fallback;
  }

  try {
    return parse(JSON.parse(cached));
  } catch {
    return fallback;
  }
}

export async function writeRedisConfig(redisKey: string, value: unknown) {
  if (!hasUpstash()) {
    throw new Error(
      "Upstash Redis non configurato. Aggiungi UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN in .env.local.",
    );
  }

  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  await upstashSet(redisKey, serialized);
}

type ReadJsonConfigOptions<T> = {
  fileName: string;
  redisKey: string;
  fallback: T;
  parse: (raw: unknown) => T;
};

export async function readJsonConfig<T>({
  fileName,
  redisKey,
  fallback,
  parse,
}: ReadJsonConfigOptions<T>): Promise<T> {
  if (hasUpstash()) {
    const cached = await upstashGet(redisKey);
    if (cached) {
      try {
        return parse(JSON.parse(cached));
      } catch {
        // fall through to file
      }
    }
  }

  try {
    const raw = readFileSync(join(process.cwd(), fileName), "utf-8");
    return parse(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

export async function writeJsonConfig(
  fileName: string,
  redisKey: string,
  value: unknown,
) {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;

  if (hasUpstash()) {
    await upstashSet(redisKey, serialized);
    return;
  }

  try {
    writeFileSync(join(process.cwd(), fileName), serialized, "utf-8");
  } catch {
    if (process.env.VERCEL) {
      throw new Error(
        "In produzione serve Upstash Redis: Vercel Dashboard → Storage → Upstash Redis, poi aggiungi UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.",
      );
    }
    throw new Error("Impossibile scrivere il file di configurazione");
  }
}
