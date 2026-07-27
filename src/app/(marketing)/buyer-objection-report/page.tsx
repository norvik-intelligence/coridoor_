import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { ContentHero, ContentSection } from "@/components/marketing/content-page";
import { ReportModules } from "@/components/marketing/report-modules";

export const metadata: Metadata = {
  title: "Buyer Objection Report",
  description:
    "Priorisierte Vorschau auf Käuferargumente, Beweislücken und mögliche Auswirkungen auf Kaufpreis und Deal-Struktur.",
  alternates: { canonical: "/buyer-objection-report" }
};

export default function BuyerObjectionReportPage() {
  return (
    <>
      <ContentHero
        eyebrow="Coridoor Buyer Objection Report"
        title={<>Die Käuferperspektive, <em>bevor sie teuer wird.</em></>}
        intro="Ein fokussierter Stress Test für inhabergeführte Unternehmen vor einem möglichen Verkaufs-, Beteiligungs- oder Nachfolgeprozess."
      />
      <ContentSection index="01" title="Was analysiert wird">
        <p>
          Coridoor prüft ausgewählte Angaben und Dokumente aus Sicht eines
          skeptischen Erwerbers. Im Mittelpunkt steht nicht, ob das Unternehmen
          attraktiv ist, sondern wo Aussagen angreifbar, Abhängigkeiten
          übertragungsrelevant oder Nachweise unvollständig sind.
        </p>
        <div className="content-list-grid">
          {[
            "Ergebnisqualität und Bereinigungen",
            "Kunden- und Lieferantenkonzentration",
            "Founder- und Schlüsselpersonenabhängigkeit",
            "Vertragslage und Umsatzwiederholung",
            "Datenqualität und Management Reporting",
            "Beweisbarkeit zentraler Equity-Story-Aussagen"
          ].map((item) => (
            <div key={item}><Check size={15} aria-hidden="true" />{item}</div>
          ))}
        </div>
      </ContentSection>
      <section className="section shell">
        <p className="eyebrow">Strukturierte Deliverables</p>
        <ReportModules />
      </section>
      <ContentSection index="02" title="Ablauf und Lieferung">
        <p>
          Nach Annahme des Mandats erhalten Sie Zugang zum Executive Interview
          und zu Ihrem persönlichen Deal Room. Dort akzeptieren Sie die
          Verschwiegenheitsvereinbarung, beantworten die relevanten Fragen und
          laden ausgewählte Unterlagen direkt in den privaten Dokumentenspeicher.
        </p>
        <ol className="numbered-process">
          <li><span>01</span><strong>Secure intake</strong><p>Mandatsprofil, NDA und Rollenprüfung.</p></li>
          <li><span>02</span><strong>Structured review</strong><p>Interview, Unterlagen und gezielte Rückfragen.</p></li>
          <li><span>03</span><strong>Buyer-side analysis</strong><p>Priorisierung nach Käuferdruck und Deal-Auswirkung.</p></li>
          <li><span>04</span><strong>Quality control</strong><p>Manuelle Prüfung vor jeder Veröffentlichung.</p></li>
          <li><span>05</span><strong>Deal Room delivery</strong><p>Freigegebene Module und finaler PDF-Report.</p></li>
        </ol>
      </ContentSection>
      <ContentSection index="03" title="Klare Abgrenzung">
        <p>
          Der Buyer Objection Report ist eine strukturierte Vorbereitungshilfe.
          Er ersetzt keine Due Diligence, Unternehmensbewertung, Rechts- oder
          Steuerberatung und kein M&A-Mandat. Coridoor gibt keine
          Abschlusswahrscheinlichkeit und keinen Kaufpreis vor.
        </p>
        <Link className="button button-dark" href="/register">
          Mandatsanfrage starten <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </ContentSection>
    </>
  );
}
