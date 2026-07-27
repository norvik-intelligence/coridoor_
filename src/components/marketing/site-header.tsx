import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const navItems = [
  { href: "/buyer-objection-report", label: "Buyer Objection Report" },
  { href: "/#methodik", label: "Methodik" },
  { href: "/security", label: "Vertraulichkeit" },
  { href: "/sample-report", label: "Musterbericht" }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Hauptnavigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="text-link login-link" href="/login">
            Einloggen
          </Link>
          <Link className="button button-dark button-small" href="/register">
            Analyse anfragen <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <details className="mobile-nav">
          <summary aria-label="Navigation öffnen">
            <span />
            <span />
          </summary>
          <div className="mobile-nav-panel">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/login">Einloggen</Link>
            <Link className="button button-dark" href="/register">
              Analyse anfragen
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
