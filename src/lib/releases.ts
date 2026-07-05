import type { BandcampTrack } from "@/lib/bandcamp-album";

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

export const ACQUE_TRACK_TITLES = [
  "Desiderare",
  "Angeli",
  "Tempesta",
  "Incanto pt.1",
  "Incanto pt.2",
  "Incanto pt.3",
  "Corpotrasforma",
] as const;

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

export function staticTracksForRelease(release: Release): BandcampTrack[] | null {
  if (!isAcqueRelease(release)) return null;

  return ACQUE_TRACK_TITLES.map((title, index) => ({
    id: index + 1,
    title,
    duration: 0,
  }));
}

export const RELEASES: Release[] = [
  {
    id: "2026",
    slug: "acque",
    title: "Acque",
    releaseDate: "July 10, 2026",
    cover: "/releases/2026.jpg",
    bandcampUrl: "https://radura.bandcamp.com",
    bandcampEmbedUrl: process.env.NEXT_PUBLIC_ACQUE_BANDCAMP_EMBED,
    trackCount: 7,
    credits: {
      paragraphs: [
        "Written by Radura. Additional production by Marco Caproni.",
        "Recorded from May 2025 to March 2026 by Marco Caproni at Trai Studio.",
        "Vocals recorded at Casa Medusa Studio, additional vocals recorded at Crepuscular Sound Studio.",
        "Mixed by Mario Rizzotto at Pioggiadanza Produzioni HQ. Mastered by Riccardo Pasini at Studio 73.",
        "Photographs by Giorgio Bacci.",
        "Artwork design by Francesca Papasodaro.",
        "On this record, Radura are Luca, Mario, Giacomo, Andrea.",
        "Thanks for supporting us through the years of this incredible adventure, making this record real and our music alive. Love you all.",
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
        "Guest vocals and guest words on Tutto Il Tempo Che Ho Passato A Non Vedere by Gianluca Nicastro from Øjne and Giuseppe Del Re from Chivàla.",
        "Violin on Costellazione||Pareidolia by Lucia Castiglioni.",
        "Recorded by Mario Rizzotto at Scatola Nera Studio in Milano, Italy.",
        "Drums recorded at Frequenze Studio in Monza, Italy.",
        "Mixed and Mastered by Riccardo Pasini at Studio 73 in Ravenna, Italy.",
        "Pictures by Luca Giuseppe D'Aloia.",
        "Graphic project by Alice Blu.",
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
        "Recorded, mixed and mastered by Mario Rizzotto (Pioggiadanza Produzioni) between the mid of july and the end of august 2018.",
        "Co-produced by: Callous Records, Dischi Decenti, Krampus MGMT, Non Ti Seguo Records, Vox Hole Collective.",
        "Cover art photo: Jacopo Bertoglio.",
        "Graphic design: Natty Peterkin.",
        "Booklet photo: Mauro Tiozzo.",
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
        "Album recorded by Radura with the help of Marco Bergamini for drums recordings at SAE Institute Milan, Stefano Reale for guitars recordings and Luca of Frequenze Studio for voice recordings.",
        "Mixing by Mario Rizzotto.",
        "Master by Will Killingsworth of Dead Air Studios. Selfproduced with the help of Dischi Decenti.",
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
        "Our first EP/Demo, recorded in a school without any effects, distortions, samples or triggers.",
        "Lyrics written and sung by Luca, second voice Ietto.",
        "Recorded and mixed by EMIT Feltrinelli Scholars.",
        "Mastered by Federico Ascari of Wavemotion Recordings.",
        "Artbooks and photos by Emanuele Hueller.",
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
