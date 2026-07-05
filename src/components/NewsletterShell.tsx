import { NewsletterPopupProvider } from "@/components/NewsletterPopup";
import { NewsletterPreview } from "@/components/NewsletterPreview";

const NEWSLETTER_BG_IMAGE = "/images/fotoRadura/new1.jpg";

export function NewsletterShell() {
  return (
    <>
      <link
        rel="preload"
        href={NEWSLETTER_BG_IMAGE}
        as="image"
        fetchPriority="high"
      />
      <NewsletterPopupProvider>
        <NewsletterPreview />
      </NewsletterPopupProvider>
    </>
  );
}
