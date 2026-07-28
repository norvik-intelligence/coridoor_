import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Clock3, FileText, LockKeyhole, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Deal Room Demo",
  robots: { index: false, follow: false }
};

const steps = [
  ["Secure intake", true],
  ["Executive Interview", true],
  ["Document review", true],
  ["Buyer-side analysis", false],
  ["Delivery", false]
] as const;

export default function DemoPage() {
  return (
    <main className="workspace-page demo-workspace">
      <header className="workspace-page-header">
        <div>
          <p className="eyebrow">Read-only demonstration</p>
          <h1>Muster GmbH · Buyer Objection Report</h1>
          <p>Synthetische Beispieldaten. Keine Anmeldung, keine Uploads und keine echten Mandantendaten.</p>
        </div>
        <span className="workspace-status workspace-status-positive">Demo aktiv</span>
      </header>

      <section className="workspace-metrics">
        <article><p className="micro-label">NDA</p><strong><Check size={18} />Akzeptiert</strong><small>Illustrativer Status</small></article>
        <article><p className="micro-label">Interview</p><strong>100%</strong><div className="progress-line"><i style={{ width: "100%" }} /></div></article>
        <article><p className="micro-label">Dokumente</p><strong>18 / 22</strong><div className="progress-line"><i style={{ width: "82%" }} /></div></article>
        <article><p className="micro-label">Kritische Befunde</p><strong>4</strong><small>2 mit Deal-Term-Relevanz</small></article>
      </section>

      <section className="workspace-overview-grid">
        <article className="workspace-panel next-action-panel">
          <p className="micro-label">Executive finding 01</p>
          <FileText size={25} strokeWidth={1.4} />
          <h2>Customer concentration</h2>
          <p>42 % des Umsatzes entfallen auf zwei Kunden. Die primären Beziehungen liegen beim Gründer.</p>
          <div className="demo-finding-grid">
            <div><span>Buyer interpretation</span><strong>Cashflow-Risiko und eingeschränkte Übertragbarkeit</strong></div>
            <div><span>Potential impact</span><strong>Earn-out, Holdback oder reduzierte Bewertungsbasis</strong></div>
            <div><span>Required evidence</span><strong>Verträge, Churn-Historie, Pipeline und Zweitkontakte</strong></div>
          </div>
        </article>

        <article className="workspace-panel mandate-timeline">
          <p className="micro-label">Mandatsfortschritt</p>
          {steps.map(([label, complete]) => (
            <div className={complete ? "timeline-row complete" : "timeline-row"} key={label}>
              <i /><span>{label}</span>{complete ? <Check size={15} /> : <Clock3 size={15} />}
            </div>
          ))}
        </article>

        <article className="workspace-panel contact-panel">
          <ShieldCheck size={23} strokeWidth={1.4} />
          <p className="micro-label">Sicherheitsmodell</p>
          <h3>Geschützter Mandantenbereich</h3>
          <p>Produktiv werden Zugriffe über Supabase Auth, Row Level Security und private Storage-Buckets kontrolliert.</p>
        </article>

        <article className="workspace-panel delivery-panel">
          <p className="micro-label">Demo-Modus</p>
          <LockKeyhole size={22} strokeWidth={1.5} />
          <strong>Nur Ansicht</strong>
          <p>Formulare, Uploads, Downloads und Account-Funktionen sind in dieser öffentlichen Demo deaktiviert.</p>
        </article>
      </section>

      <div className="demo-actions">
        <Link className="button button-dark" href="/register">Eigenes Mandat anfragen <ArrowRight size={16} /></Link>
        <Link className="button button-ghost" href="/">Zur Startseite</Link>
      </div>
    </main>
  );
}
