#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const REDIS_KEY = "radura:live-dates";
const DEV_STORE_PATH = join(process.cwd(), ".data/live-dates.json");

async function seedRedis(url, token, payload) {
  const res = await fetch(`${url}/set/${encodeURIComponent(REDIS_KEY)}/${encodeURIComponent(`${JSON.stringify(payload, null, 2)}\n`)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("Upload su Redis fallito:", await res.text());
    process.exit(1);
  }
}

function seedLocalStore(payload) {
  const dir = join(process.cwd(), ".data");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(DEV_STORE_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

async function main() {
  const sourcePath = process.argv[2] ?? join(process.cwd(), "live-dates.json");
  const raw = readFileSync(sourcePath, "utf-8");
  const payload = JSON.parse(raw);
  const count = Array.isArray(payload.dates) ? payload.dates.length : 0;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    await seedRedis(url, token, payload);
    console.log(`Caricate ${count} date live su Redis (${REDIS_KEY}).`);
    return;
  }

  seedLocalStore(payload);
  console.log(`Caricate ${count} date live nel backend locale (.data/live-dates.json).`);
}

void main();
