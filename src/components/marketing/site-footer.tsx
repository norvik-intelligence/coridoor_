import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            Buyer-side Transaction Intelligence für inhabergeführte Unternehmen vor
            einem möglichen Transaktionsprozess.
          </p>
        </div>
        <div>
          <p className="footer-label">Produkt</p>
          <Link href="/buyer-objection-report">Buyer Objection Report</Link>
          <Link href="/#methodik">Methodik</Link>
          <Link href="/sample-report">Musterbericht</Link>
          <Link href="/security">Vertraulichkeit</Link>
        </div>
        <div>
          <p className="footer-label">Zugang</p>
          <Link href="/login">Login</Link>
          <Link href="/register">Analyse anfragen</Link>
          <Link href="/nda">NDA</Link>
        </div>
        <div>
          <p className="footer-label">Rechtliches</p>
          <Link href="/privacy">Datenschutz</Link>
          <Link href="/imprint">Impressum</Link>
          <a href="mailto:contact@coridoor.de">Kontakt</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Coridoor</span>
        <span>Vertraulich. Präzise. Käuferorientiert.</span>
      </div>
    </footer>
  );
}
