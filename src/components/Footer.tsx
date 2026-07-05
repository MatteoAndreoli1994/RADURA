import { NewsletterForm } from "@/components/NewsletterForm";
import { LegalLink } from "@/components/LegalLink";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";
import { gridShellClass } from "@/lib/grid";

function Copyright({ className = "" }: { className?: string }) {
  return (
    <p
      className={`whitespace-nowrap text-[11px] leading-[13px] tracking-[0.06em] text-black/45 ${className}`}
    >
      <span className="inline-flex items-center gap-[0.25em]">
        <span className="relative top-[0.04em]">©</span>
        <span>All rights reserved</span>
      </span>
    </p>
  );
}

export function Footer() {
  return (
    <footer className="site-desktop-footer-inner bg-background pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] pt-3">
      <div className={gridShellClass}>
        <p className="mb-0 text-[11px] leading-[13px] tracking-[0.06em] text-black/80 md:mb-1.5 md:text-site md:leading-site">
          Newsletter
        </p>

        <div className="flex flex-row items-end justify-between gap-2 sm:gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-end md:gap-x-10">
          <div className="min-w-0 flex-1 md:col-start-1 md:max-w-[168px] md:flex-none">
            <NewsletterForm variant="footer" hideLabel />
          </div>

          <div className="shrink-0 pb-0 md:col-start-2 md:justify-self-center">
            <Copyright />
            <div className="mt-1 flex items-center gap-x-2 md:hidden">
              <LegalLink className="text-[10px] leading-[12px] tracking-[0.06em] text-black/45" />
              <CookieSettingsLink className="text-[10px] leading-[12px] tracking-[0.06em] text-black/45" />
            </div>
          </div>

          <div className="hidden items-center gap-x-2 md:col-start-3 md:flex md:justify-end md:pb-0">
            <LegalLink className="text-[11px] leading-[13px] tracking-[0.06em] text-black/45" />
            <CookieSettingsLink className="text-[11px] leading-[13px] tracking-[0.06em] text-black/45" />
          </div>
        </div>
      </div>
    </footer>
  );
}
