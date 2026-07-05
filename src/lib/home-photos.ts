export const HOME_PHOTOS = [
  "/images/fotoRadura/1.jpg",
  "/images/fotoRadura/new4.jpg",
  "/images/fotoRadura/2.jpg",
  "/images/fotoRadura/3.jpg",
  "/images/fotoRadura/4.jpg",
  "/images/fotoRadura/5.jpg",
  "/images/fotoRadura/6.jpg",
  "/images/fotoRadura/7.jpg",
  "/images/fotoRadura/8.jpg",
  "/images/fotoRadura/9.webp",
  "/images/fotoRadura/10.webp",
  "/images/fotoRadura/11.webp",
  "/images/fotoRadura/12.webp",
  "/images/fotoRadura/new1.jpg",
  "/images/fotoRadura/new2.jpg",
  "/images/fotoRadura/new3.jpg",
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
};

export function getHomePhotoObjectPosition(src: HomePhotoSrc): string | undefined {
  return HOME_PHOTO_OBJECT_POSITION[src];
}
