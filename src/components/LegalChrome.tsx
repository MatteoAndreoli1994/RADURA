"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";
import { DesktopLegalChrome } from "@/components/DesktopLegalChrome";
import { LegalLink } from "@/components/LegalLink";
import { RaduraLogo } from "@/components/RaduraLogo";
import { VerticalSiteNav } from "@/components/VerticalSiteNav";
import { VIEW_LINKS, type SiteView } from "@/components/ViewProvider";
import { pathFromView } from "@/lib/view-routes";
import { grid12Style, gridShellClass } from "@/lib/grid";
import navStyles from "@/components/Navbar.module.css";

const MOBILE_LOGO_CLASS = `about-radura-logo shrink-0 text-left ${navStyles.mobileSiteLogo} cursor-pointer border-0 bg-transparent p-0 not-italic transition-opacity duration-300`;

export function LegalChrome() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (view: SiteView) => {
    router.push(view === "home" ? "/" : pathFromView(view));
    setMenuOpen(false);
  };

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

  return (
    <>
      <VerticalSiteNav
        view="home"
        navDark
        onHome={() => goTo("home")}
        onNavigate={goTo}
      />
      <DesktopLegalChrome light={false} />

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
              className={MOBILE_LOGO_CLASS}
            >
              <RaduraLogo />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`${navStyles.mobileMenuToggleShell} md:hidden${
          menuOpen ? ` ${navStyles.mobileMenuToggleShellMenuOpen}` : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="legal-mobile-nav"
          className={navStyles.mobileMenuToggle}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {menuOpen ? (
        <div
          id="legal-mobile-nav"
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
                  onClick={() => goTo(item.view)}
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
                <LegalLink
                  lang="en"
                  className={navStyles.mobileMenuLegalLink}
                  onClick={() => setMenuOpen(false)}
                />
              </div>
              <div className={navStyles.mobileMenuCookiesCol}>
                <CookieSettingsLink lang="en" className={navStyles.mobileMenuLegalLink} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
