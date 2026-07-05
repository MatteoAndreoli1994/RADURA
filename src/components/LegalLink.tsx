import Link from "next/link";
import { LEGAL_LINK_LABEL, type LegalLang } from "@/lib/legal-copy";

type LegalLinkProps = {
  lang?: LegalLang;
  className?: string;
  onClick?: () => void;
};

export function LegalLink({ lang = "en", className = "", onClick }: LegalLinkProps) {
  return (
    <Link href="/legal" onClick={onClick} className={`transition-colors hover:opacity-70 ${className}`}>
      {LEGAL_LINK_LABEL[lang]}
    </Link>
  );
}
