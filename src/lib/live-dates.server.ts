import { readLiveDatesConfig } from "@/lib/admin-live-dates";
import type { LiveDate } from "@/lib/live-dates";

export async function getLiveDates(): Promise<LiveDate[]> {
  const config = await readLiveDatesConfig();
  return config.dates;
}
