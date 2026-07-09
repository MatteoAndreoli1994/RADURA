"use client";

import { gridShellClass, grid12Style } from "@/lib/grid";
import { VIEW_LINKS, type SiteView } from "@/components/ViewProvider";
import { RaduraLogo } from "@/components/RaduraLogo";
import navStyles from "@/components/Navbar.module.css";

const VERTICAL_LOGO_CLASS =
  "about-radura-logo shrink-0 text-left cursor-pointer border-0 bg-transparent p-0 not-italic transition-opacity duration-300";

export function SiteNavLink({
  isActive,
  label,
  view,
  onClick,
  light = false,
  className = "",
}: {
  isActive: boolean;
  label: string;
  view: SiteView;
  onClick: () => void;
  light?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-nav-view={view}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`about-nav-link${light ? " about-nav-link--light" : ""} cursor-pointer border-0 bg-transparent p-0 not-italic ${className}`}
    >
      {label}
    </button>
  );
}

type VerticalSiteNavProps = {
  view: SiteView;
  navDark: boolean;
  linksDark?: boolean;
  onHome: () => void;
  onNavigate: (next: SiteView) => void;
};

export function VerticalSiteNav({
  view,
  navDark,
  linksDark,
  onHome,
  onNavigate,
}: VerticalSiteNavProps) {
  const logoLight = !navDark;
  const linksLight = !(linksDark ?? navDark);

  return (
    <>
      <div
        className={`${logoLight ? navStyles.aboutNavLogoLightShell : navStyles.aboutNavLogoDarkShell} ${navStyles.aboutNavBlendShell} site-chrome-control max-md:hidden`}
      >
        <div className={`${gridShellClass} ${navStyles.aboutNavBlendInner}`}>
          <button
            type="button"
            onClick={onHome}
            className={`${VERTICAL_LOGO_CLASS}${logoLight ? " about-radura-logo--light" : ""}`}
          >
            <RaduraLogo light={logoLight} />
          </button>
        </div>
      </div>

      <div
        className={`${gridShellClass} ${navStyles.aboutNavShell} site-chrome-control fixed inset-x-0 z-50 max-md:hidden`}
      >
        <div className={navStyles.aboutNavGrid} style={grid12Style}>
          <div className={navStyles.aboutNavColumn}>
            <div className={navStyles.aboutNavLogoSpacer} aria-hidden>
              RADURA
            </div>
            <nav aria-label="Navigazione" className={navStyles.aboutNavLinks}>
              {VIEW_LINKS.map((item) => (
                <SiteNavLink
                  key={item.view}
                  isActive={view === item.view}
                  label={item.label}
                  view={item.view}
                  onClick={() => onNavigate(item.view)}
                  light={linksLight}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
