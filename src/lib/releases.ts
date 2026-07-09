export type ReleaseCredits = {
  paragraphs: string[];
};

export type Release = {
  id: string;
  slug: string;
  title: string;
  cover: string;
  releaseDate?: string;
  bandcampUrl?: string;
  bandcampEmbedUrl?: string;
  bandcampArtUrl?: string;
  credits?: ReleaseCredits;
  trackCount?: number;
};

export { ACQUE_TRACK_TITLES, staticTracksForRelease } from "@/lib/release-tracks";

export function isAcqueRelease(release: Pick<Release, "id" | "slug">) {
  return release.slug === "acque" || release.id === "2026";
}

function parseReleaseStartDate(releaseDate: string): Date | null {
  const parsed = Date.parse(releaseDate);
  if (Number.isNaN(parsed)) return null;

  const date = new Date(parsed);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isReleasePlayable(release: Release, now: Date = new Date()): boolean {
  if (!release.releaseDate) return true;

  const releaseStart = parseReleaseStartDate(release.releaseDate);
  if (!releaseStart) return true;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today >= releaseStart;
}

export const RELEASES: Release[] = [
  {
    id: "2026",
    slug: "acque",
    title: "ACQUE",
    releaseDate: "July 10, 2026",
    cover: "/releases/2026.jpg",
    bandcampUrl: "https://radura.bandcamp.com",
    bandcampEmbedUrl: process.env.NEXT_PUBLIC_ACQUE_BANDCAMP_EMBED,
    trackCount: 7,
    credits: {
      paragraphs: [
        "Written by Radura.\nAdditional production by Marco Caproni.\nCello by Matteo Bennici (Baratro).\nGuest vocals by Francesco Venturini (Franek Windy, Noverte) on DESIDERARE\nand Jacopo Lietti (Fine Before You Came, Liquami) on TEMPESTA.\nBacking vocals on INCANTO PT. I & III by Carlo Boscacci (Bosco Da Soma, Ricche le Mura).\n\nRecorded from May 2025 to March 2026 by Marco Caproni at Trai Studio,\nvocals at Casa Medusa Studio, cellos and additional vocals at Crepuscular Sound Studio.\nMixed by Mario Rizzotto (Pioggiadanza Produzioni HQ), mastered by Riccardo Pasini (Studio 73).\nPhotographs by Giorgio Bacci. Artwork design by Francesca Papasodaro.\n\nOn this record, Radura are Luca, Mario, Giacomo, Andrea.",
      ],
    },
  },
  {
    id: "apr-2021",
    slug: "effetto-della-veduta-dinsieme",
    title: "Effetto Della Veduta D'Insieme",
    releaseDate: "Apr 2021",
    cover: "/releases/apr-2021.jpg",
    bandcampUrl:
      "https://radura.bandcamp.com/album/effetto-della-veduta-dinsieme",
    bandcampEmbedUrl:
      "https://bandcamp.com/EmbeddedPlayer/v=2/album=328474196/size=large/bgcol=ffffff/linkcol=000000/tracklist=true/transparent=true/",
    bandcampArtUrl: "https://f4.bcbits.com/img/a3928197401_10.jpg",
    trackCount: 9,
    credits: {
      paragraphs: [
        "All songs written and performed by Radura.",
        "Guest vocals and guest words on Tutto Il Tempo Che Ho Passato A Non Vedere\nby Gianluca Nicastro from Øjne and Giuseppe Del Re from Chivàla.",
        "Violin on Costellazione||Pareidolia by Lucia Castiglioni.\nRecorded by Mario Rizzotto at Scatola Nera Studio in Milano, Italy.\nDrums recorded at Frequenze Studio in Monza, Italy.\nMixed and Mastered by Riccardo Pasini at Studio 73 in Ravenna, Italy.\nPictures by Luca Giuseppe D'Aloia.\nGraphic project by Alice Blu.",
      ],
    },
  },
  {
    id: "2018",
    slug: "split-w-flowers-shelters",
    title: "split w/ flowers&shelters",
    releaseDate: "2018",
    cover: "/releases/2018.avif",
    bandcampUrl:
      "https://radura.bandcamp.com/album/split-w-flowers-shelters",
    bandcampEmbedUrl:
      "https://bandcamp.com/EmbeddedPlayer/v=2/album=3089533935/size=large/bgcol=ffffff/linkcol=000000/tracklist=true/transparent=true/",
    bandcampArtUrl: "https://f4.bcbits.com/img/a1744781013_10.jpg",
    trackCount: 2,
    credits: {
      paragraphs: [
        "Recorded, mixed and mastered by Mario Rizzotto (Pioggiadanza Produzioni)\nbetween the mid of july and the end of august 2018.",
        "Co-produced by: Callous Records, Dischi Decenti, Krampus MGMT,\nNon Ti Seguo Records, Vox Hole Collective.",
        "\nCover art photo: Jacopo Bertoglio.\nGraphic design: Natty Peterkin.\nBooklet photo: Mauro Tiozzo.",
      ],
    },
  },
  {
    id: "2017",
    slug: "la-fine-degli-uomini-faro",
    title: "La Fine degli Uomini Faro",
    releaseDate: "2017",
    cover: "/releases/2017.avif",
    bandcampUrl:
      "https://radura.bandcamp.com/album/la-fine-degli-uomini-faro",
    bandcampEmbedUrl:
      "https://bandcamp.com/EmbeddedPlayer/v=2/album=463397580/size=large/bgcol=ffffff/linkcol=000000/tracklist=true/transparent=true/",
    bandcampArtUrl: "https://f4.bcbits.com/img/a1110408283_10.jpg",
    trackCount: 6,
    credits: {
      paragraphs: [
        "Artwork by Novilunium Eyes.",
        "Album recorded by Radura with the help of Marco Bergamini for drums\nrecordings at SAE Institute Milan, Stefano Reale for guitars recordings\nand Luca of Frequenze Studio for voice recordings.",
        "Mixing by Mario Rizzotto.",
        "Master by Will Killingsworth of Dead Air Studios.\nSelfproduced with the help of Dischi Decenti.",
      ],
    },
  },
  {
    id: "2016",
    slug: "radura-ep",
    title: "Radura EP",
    releaseDate: "May 2016",
    cover: "https://f4.bcbits.com/img/a3318757463_10.jpg",
    bandcampUrl: "https://radura.bandcamp.com/album/radura-ep",
    bandcampEmbedUrl:
      "https://bandcamp.com/EmbeddedPlayer/v=2/album=3385498664/size=large/bgcol=ffffff/linkcol=000000/tracklist=true/transparent=true/",
    bandcampArtUrl: "https://f4.bcbits.com/img/a3318757463_10.jpg",
    trackCount: 4,
    credits: {
      paragraphs: [
        "Our first EP/Demo, recorded in a school without any effects, distortions, samples or triggers.\nLyrics written and sung by Luca, second voice Ietto.\nRecorded and mixed by EMIT Feltrinelli Scholars.\nMastered by Federico Ascari of Wavemotion Recordings.\n\nArtbooks and photos by Emanuele Hueller.",
      ],
    },
  },
];

export const ACQUE_RELEASE = RELEASES[0];

export const TEMPESTA_RELEASE: Release = {
  id: "tempesta",
  slug: "tempesta",
  title: "TEMPESTA",
  cover: "/releases/Tempesta.jpg",
  bandcampUrl: "https://radura.bandcamp.com/track/tempesta",
  bandcampEmbedUrl:
    "https://bandcamp.com/EmbeddedPlayer/v=2/track=2165949148/size=large/bgcol=ffffff/linkcol=000000/tracklist=false/artwork=none/transparent=true/",
};
