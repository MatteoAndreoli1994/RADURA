import { CookieSettingsLink } from "@/components/CookieSettingsLink";
import { LegalLink } from "@/components/LegalLink";
import { inter } from "@/lib/fonts";

export const SITE_SOCIAL_LINKS = [
  { label: "Youtube", href: "https://www.youtube.com/@Radura" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/raduramusic?igsh=d3F6bmh1ZGcwZGZz",
  },
  { label: "Bandcamp", href: "https://radura.bandcamp.com" },
] as const;

type SiteFooterBarProps = {
  tone?: "light" | "dark";
  className?: string;
  fontClassName?: string;
  onLinkClick?: () => void;
  copyrightOnly?: boolean;
};

export function SiteFooterBar({
  tone = "dark",
  className = "",
  fontClassName,
  onLinkClick,
  copyrightOnly = false,
}: SiteFooterBarProps) {
  const linkClass =
    tone === "dark"
      ? "text-[10px] font-normal leading-none text-black/55 transition-colors duration-200 hover:text-black"
      : "text-[8px] font-normal leading-none text-white/75 transition-colors duration-200 hover:text-white sm:text-[10px]";
  const cookieClass =
    tone === "dark"
      ? "!text-[10px] !leading-none text-black/55 transition-colors duration-200 hover:text-black"
      : "!text-[8px] !leading-none text-white/75 transition-colors duration-200 hover:text-white sm:!text-[10px]";
  const copyrightClass =
    tone === "dark"
      ? "text-center text-[10px] font-normal leading-none whitespace-nowrap text-black/45"
      : "text-center text-[8px] font-normal leading-none whitespace-nowrap text-white/55 md:text-[9px]";

  if (copyrightOnly) {
    return (
      <footer className={className}>
        <div className={`${fontClassName ?? inter.className} flex justify-center leading-none`}>
          <p className={copyrightClass}>© {new Date().getFullYear()} RADURA</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={className}>
      <div
        className={`${fontClassName ?? inter.className} grid grid-cols-[1fr_auto_1fr] items-end gap-x-2 leading-none md:gap-x-3`}
      >
        <div className="flex min-w-0 items-end justify-start gap-x-2 md:gap-x-2.5">
          <LegalLink lang="en" className={linkClass} onClick={onLinkClick} />
          <CookieSettingsLink lang="en" className={cookieClass} />
        </div>
        <p className={copyrightClass}>© {new Date().getFullYear()} RADURA</p>
        <nav className="flex min-w-0 items-end justify-end gap-x-2 md:gap-x-2.5">
          {SITE_SOCIAL_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={onLinkClick}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
