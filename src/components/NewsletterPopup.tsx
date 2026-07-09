"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { NewsletterForm } from "@/components/NewsletterForm";
import { inter } from "@/lib/fonts";

type NewsletterPopupContextValue = {
  open: () => void;
};

const NewsletterPopupContext = createContext<NewsletterPopupContextValue | null>(
  null,
);

function useNewsletterPopupContext() {
  return useContext(NewsletterPopupContext);
}

export function NewsletterPopupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isOpen]);

  return (
    <NewsletterPopupContext.Provider value={{ open }}>
      {children}
      {mounted && isOpen
        ? createPortal(
            <div
              className="pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center p-5"
              role="dialog"
              aria-modal="true"
              aria-labelledby="newsletter-popup-title"
            >
              <button
                type="button"
                aria-label="Close newsletter"
                className="absolute inset-0 cursor-default border-0 bg-black/35 backdrop-blur-[2px]"
                onClick={close}
              />
              <div
                className={`${inter.className} relative z-10 w-full max-w-[min(100%,20rem)] bg-background px-6 py-7 shadow-[0_12px_40px_rgba(0,0,0,0.12)]`}
              >
                <button
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  className="absolute top-3 right-3 cursor-pointer border-0 bg-transparent p-1 text-[18px] leading-none text-black/35 transition-colors hover:text-black/70"
                >
                  ×
                </button>
                <h2
                  id="newsletter-popup-title"
                  className="sr-only"
                >
                  Newsletter
                </h2>
                <div className="mx-auto w-full max-w-[220px]">
                  <NewsletterForm variant="popup" />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </NewsletterPopupContext.Provider>
  );
}

type NewsletterLinkProps = {
  className?: string;
  onClick?: () => void;
};

export function NewsletterLink({ className = "", onClick }: NewsletterLinkProps) {
  const context = useNewsletterPopupContext();

  function handleClick() {
    context?.open();
    onClick?.();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`cursor-pointer border-0 bg-transparent p-0 transition-colors hover:opacity-70 ${className}`}
    >
      Newsletter
    </button>
  );
}
