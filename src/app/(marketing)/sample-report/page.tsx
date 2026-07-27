import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContentHero } from "@/components/marketing/content-page";

export const metadata: Metadata = {
  title: "Illustrativer Musterbericht",
  description:
    "Beispielhafte Struktur eines Coridoor Buyer Objection Reports – ausschließlich mit illustrativen Daten.",
  alternates: { canonical: "/sample-report" }
};

const objections = [
  {
    number: "04",
    severity: "High",
    title: "Customer concentration",
    observation: "42 % des Umsatzes entfallen auf zwei Kunden.",
    interpretation:
      "Zukünftige Cashflows erscheinen volatil; persönliche Beziehungen könnten die Übertragbarkeit begrenzen.",
    impact: "Earn-out, Holdback oder reduzierte Bewertungsbasis.",
    evidence: "Laufzeiten, Kündigungsrechte, Churn-Historie, Wechselkosten und belastbare Pipeline."
  },
  {
    number: "07",
    severity: "Medium",
    title: "Founder-led pricing",
    observation: "Preisfreigaben oberhalb eines Schwellenwerts liegen ausschließlich beim Inhaber.",
    interpretation:
      "Die Marge könnte nach Übergabe ohne dokumentierte Governance oder Delegation unter Druck geraten.",
    impact: "Verlängerte Übergangsbindung und Management Retention.",
    evidence: "Preismatrix, Delegationsregeln, Win/Loss-Daten und dokumentierte Ausnahmen."
  }
];

export default function SampleReportPage() {
  return (
    <>
      <ContentHero
        eyebrow="Illustrativer Musterbericht"
        title={<>So wird aus einem Risiko eine <em>belastbare Gegenposition.</em></>}
        intro="Alle Werte, Unternehmen und Befunde auf dieser Seite sind ausschließlich illustrativ. Sie stammen nicht aus einem Kundenmandat."
        action={false}
      />
      <section className="sample-report shell">
        <div className="sample-summary">
          <p className="micro-label">Executive summary · illustrative data</p>
          <h2>Mehrere gute Argumente. Drei davon noch nicht belegbar.</h2>
          <p>
            Die Equity Story ist operativ plausibel, verliert jedoch an
            Verhandlungskraft, solange Kundenbindung, Ergebnisbereinigungen und
            Vertriebsübertragbarkeit nicht dokumentiert sind.
          </p>
          <div className="summary-strip">
            <div><strong>12</strong><span>Buyer objections</span></div>
            <div><strong>04</strong><span>Critical evidence gaps</span></div>
            <div><strong>03</strong><span>Deal-term exposures</span></div>
          </div>
        </div>
        {objections.map((objection) => (
          <article className="sample-objection" key={objection.number}>
            <header>
              <div><span>Buyer concern {objection.number}</span><strong>{objection.severity}</strong></div>
              <h3>{objection.title}</h3>
              <p>{objection.observation}</p>
            </header>
            <div className="sample-objection-grid">
              <div><span>Interpretation</span><p>{objection.interpretation}</p></div>
              <div><span>Potential deal impact</span><p>{objection.impact}</p></div>
              <div><span>Required evidence</span><p>{objection.evidence}</p></div>
            </div>
          </article>
        ))}
        <div className="sample-actions">
          <div>
            <p className="micro-label">30-Day Proof Plan</p>
            <h2>Beweise priorisieren, bevor der Datenraum geöffnet wird.</h2>
          </div>
          <Link className="button button-dark" href="/register">
            Eigene Analyse anfragen <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
