"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { fetchWithTimeout } from "@/lib/admin-fetch";
import type { ReleaseLinksConfig } from "@/lib/admin-release-links";
import type { LiveDate } from "@/lib/live-dates";
import type { SiteMode } from "@/lib/site-mode";

const ADMIN_EMAIL = "radurawebsite@proton.me";

const ADMIN_FIELD =
  "min-w-0 w-full border-0 bg-transparent py-1.5 text-[13px] leading-tight text-black outline-none placeholder:text-black/25 md:py-1 md:text-site";

const LIVE_ROW =
  "relative flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-black/[0.08] px-3 py-2 last:border-b-0 md:flex-nowrap md:gap-3 md:px-4 md:py-1.5";

const LIVE_HEADER =
  "hidden border-b border-black/10 bg-black/[0.02] px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-muted md:flex md:flex-nowrap md:items-center md:gap-3";

const LIVE_ICON_BTN =
  "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[18px] leading-none text-muted transition-colors hover:text-black";

type View = "loading" | "login" | "dashboard";

function AdminFeature({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-black/10 py-8">
      <h2 className="mb-4 text-site tracking-wide text-black">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function AdminPanel() {
  const [view, setView] = useState<View>("loading");
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<SiteMode>("newsletter");
  const [acqueBandcampUrl, setAcqueBandcampUrl] = useState("");
  const [liveDates, setLiveDates] = useState<LiveDate[]>([]);
  const [modeError, setModeError] = useState("");
  const [releaseLinksError, setReleaseLinksError] = useState("");
  const [datesError, setDatesError] = useState("");
  const [modeSaving, setModeSaving] = useState(false);
  const [releaseLinksSaving, setReleaseLinksSaving] = useState(false);
  const [datesSaving, setDatesSaving] = useState(false);
  const [modeSaved, setModeSaved] = useState(false);
  const [releaseLinksSaved, setReleaseLinksSaved] = useState(false);
  const [datesSaved, setDatesSaved] = useState(false);
  const [flyerUploadingId, setFlyerUploadingId] = useState<string | null>(null);
  const [backendBanner, setBackendBanner] = useState("");
  const liveDatesRef = useRef<LiveDate[]>([]);

  function reportBackendError(message: string) {
    setBackendBanner(message);
  }

  function clearBackendBanner() {
    setBackendBanner("");
  }

  useEffect(() => {
    liveDatesRef.current = liveDates;
  }, [liveDates]);

  async function loadSiteMode() {
    try {
      const res = await fetchWithTimeout("/api/admin/site-mode");
      if (!res.ok) return;
      const data = (await res.json()) as { mode: SiteMode };
      setMode(data.mode);
    } catch {
      // keep default mode
    }
  }

  async function loadLiveDates() {
    try {
      const res = await fetchWithTimeout("/api/admin/live-dates");
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        reportBackendError(
          data.error ?? "Impossibile caricare le date live dal backend.",
        );
        return;
      }
      const data = (await res.json()) as { dates: LiveDate[] };
      setLiveDates(data.dates.map((d) => ({ ...d, link: d.link ?? "", flyer: d.flyer ?? "" })));
    } catch {
      reportBackendError("Errore di rete durante il caricamento delle date live.");
    }
  }

  async function loadLiveDatesBackendStatus() {
    try {
      const res = await fetchWithTimeout("/api/live-dates/status");
      if (!res.ok) {
        reportBackendError("Impossibile verificare lo stato del backend date live.");
        return;
      }
      const data = (await res.json()) as { ready?: boolean; reason?: string };
      if (!data.ready) {
        reportBackendError(
          data.reason ??
            "Backend date live non disponibile. Configura Upstash Redis o avvia il progetto in locale con npm run dev.",
        );
      }
    } catch {
      reportBackendError("Errore di rete durante la verifica del backend date live.");
    }
  }

  async function loadReleaseLinks() {
    try {
      const res = await fetchWithTimeout("/api/admin/release-links");
      if (!res.ok) return;
      const data = (await res.json()) as ReleaseLinksConfig;
      setAcqueBandcampUrl(data.acqueBandcampUrl ?? "");
    } catch {
      // keep default value
    }
  }

  async function loadDashboardData() {
    await Promise.all([
      loadSiteMode(),
      loadReleaseLinks(),
      loadLiveDates(),
      loadLiveDatesBackendStatus(),
    ]);
  }

  useEffect(() => {
    let alive = true;

    const safety = window.setTimeout(() => {
      if (!alive) return;
      setView((current) => (current === "loading" ? "login" : current));
    }, 4000);

    async function bootstrap() {
      try {
        const res = await fetchWithTimeout("/api/admin/session");
        if (!alive) return;

        if (res.ok) {
          setView("dashboard");
          void loadDashboardData();
          return;
        }

        setView("login");
      } catch {
        if (alive) setView("login");
      } finally {
        window.clearTimeout(safety);
      }
    }

    void bootstrap();

    return () => {
      alive = false;
      window.clearTimeout(safety);
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setModeError("");
    setDatesError("");
    setModeSaving(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setModeError(data.error ?? "Login fallito");
        return;
      }

      setPassword("");
      setView("dashboard");
      void loadDashboardData();
    } catch {
      setModeError("Errore di rete");
    } finally {
      setModeSaving(false);
    }
  }

  async function saveMode(nextMode: SiteMode) {
    setModeSaving(true);
    setModeSaved(false);
    setModeError("");

    try {
      const res = await fetch("/api/admin/site-mode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: nextMode }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setModeError(data.error ?? "Salvataggio fallito");
        return false;
      }

      setMode(nextMode);
      setModeSaved(true);
      return true;
    } catch {
      setModeError("Errore di rete");
      return false;
    } finally {
      setModeSaving(false);
    }
  }

  async function saveLiveDates(datesToSave?: LiveDate[]) {
    const payload = datesToSave ?? liveDatesRef.current;

    if (payload.length === 0) {
      const message = "Nessuna data da salvare.";
      setDatesError(message);
      reportBackendError(message);
      return false;
    }

    setDatesSaving(true);
    setDatesSaved(false);
    setDatesError("");

    try {
      const res = await fetch("/api/admin/live-dates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: payload }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        const message = data.error ?? "Salvataggio fallito";
        setDatesError(message);
        reportBackendError(message);
        return false;
      }

      setDatesSaved(true);
      clearBackendBanner();
      return true;
    } catch {
      const message = "Errore di rete";
      setDatesError(message);
      reportBackendError(message);
      return false;
    } finally {
      setDatesSaving(false);
    }
  }

  async function saveReleaseLinks() {
    setReleaseLinksSaving(true);
    setReleaseLinksSaved(false);
    setReleaseLinksError("");

    try {
      const res = await fetch("/api/admin/release-links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acqueBandcampUrl: acqueBandcampUrl.trim() || "",
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setReleaseLinksError(data.error ?? "Salvataggio fallito");
        return false;
      }

      const data = (await res.json()) as ReleaseLinksConfig;
      setAcqueBandcampUrl(data.acqueBandcampUrl ?? "");
      setReleaseLinksSaved(true);
      return true;
    } catch {
      setReleaseLinksError("Errore di rete");
      return false;
    } finally {
      setReleaseLinksSaving(false);
    }
  }

  function updateLiveDate(id: string, field: keyof LiveDate, value: string) {
    setLiveDates((current) =>
      current.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    );
  }

  async function uploadLiveFlyer(id: string, file: File) {
    setFlyerUploadingId(id);
    setDatesError("");
    setDatesSaved(false);

    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("file", file);

      const res = await fetch("/api/admin/live-dates/flyer", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        const message = data.error ?? "Upload flyer fallito";
        setDatesError(message);
        reportBackendError(message);
        return;
      }

      const data = (await res.json()) as { flyer: string };
      const current = liveDatesRef.current;

      if (current.length === 0) {
        const message = "Date non ancora caricate. Ricarica la pagina e riprova.";
        setDatesError(message);
        reportBackendError(message);
        return;
      }

      const nextDates = current.map((entry) =>
        entry.id === id ? { ...entry, flyer: data.flyer } : entry,
      );
      setLiveDates(nextDates);
      const saved = await saveLiveDates(nextDates);
      if (!saved) return;
      clearBackendBanner();
    } catch {
      const message = "Errore di rete durante l'upload del flyer";
      setDatesError(message);
      reportBackendError(message);
    } finally {
      setFlyerUploadingId(null);
    }
  }

  async function removeLiveFlyer(id: string) {
    setFlyerUploadingId(id);
    setDatesError("");
    setDatesSaved(false);

    try {
      const res = await fetch("/api/admin/live-dates/flyer", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        const message = data.error ?? "Rimozione flyer fallita";
        setDatesError(message);
        reportBackendError(message);
        return;
      }

      const current = liveDatesRef.current;

      if (current.length === 0) {
        const message = "Date non ancora caricate. Ricarica la pagina e riprova.";
        setDatesError(message);
        reportBackendError(message);
        return;
      }

      const nextDates = current.map((entry) =>
        entry.id === id ? { ...entry, flyer: "" } : entry,
      );
      setLiveDates(nextDates);
      const saved = await saveLiveDates(nextDates);
      if (!saved) return;
      clearBackendBanner();
    } catch {
      const message = "Errore di rete durante la rimozione del flyer";
      setDatesError(message);
      reportBackendError(message);
    } finally {
      setFlyerUploadingId(null);
    }
  }

  function addLiveDate() {
    setLiveDates((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        date: "",
        city: "",
        venue: "",
        link: "",
        flyer: "",
      },
    ]);
  }

  function removeLiveDate(id: string) {
    setLiveDates((current) => current.filter((d) => d.id !== id));
  }

  async function handleToggle() {
    const nextMode: SiteMode = mode === "full" ? "newsletter" : "full";
    await saveMode(nextMode);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setView("login");
    setPassword("");
  }

  if (view === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 py-16 text-site text-muted">
        Caricamento…
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="mb-2 text-[21px] tracking-[0.1em] text-black">RADURA</h1>
          <p className="mb-8 text-site text-muted">Admin</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="text-site tracking-wide text-muted"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full border-b border-black/30 bg-transparent py-1.5 text-site text-black outline-none focus:border-black"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="text-site tracking-wide text-muted"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full border-b border-black/30 bg-transparent py-1.5 text-site text-black outline-none focus:border-black"
              />
            </div>

            {modeError ? (
              <p className="text-site text-red-700">{modeError}</p>
            ) : null}

            <button
              type="submit"
              disabled={modeSaving}
              className="nav-link-hover cursor-pointer border-0 bg-transparent p-0 text-site italic text-black disabled:opacity-50"
            >
              {modeSaving ? "Accesso…" : "Accedi"}
            </button>
          </form>

          <Link
            href="/"
            className="nav-link-hover mt-10 inline-block text-site italic text-muted"
          >
            Torna al sito
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8 md:py-6 lg:px-10">
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-black/10 bg-white/95 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
        <div>
          <h1 className="text-[21px] tracking-[0.1em] text-black">RADURA</h1>
          <p className="mt-0.5 text-site italic text-muted">Admin</p>
        </div>
        <div className="flex shrink-0 items-baseline gap-5">
          <Link
            href="/"
            className="nav-link-hover text-site italic text-black"
          >
            Torna al sito
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="nav-link-hover cursor-pointer border-0 bg-transparent p-0 text-site italic text-muted"
          >
            Esci
          </button>
        </div>
      </div>

      {backendBanner ? (
        <div
          role="alert"
          className="-mx-4 mb-2 border border-red-200 bg-red-50 px-4 py-3 text-site text-red-800 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10"
        >
          {backendBanner}
        </div>
      ) : null}

      <div className="flex w-full flex-1 flex-col gap-8">
        <AdminFeature title="Modalità sito">
          <div className="flex flex-wrap items-center gap-4">
            <span
              className={`shrink-0 text-site tracking-wide transition-colors ${
                mode === "full" ? "text-black" : "text-muted"
              }`}
            >
              Full
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={mode === "newsletter"}
              aria-label="Passa tra Full e Newsletter"
              disabled={modeSaving}
              onClick={handleToggle}
              className="relative h-5 w-10 shrink-0 cursor-pointer rounded-full border border-black/20 bg-black/[0.04] transition-colors disabled:cursor-default disabled:opacity-50"
            >
              <span
                className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-black transition-all duration-200 ${
                  mode === "newsletter" ? "left-[calc(100%-14px)]" : "left-1"
                }`}
              />
            </button>

            <span
              className={`shrink-0 text-site tracking-wide transition-colors ${
                mode === "newsletter" ? "text-black" : "text-muted"
              }`}
            >
              Newsletter
            </span>

            {modeSaving ? (
              <span className="text-site text-muted">Salvataggio…</span>
            ) : modeSaved ? (
              <span className="text-site text-muted">Salvato</span>
            ) : null}
          </div>

          {modeError ? (
            <p className="mt-3 text-site text-red-700">{modeError}</p>
          ) : null}
        </AdminFeature>

        <AdminFeature title="Release link (fallback)">
          <div className="flex w-full max-w-3xl flex-col gap-3">
            <label className="text-site tracking-wide text-muted">
              Acque Bandcamp URL (album)
            </label>
            <input
              type="url"
              value={acqueBandcampUrl}
              onChange={(event) => {
                setAcqueBandcampUrl(event.target.value);
                if (releaseLinksError) setReleaseLinksError("");
                if (releaseLinksSaved) setReleaseLinksSaved(false);
              }}
              placeholder="https://radura.bandcamp.com/album/acque"
              className="w-full border-b border-black/30 bg-transparent py-1.5 text-site text-black outline-none focus:border-black"
            />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => void saveReleaseLinks()}
                disabled={releaseLinksSaving}
                className="nav-link-hover cursor-pointer border-0 bg-transparent p-0 text-site italic text-black disabled:opacity-50"
              >
                {releaseLinksSaving ? "Salvataggio…" : "Salva"}
              </button>
              {releaseLinksSaved ? (
                <span className="text-site text-muted">Salvato</span>
              ) : null}
            </div>
            <p className="text-site text-muted">
              Se il recupero automatico non aggancia ancora l’album al giorno di uscita, questo URL
              viene usato come fallback per popolare la tracklist/audio di Acque.
            </p>
            {releaseLinksError ? (
              <p className="text-site text-red-700">{releaseLinksError}</p>
            ) : null}
          </div>
        </AdminFeature>

        <section className="flex min-h-0 w-full flex-1 flex-col border-t border-black/10 pt-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-site tracking-wide text-black">Date live</h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={addLiveDate}
                className="nav-link-hover cursor-pointer border-0 bg-transparent p-0 text-site italic text-black"
              >
                + Aggiungi
              </button>
              <button
                type="button"
                onClick={() => void saveLiveDates()}
                disabled={datesSaving}
                className="nav-link-hover cursor-pointer border-0 bg-transparent p-0 text-site italic text-black disabled:opacity-50"
              >
                {datesSaving ? "Salvataggio…" : "Salva"}
              </button>
              {datesSaved ? (
                <span className="text-site text-muted">Salvato</span>
              ) : null}
            </div>
          </div>

          <div className="w-full border border-black/15">
            <div className={LIVE_HEADER} aria-hidden>
              <span className="md:flex-[0.85] md:min-w-[5.5rem]">Data</span>
              <span className="md:flex-[0.95] md:min-w-[5rem]">Città</span>
              <span className="md:flex-[1.35] md:min-w-0">Venue</span>
              <span className="md:flex-[1.65] md:min-w-0">Link</span>
              <span className="md:flex-[0.9] md:min-w-[4.5rem]">Flyer</span>
              <span className="md:w-7 md:shrink-0" />
            </div>

            {liveDates.length === 0 ? (
              <p className="border-b border-black/[0.08] px-4 py-4 text-site text-muted">
                Nessuna data live.
              </p>
            ) : (
              liveDates.map((show) => (
                <div key={show.id} className={LIVE_ROW}>
                  <input
                    type="text"
                    value={show.date}
                    onChange={(e) =>
                      updateLiveDate(show.id, "date", e.target.value)
                    }
                    placeholder="18.07.2026"
                    aria-label="Data"
                    className={`${ADMIN_FIELD} w-[calc(50%-1.25rem)] md:flex-[0.85] md:min-w-[5.5rem]`}
                  />
                  <input
                    type="text"
                    value={show.city}
                    onChange={(e) =>
                      updateLiveDate(show.id, "city", e.target.value)
                    }
                    placeholder="Città"
                    aria-label="Città"
                    className={`${ADMIN_FIELD} w-[calc(50%-1.25rem)] md:flex-[0.95] md:min-w-[5rem]`}
                  />
                  <input
                    type="text"
                    value={show.venue}
                    onChange={(e) =>
                      updateLiveDate(show.id, "venue", e.target.value)
                    }
                    placeholder="Venue"
                    aria-label="Venue"
                    className={`${ADMIN_FIELD} w-full md:flex-[1.35]`}
                  />
                  <input
                    type="url"
                    value={show.link}
                    onChange={(e) =>
                      updateLiveDate(show.id, "link", e.target.value)
                    }
                    placeholder="Link"
                    aria-label="Link"
                    className={`${ADMIN_FIELD} w-full md:flex-[1.65]`}
                  />
                  <div className="flex w-full items-center gap-2 md:w-auto md:flex-[0.9] md:min-w-[4.5rem]">
                    {show.flyer ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={show.flyer}
                        alt=""
                        className="h-8 w-8 shrink-0 object-cover"
                      />
                    ) : null}
                    <label className="cursor-pointer text-[11px] text-black/55 underline decoration-black/20 underline-offset-2 hover:text-black">
                      {flyerUploadingId === show.id
                        ? "…"
                        : show.flyer
                          ? "Cambia"
                          : "Carica"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={flyerUploadingId === show.id}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (file) void uploadLiveFlyer(show.id, file);
                        }}
                      />
                    </label>
                    {show.flyer ? (
                      <button
                        type="button"
                        onClick={() => void removeLiveFlyer(show.id)}
                        disabled={flyerUploadingId === show.id}
                        className="cursor-pointer border-0 bg-transparent p-0 text-[11px] text-black/45 underline decoration-black/15 underline-offset-2 hover:text-black disabled:opacity-50"
                      >
                        Rimuovi
                      </button>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLiveDate(show.id)}
                    aria-label="Rimuovi data"
                    className={`${LIVE_ICON_BTN} absolute top-2 right-3 md:static md:top-auto md:right-auto`}
                  >
                    ×
                  </button>
                </div>
              ))
            )}

            <button
              type="button"
              onClick={addLiveDate}
              aria-label="Aggiungi data live"
              className="group flex w-full cursor-pointer flex-col items-center gap-1 border-0 border-t border-dashed border-black/20 bg-black/[0.015] px-4 py-4 transition-colors hover:bg-black/[0.04] md:py-5"
            >
              <span className="text-[3.75rem] leading-none font-light text-black/35 transition-colors group-hover:text-black/70 md:text-[4.25rem]">
                +
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted transition-colors group-hover:text-black/60">
                Aggiungi data live
              </span>
            </button>
          </div>

          {datesError ? (
            <p className="mt-3 text-site text-red-700">{datesError}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
