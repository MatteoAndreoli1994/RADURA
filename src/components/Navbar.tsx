"use client";

import { useEffect, useState } from "react";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { DesktopLegalChrome } from "@/components/DesktopLegalChrome";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";
import { LegalLink } from "@/components/LegalLink";
import { grid12Style, gridShellClass } from "@/lib/grid";
import { useView, VIEW_LINKS, type SiteView } from "@/components/ViewProvider";
import { SiteNavLink, VerticalSiteNav } from "@/components/VerticalSiteNav";
import navStyles from "@/components/Navbar.module.css";

const DESKTOP_LOGO_CLASS = "about-radura-logo shrink-0 text-left";

function mobileLogoButtonClass() {
  return `${DESKTOP_LOGO_CLASS} ${navStyles.mobileSiteLogo} shrink-0 cursor-pointer border-0 bg-transparent p-0 text-left not-italic transition-opacity duration-300`;
}

function desktopLogoButtonClass() {
  return `${DESKTOP_LOGO_CLASS} cursor-pointer border-0 bg-transparent p-0 not-italic transition-opacity duration-300`;
}

function MobileMenuToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="mobile-nav"
      className={navStyles.mobileMenuToggle}
    >
      {open ? "Close" : "Menu"}
    </button>
  );
}

function MobileMenu({
  view,
  onNavigate,
  onClose,
}: {
  view: SiteView;
  onNavigate: (next: SiteView) => void;
  onClose: () => void;
}) {
  return (
    <div
      id="mobile-nav"
      className={`${navStyles.mobileMenuSheet} site-chrome-control`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu di navigazione"
    >
      <div
        className={`${navStyles.mobileMenuScroll} no-scrollbar ${gridShellClass} ${navStyles.mobileSiteChrome}`}
      >
        <nav aria-label="Navigazione principale" className={navStyles.mobileMenuLinks}>
          {VIEW_LINKS.map((item) => (
            <button
              key={item.view}
              type="button"
              data-nav-view={item.view}
              onClick={() => onNavigate(item.view)}
              aria-current={view === item.view ? "page" : undefined}
              className={navStyles.mobileMenuLink}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div
        className={`${navStyles.mobileMenuFooter} ${gridShellClass} ${navStyles.mobileSiteChrome}`}
      >
        <div className={navStyles.mobileMenuFooterGrid} style={grid12Style}>
          <div className={navStyles.mobileMenuLegalCol}>
            <LegalLink lang="en" className={navStyles.mobileMenuLegalLink} onClick={onClose} />
          </div>
          <div className={navStyles.mobileMenuCookiesCol}>
            <CookieSettingsLink lang="en" className={navStyles.mobileMenuLegalLink} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const { view, goToView } = useView();
  const { closeReleaseView, viewReleaseId } = useBandcampSession();

  const onHome = view === "home";
  const [menuOpen, setMenuOpen] = useState(false);
  const useVerticalNav = onHome || view === "about" || view === "music" || view === "live" || Boolean(viewReleaseId);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMenuOpen(false);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const goTo = (next: SiteView) => {
    if (next === "music") {
      closeReleaseView();
      if (view !== "music") goToView("music");
      setMenuOpen(false);
      return;
    }
    goToView(next);
    setMenuOpen(false);
  };

  return (
    <>
      {useVerticalNav ? (
        <>
          <VerticalSiteNav
            view={view}
            navDark
            onHome={() => goTo("home")}
            onNavigate={goTo}
          />
          <DesktopLegalChrome />
        </>
      ) : (
        <>
          <div
            className={`radura-blend-chrome ${navStyles.desktopBlendLogoShell} site-chrome-control hidden md:block`}
          >
            <button
              type="button"
              onClick={() => goTo("home")}
              className={desktopLogoButtonClass()}
            >
              RADURA
            </button>
          </div>

          <nav aria-label="Navigazione" className={navStyles.siteNavDesktop}>
            {VIEW_LINKS.map((item) => (
              <SiteNavLink
                key={item.view}
                isActive={view === item.view}
                label={item.label}
                view={item.view}
                onClick={() => goTo(item.view)}
                light={false}
              />
            ))}
          </nav>
        </>
      )}

      <header
        className={`${navStyles.mobileBlendHeader} md:hidden${
          menuOpen ? ` ${navStyles.mobileBlendHeaderMenuOpen}` : ""
        }`}
      >
        <nav
          className={`${gridShellClass} ${navStyles.mobileBlendHeaderNav} ${navStyles.mobileSiteChrome} site-navbar bg-transparent transition-colors duration-300 max-md:pt-4 max-md:pb-4`}
        >
          <div className={navStyles.mobileSiteHeader}>
            <button
              type="button"
              onClick={() => goTo("home")}
              className={mobileLogoButtonClass()}
            >
              RADURA
            </button>

            <MobileMenuToggle
              open={menuOpen}
              onToggle={() => setMenuOpen((open) => !open)}
            />
          </div>
        </nav>
      </header>

      {menuOpen ? (
        <MobileMenu
          view={view}
          onNavigate={goTo}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
    </>
  );
}
