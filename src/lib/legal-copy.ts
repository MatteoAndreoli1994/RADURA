export type LegalLang = "en" | "it";

export const LEGAL_COPY = {
  en: {
    title: "Legal",
    updated: "Last updated: June 18, 2026",
    back: "Back to site",
    privacyTitle: "Privacy",
    cookiesTitle: "Cookies",
    privacy: [
      {
        body: "Controller: RADURA. Privacy contact: info@raduraband.com",
      },
      {
        body: "When you subscribe to the newsletter we only process the email address you provide. The legal basis is your consent (GDPR Art. 6(1)(a)). By subscribing you confirm that you have read this notice.",
      },
      {
        body: "Newsletter delivery is managed through Mailchimp (processor under Art. 28 GDPR). Your email is kept until you unsubscribe or withdraw consent. Some processing may occur outside the EEA with appropriate safeguards (e.g. Standard Contractual Clauses).",
      },
      {
        body: "You may exercise your GDPR rights (access, rectification, erasure, restriction, portability, objection) by writing to radurawebsite@proton.me. You can withdraw consent at any time via the unsubscribe link in our emails. You may lodge a complaint with the Italian Data Protection Authority at www.garanteprivacy.it.",
      },
    ],
    cookiesIntro:
      "This site uses essential cookies and, only with your consent, optional cookies for statistics or marketing. You can change your choices anytime via the Cookies link in the site footer.",
  },
  it: {
    title: "Note legali",
    updated: "Ultimo aggiornamento: 18 giugno 2026",
    back: "Torna al sito",
    privacyTitle: "Privacy",
    cookiesTitle: "Cookie",
    privacy: [
      {
        body: "Titolare del trattamento: RADURA. Contatto privacy: info@raduraband.com",
      },
      {
        body: "Con l'iscrizione alla newsletter trattiamo solo l'indirizzo email che inserisci. La base giuridica e il consenso (art. 6, par. 1, lett. a GDPR). Iscrivendoti dichiari di aver letto la presente informativa.",
      },
      {
        body: "L'invio della newsletter avviene tramite Mailchimp (responsabile del trattamento ex art. 28 GDPR). L'email e conservata fino a disiscrizione o revoca del consenso. Alcuni trattamenti possono avvenire fuori dallo SEE con garanzie adeguate (es. clausole contrattuali standard).",
      },
      {
        body: "Puoi esercitare i diritti previsti dal GDPR (accesso, rettifica, cancellazione, limitazione, portabilita, opposizione) scrivendo a radurawebsite@proton.me. Puoi revocare il consenso in qualsiasi momento tramite il link di unsubscribe nelle email. Puoi proporre reclamo al Garante per la Protezione dei Dati Personali su www.garanteprivacy.it.",
      },
    ],
    cookiesIntro:
      "Il sito utilizza cookie tecnici e, solo previo consenso, cookie opzionali per statistiche o marketing. Puoi modificare le scelte in qualsiasi momento tramite il link Cookie nel footer del sito.",
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
