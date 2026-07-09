export const HOME_COVER = "/images/copertina.jpg";

export const HOME_PHOTOS = [
  "/images/fotoRadura/1.jpg",
  "/images/fotoRadura/new4.jpg",
  "/images/fotoRadura/2.jpg",
  "/images/fotoRadura/3.jpg",
  "/images/fotoRadura/4.jpg",
  "/images/fotoRadura/5.jpg",
  "/images/fotoRadura/6.jpg",
  "/images/fotoRadura/7.jpg",
  "/images/fotoRadura/10.webp",
  "/images/fotoRadura/11.webp",
  "/images/fotoRadura/12.webp",
  "/images/fotoRadura/new1.jpg",
  "/images/fotoRadura/new2.jpg",
  "/images/fotoRadura/new3.jpg",
  "/images/fotoRadura/20.jpg",
  "/images/fotoRadura/21.jpg",
  "/images/fotoRadura/31.jpg",
  "/images/fotoRadura/23.jpg",
  "/images/fotoRadura/40.jpg",
  "/images/fotoRadura/30.jpg",
  "/images/fotoRadura/41.jpg",
  "/images/live7.webp",
  "/images/live5.png",
] as const;

export type HomePhotoSrc = (typeof HOME_PHOTOS)[number];

export type HomePhotoDesktopLayout = {
  span: "full" | "half";
  orientation: "landscape" | "portrait";
};

const DESKTOP_PHOTO_LAYOUTS: HomePhotoDesktopLayout[] = [
  { span: "full", orientation: "landscape" },
  { span: "half", orientation: "portrait" },
  { span: "half", orientation: "landscape" },
  { span: "half", orientation: "landscape" },
  { span: "half", orientation: "portrait" },
  { span: "full", orientation: "portrait" },
  { span: "half", orientation: "portrait" },
  { span: "half", orientation: "portrait" },
  { span: "full", orientation: "landscape" },
  { span: "half", orientation: "landscape" },
  { span: "half", orientation: "portrait" },
  { span: "half", orientation: "landscape" },
  { span: "half", orientation: "landscape" },
  { span: "half", orientation: "portrait" },
  { span: "full", orientation: "landscape" },
];

export function getHomePhotoDesktopLayout(photoIndex: number): HomePhotoDesktopLayout {
  return DESKTOP_PHOTO_LAYOUTS[photoIndex % DESKTOP_PHOTO_LAYOUTS.length];
}

export const HOME_PHOTO_OBJECT_POSITION: Partial<Record<HomePhotoSrc, string>> = {
  "/images/fotoRadura/12.webp": "right center",
  "/images/fotoRadura/41.jpg": "left center",
};

export function getHomePhotoObjectPosition(src: HomePhotoSrc): string | undefined {
  return HOME_PHOTO_OBJECT_POSITION[src];
}
