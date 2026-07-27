import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <main className="system-page">
      <Logo />
      <div>
        <p className="eyebrow">404 · Nicht gefunden</p>
        <h1>Diese Seite gehört zu keinem aktiven Mandat.</h1>
        <p>Prüfen Sie die Adresse oder kehren Sie zur Coridoor-Startseite zurück.</p>
        <Link className="button button-dark" href="/">Zur Startseite</Link>
      </div>
    </main>
  );
}
