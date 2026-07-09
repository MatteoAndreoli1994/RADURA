import {
  SiteFooterBar,
  SITE_SOCIAL_LINKS,
} from "@/components/SiteFooterBar";

export { SITE_SOCIAL_LINKS };

export const siteCompactFooterShellClass =
  "bg-transparent pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] pt-2";

/** Inline at scroll end (album, about): same bottom shell as menu, extra air above links */
export const siteCompactFooterScrollClass =
  `site-compact-footer-scroll mt-16 ${siteCompactFooterShellClass}`;

type SiteCompactFooterProps = {
  tone?: "light" | "dark";
  className?: string;
  fontClassName?: string;
  onLinkClick?: () => void;
  copyrightOnly?: boolean;
};

export function SiteCompactFooter({
  tone = "dark",
  className = "",
  fontClassName,
  onLinkClick,
  copyrightOnly = false,
}: SiteCompactFooterProps) {
  return (
    <SiteFooterBar
      tone={tone}
      className={`bg-transparent ${className}`}
      fontClassName={fontClassName}
      onLinkClick={onLinkClick}
      copyrightOnly={copyrightOnly}
    />
  );
}
