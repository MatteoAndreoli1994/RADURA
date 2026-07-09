export type LegalLang = "en" | "it";

export const LEGAL_COPY = {
  en: {
    title: "Legal",
    updated: "Last updated: June 18, 2026",
    back: "Home",
    privacyTitle: "Privacy",
    cookiesTitle: "Cookies",
    privacy: [
      {
        body: "The only personal data we handle is the email address you choose to give us when you sign up for the newsletter. That's it.",
      },
      {
        body: "We use it just to send you occasional updates about Radura. Delivery is handled by EmailOctopus, and you can unsubscribe whenever you like using the link in any email.",
      },
      {
        body: "If you'd ever like us to remove your email or you have any questions, just write to info@raduraband.com and we'll take care of it.",
      },
    ],
    cookiesIntro:
      "We don't set any tracking or marketing cookies of our own. If you play music on the site, embedded Bandcamp players may set their own cookies to make playback work, those are managed by Bandcamp under their own policy.",
  },
  it: {
    title: "Note legali",
    updated: "Ultimo aggiornamento: 18 giugno 2026",
    back: "Home",
    privacyTitle: "Privacy",
    cookiesTitle: "Cookie",
    privacy: [
      {
        body: "L'unico dato personale che trattiamo e l'indirizzo email che ci lasci quando ti iscrivi alla newsletter. Nient'altro.",
      },
      {
        body: "Lo usiamo solo per inviarti qualche aggiornamento su Radura. L'invio avviene tramite EmailOctopus e puoi disiscriverti quando vuoi con il link presente in ogni email.",
      },
      {
        body: "Se vuoi che rimuoviamo la tua email o hai qualsiasi domanda, scrivici a info@raduraband.com e ce ne occupiamo noi.",
      },
    ],
    cookiesIntro:
      "Non usiamo cookie di tracciamento o marketing nostri. Se ascolti la musica sul sito, i player Bandcamp incorporati potrebbero impostare i propri cookie per far funzionare la riproduzione, sono gestiti da Bandcamp secondo la loro informativa.",
  },
} as const;

export const LEGAL_LINK_LABEL = {
  en: "Legal",
  it: "Note legali",
} as const;

export const LEGAL_CONSENT_LABEL = {
  en: "legal notice",
  it: "informativa legale",
} as const;

export const COOKIE_SETTINGS_LABEL = {
  en: "Cookies",
  it: "Cookie",
} as const;
