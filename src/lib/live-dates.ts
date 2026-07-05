export type LiveDateStatus = "upcoming" | "past";

export type LiveDate = {
  id: string;
  date: string;
  city: string;
  venue: string;
  link: string;
  flyer?: string;
  code?: string;
  lineup?: string;
  status?: LiveDateStatus;
};

export function normalizeLiveDate(
  date: Omit<LiveDate, "link" | "flyer"> & {
    link?: string;
    flyer?: string;
    code?: string;
    lineup?: string;
    status?: LiveDateStatus;
  },
): LiveDate {
  return {
    ...date,
    link: date.link ?? "",
    flyer: date.flyer?.trim() || undefined,
    code: date.code?.trim() || undefined,
    lineup: date.lineup?.trim() || undefined,
    status: date.status,
  };
}

function parseLiveDateValue(date: string): Date | null {
  const dotted = date.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotted) {
    const [, day, month, year] = dotted;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(date.trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatLiveDateDisplay(date: string) {
  const parsed = parseLiveDateValue(date);
  if (!parsed) return date.trim();

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}.${month}.${year}`;
}

export function getLiveDateStatus(show: LiveDate, reference = new Date()): LiveDateStatus {
  if (show.status) return show.status;

  const parsed = parseLiveDateValue(show.date);
  if (!parsed) return "upcoming";

  const today = new Date(reference);
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  return parsed < today ? "past" : "upcoming";
}

export function formatLiveDateLineup(show: LiveDate) {
  return show.lineup?.trim() ?? "";
}

function liveDateSortTime(date: string) {
  const dotted = date.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotted) {
    const [, day, month, year] = dotted;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }
  return new Date(date.trim()).getTime();
}

export function sortLiveDatesByStatus(
  dates: LiveDate[],
  status: LiveDateStatus,
): LiveDate[] {
  return [...dates].sort((a, b) => {
    const aTime = liveDateSortTime(a.date);
    const bTime = liveDateSortTime(b.date);
    if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
    return status === "past" ? bTime - aTime : aTime - bTime;
  });
}

export function getNearestLiveWithFlyer(
  dates: LiveDate[],
  status: LiveDateStatus,
): LiveDate | null {
  const sorted = sortLiveDatesByStatus(
    dates.filter((show) => getLiveDateStatus(show) === status),
    status,
  );

  return sorted.find((show) => Boolean(show.flyer?.trim())) ?? null;
}
