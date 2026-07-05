import { CookieSettingsLink } from "@/components/CookieSettingsLink";
import { LegalLink } from "@/components/LegalLink";
import { SITE_SOCIAL_LINKS } from "@/components/SiteFooterBar";

export const mobileStackedFooterShellClass = "mobile-stacked-footer-shell";

export const mobileStackedFooterScrollClass =
  `${mobileStackedFooterShellClass} mobile-stacked-footer-scroll`;

const linkClass =
  "text-[9px] font-normal uppercase leading-none tracking-[0.04em] transition-colors duration-200";

const copyrightClass =
  "m-0 text-[9px] font-normal uppercase leading-none tracking-[0.04em] whitespace-nowrap";

type MobileStackedFooterProps = {
  tone?: "light" | "dark";
  onLinkClick?: () => void;
  showLegalLinks?: boolean;
};

export function MobileStackedFooter({
  tone = "dark",
  onLinkClick,
  showLegalLinks = false,
}: MobileStackedFooterProps) {
  const linkToneClass =
    tone === "dark"
      ? "text-black/55 hover:text-black"
      : "text-white/75 hover:text-white";
  const copyrightToneClass = tone === "dark" ? "text-black/45" : "text-white/55";

  return (
    <footer>
      <div className="flex flex-col gap-[var(--mobile-stacked-footer-row-gap,1.5rem)] leading-none">
        {showLegalLinks ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <LegalLink
              lang="en"
              className={`${linkClass} ${linkToneClass}`}
              onClick={onLinkClick}
            />
            <CookieSettingsLink lang="en" className={`${linkClass} ${linkToneClass}`} />
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <p className={`${copyrightClass} ${copyrightToneClass}`}>
            © {new Date().getFullYear()} RADURA
          </p>
          <nav className="flex items-center gap-5">
            {SITE_SOCIAL_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={onLinkClick}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} ${linkToneClass}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
