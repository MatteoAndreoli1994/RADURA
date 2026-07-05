import { DM_Sans, EB_Garamond, Inconsolata, Inter } from "next/font/google";
import localFont from "next/font/local";

export const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-eb-garamond",
  display: "swap",
});

export const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inconsolata",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const sneakyTimes = localFont({
  src: "../../public/fonts/Sneaky-Times.otf",
  variable: "--font-sneaky-times",
  display: "swap",
});
