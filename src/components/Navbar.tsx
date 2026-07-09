"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useBandcampSession } from "@/components/BandcampSessionProvider";
import { DesktopLegalChrome } from "@/components/DesktopLegalChrome";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";
import { LegalLink } from "@/components/LegalLink";
import { grid12Style, gridShellClass } from "@/lib/grid";
import { useView, VIEW_LINKS, type SiteView } from "@/components/ViewProvider";
import { SiteNavLink, VerticalSiteNav } from "@/components/VerticalSiteNav";
import { RaduraLogo } from "@/components/RaduraLogo";
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
  const [homeOnCover, setHomeOnCover] = useState(true);
  const [linksOnCover, setLinksOnCover] = useState(true);
  const [mobileOnCover, setMobileOnCover] = useState(true);
  const useVerticalNav = onHome || view === "about" || view === "music" || view === "live" || Boolean(viewReleaseId);

  useLayoutEffect(() => {
    if (!onHome) {
      setHomeOnCover(false);
      setLinksOnCover(false);
      setMobileOnCover(false);
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | null = null;
    let rafId: number | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 120; // ~2s @60fps: enough for layout/image settle.

    const attachToHome = () => {
      if (cancelled) return;
      const scrollEl = document.getElementById("home");
      const coverEl = scrollEl?.querySelector("[data-home-cover]");
      // Wait until both the scroll container and the cover exist, otherwise
      // coverHeight is 0 and the navbar can get stuck in the "white" state.
      if (!scrollEl || !(coverEl instanceof HTMLElement)) {
        rafId = requestAnimationFrame(attachToHome);
        return;
      }

      // Also wait until the cover has a measurable height; on some transitions
      // (album -> home), the element can exist but still be 0px tall.
      if (coverEl.offsetHeight === 0 && attempts < MAX_ATTEMPTS) {
        attempts += 1;
        rafId = requestAnimationFrame(attachToHome);
        return;
      }

      const update = () => {
        const cover = scrollEl.querySelector("[data-home-cover]");
        const coverHeight = cover instanceof HTMLElement ? cover.offsetHeight : 0;
        const scrollTop = scrollEl.scrollTop;
        const logoWhiteUntil = coverHeight === 0 ? 0 : Math.min(coverHeight * 0.12, 80);
        setHomeOnCover(coverHeight === 0 || scrollTop < logoWhiteUntil);
        const linksWhiteUntil =
          coverHeight === 0 ? 0 : Math.max(0, coverHeight - scrollEl.clientHeight / 2);
        setLinksOnCover(coverHeight === 0 || scrollTop < linksWhiteUntil);
        // Mobile: switch to negative when ~80% of the first viewport is scrolled.
        const mobileWhiteUntil =
          coverHeight === 0 ? 0 : Math.min(coverHeight, scrollEl.clientHeight * 0.95);
        setMobileOnCover(coverHeight === 0 || scrollTop < mobileWhiteUntil);
      };

      update();
      scrollEl.addEventListener("scroll", update, { passive: true });

      const resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(scrollEl);
      resizeObserver.observe(coverEl);

      cleanup = () => {
        scrollEl.removeEventListener("scroll", update);
        resizeObserver.disconnect();
      };
    };

    attachToHome();

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, [onHome, viewReleaseId]);

  const navDark = onHome ? !homeOnCover : true;
  const linksDark = onHome ? !linksOnCover : true;

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

  const goHomeWithCoverReset = () => {
    goToView("home");
    // Delay a bit to ensure HomeHeroGallery has mounted and attached its
    // listener (we listen in layout phase, but some transitions remount late).
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("radura:home-scroll-reset"));
    }, 0);
    setMenuOpen(false);
  };

  const goTo = (next: SiteView) => {
    if (next === "home") {
      goHomeWithCoverReset();
      return;
    }
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
            navDark={navDark}
            linksDark={linksDark}
            onHome={goHomeWithCoverReset}
            onNavigate={goTo}
          />
          <DesktopLegalChrome light={!navDark} />
        </>
      ) : (
        <>
          <div
            className={`${navStyles.desktopBlendLogoShell} site-chrome-control hidden md:block`}
          >
            <button
              type="button"
              onClick={() => goTo("home")}
              className={desktopLogoButtonClass()}
            >
              <RaduraLogo />
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
        }${onHome && mobileOnCover && !menuOpen ? ` ${navStyles.mobileBlendHeaderCover}` : ""}`}
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
              <RaduraLogo light={onHome && mobileOnCover && !menuOpen} />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`${navStyles.mobileMenuToggleShell} md:hidden${
          menuOpen ? ` ${navStyles.mobileMenuToggleShellMenuOpen}` : ""
        }${onHome && mobileOnCover && !menuOpen ? ` ${navStyles.mobileMenuToggleShellCover}` : ""}`}
      >
        <MobileMenuToggle
          open={menuOpen}
          onToggle={() => setMenuOpen((open) => !open)}
        />
      </div>

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
