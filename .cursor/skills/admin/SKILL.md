---
name: admin
description: >-
  Radura admin panel at /admin: login, site-mode management, backend config.
  Use when working on admin auth, /admin routes, site-mode.json, or admin UI.
---

# Radura Admin

## Access

- URL: `/admin`
- Email: `radurawebsite@proton.me` (only allowed admin)
- Password: `ADMIN_PASSWORD` in `.env.local`
- Optional: `ADMIN_SESSION_SECRET` (falls back to `ADMIN_PASSWORD`)

## Env (.env.local)

```bash
ADMIN_PASSWORD=your-secure-password
# ADMIN_SESSION_SECRET=optional-long-random-string
```

Mailchimp (newsletter API) stays separate: `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`, `MAILCHIMP_SERVER_PREFIX`.

## API routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/admin/login` | POST | — | `{ email, password }` → session cookie |
| `/api/admin/logout` | POST | — | Clear session |
| `/api/admin/session` | GET | cookie | Check logged-in state |
| `/api/admin/site-mode` | GET/PATCH | cookie | Read/write `site-mode.json` |
| `/api/admin/live-dates` | GET/PATCH | cookie | Read/write `live-dates.json` |

## Site mode

`site-mode.json` at project root:

```json
{ "mode": "full" }
```

- `full` → `FullSite` on `/`
- `newsletter` → `NewsletterPreview` on `/`

Admin PATCH body: `{ "mode": "full" | "newsletter" }`

## Live dates

`live-dates.json` at project root (fallback locale). In produzione con Upstash: chiave Redis `radura:live-dates`.

```json
{
  "dates": [
    { "id": "1", "date": "12 Sep 2026", "city": "Milan", "venue": "Santeria Social Club" }
  ]
}
```

Shown in Lives section via `LiveDates.tsx`. Admin PATCH body: `{ "dates": LiveDate[] }`.

## Key files

- `src/lib/admin-auth.ts` — session cookie, credential check
- `src/lib/admin-site-mode.ts` — read/write site mode (Redis + file)
- `src/lib/admin-live-dates.ts` — read/write live dates (Redis + file)
- `src/components/admin/AdminPanel.tsx` — login + dashboard UI
- `src/app/admin/page.tsx` — admin page entry

## Extending admin

When adding new backend settings:

1. Add protected API under `src/app/api/admin/`
2. Call `requireAdminSession()` at the start of handlers
3. Add UI section in `AdminPanel.tsx`
4. Document new env vars in this skill
