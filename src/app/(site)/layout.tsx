import { FullSite } from "@/components/FullSite";
import { NewsletterShell } from "@/components/NewsletterShell";
import { getSiteMode } from "@/lib/site-mode";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mode = await getSiteMode();

  if (mode === "newsletter") {
    return <NewsletterShell />;
  }

  return (
    <>
      <FullSite />
      {children}
    </>
  );
}
