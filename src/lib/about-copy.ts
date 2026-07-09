export type AboutLang = "en" | "it";

export const ABOUT_COPY = {
  en: {
    paragraphs: [
      "Music has the power to transform.",
      "Our path together started in 2015. Every screamed word and every single person we met along our journey has been fundamental. We are an independent band and this means that we exist within the relationships we build with our community, which is wide and free. By feeling intensely we always search for the sincerity of every sensation. Within the energy that forms on stage a spark curves its ways into transformation. Thanks to this, we have been able to grow together and it has been wonderful.",
      "Our new album ACQUE is a vision of love. An invitation to dive into the world, where all things are moved by a spirit. To follow the internal star and to gaze within yourself, but finding what in EDVI was still hidden and blurred. A meaning. An intimate, personal and profound desire that has the strength to guide us back outside from ourselves, to create within magic a new connection with the world.",
      "We really hope that this album will be able to transform all people who will listen to it.",
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
      "Il nostro sentiero inizia nel 2015. Ogni parola urlata, ogni persona incontrata è stata fondamentale. Siamo una band indipendente, ovvero esistiamo nei legami che creiamo con la nostra comunità, che è grande e libera. Attraverso l'intensità cerchiamo la sincerità di ogni sensazione. Nell'energia che si crea sul palco comincia la scintilla della trasformazione. Così siamo cresciuti assieme ed è stato meraviglioso.",
      "Il nostro nuovo disco ACQUE è una visione d'amore. Un invito a immergersi nel mondo, dove ogni cosa è mossa da uno spirito. A seguire la stella interiore, guardando dentro se stessi, ma trovando quello che in EDVI era ancora nascosto, confuso. Un senso. Un intimo, personale e profondo desiderio, che ha la forza di guidarci fuori da noi stessi, per creare nella magia un nuovo legame col mondo.",
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
