export type AboutLang = "en" | "it";

export const ABOUT_COPY = {
  en: {
    paragraphs: [
      "Music transforms.",
      "Our journey began in 2015. Every word we shouted, every person we met has been essential. We are an independent band, which means we exist through the bonds we build with our community. A community that is vast and free. Through intensity, we seek the sincerity of every feeling. In the energy that comes alive on stage, the spark of transformation is born. That is how we have grown together, and it has been beautiful.",
      "Our new album, ACQUE, is a vision of love. An invitation to immerse yourself in the world, where everything is moved by a living spirit. To follow your inner star, looking within yourself while discovering what in EDVI was still hidden, still unclear. A sense of purpose. An intimate, personal, profound desire. The only force powerful enough to lead us beyond ourselves and, through the magic of creation, forge a new bond with the world.",
      "We hope this album will transform everyone who listens to it.",
      "With love and gratitude,\nRadura",
    ],
    contactLabel: "Contact",
    socialLabel: "Social",
    newsletterLabel: "Newsletter",
    newsletterCopy: "Be the first to hear about new releases, tour information and more.",
  },
  it: {
    paragraphs: [
      "La musica trasforma.",
      "Il nostro sentiero inizia nel 2015. Ogni parola urlata, ogni persona incontrata è stata fondamentale. Siamo una band indipendente, ovvero esistiamo nei legami che creiamo con la nostra comunità, che è grande e libera. Attraverso l'intensità cerchiamo la sincerità di ogni sensazione. Nell'energia che si crea sul palco comincia la scintilla della trasformazione. Così siamo cresciuti assieme ed è stato bellissimo.",
      "Il nostro nuovo disco ACQUE è una visione d'amore. Un invito a immergersi nel mondo, dove ogni cosa è mossa da uno spirito. A seguire la stella interiore, guardando dentro se stessi, ma trovando quello che in EDVI era ancora nascosto, confuso. Un senso. Un intimo, personale e profondo desiderio, che solo ha la forza di guidarci fuori da noi stessi, per creare nella magia un nuovo legame col mondo.",
      "Noi speriamo che questo disco possa trasformare le persone che lo ascolteranno.",
      "Con amore e gratitudine,\nRadura",
    ],
    contactLabel: "Contatti",
    socialLabel: "Social",
    newsletterLabel: "Newsletter",
    newsletterCopy:
      "Sii il primo a ricevere notizie su nuove uscite, date live e altro.",
  },
} as const satisfies Record<
  AboutLang,
  {
    paragraphs: readonly string[];
    contactLabel: string;
    socialLabel: string;
    newsletterLabel: string;
    newsletterCopy: string;
  }
>;
