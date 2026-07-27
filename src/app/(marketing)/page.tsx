import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileLock2,
  Fingerprint,
  ShieldCheck
} from "lucide-react";
import { DealroomPreview } from "@/components/marketing/dealroom-preview";
import { InterviewPreview } from "@/components/marketing/interview-preview";
import { ReportModules } from "@/components/marketing/report-modules";
import { RiskMap } from "@/components/marketing/risk-map";

const perspectiveItems = [
  {
    index: "01",
    title: "Operational dependency",
    text: "Wo hängt das Unternehmen an einzelnen Personen, Beziehungen oder informellem Wissen?"
  },
  {
    index: "02",
    title: "Earnings credibility",
    text: "Welche Aussagen zu Ergebnisqualität, Wiederholbarkeit und Planbarkeit könnten hinterfragt werden?"
  },
  {
    index: "03",
    title: "Evidence gaps",
    text: "Welche Aussagen lassen sich aktuell nicht ausreichend durch Verträge, Daten oder Dokumentation belegen?"
  }
];

const process = [
  "Secure intake",
  "Document review",
  "Buyer-side analysis",
  "Quality control",
  "Delivery in your Deal Room"
];

const securityPoints = [
  "Individuelle Kundenkonten",
  "Private Dokumentenspeicherung",
  "Mandantenbezogene Zugriffsregeln",
  "NDA vor sensiblen Angaben",
  "Zeitlich begrenzte Downloadlinks",
  "Manuelle Ergebnisfreigabe"
];

export default function HomePage() {
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">Buyer-side transaction intelligence</p>
          <h1>
            Erkennen Sie vor dem Verkaufsprozess, wo ein Käufer{" "}
            <em>Verhandlungsdruck</em> aufbauen wird.
          </h1>
          <p className="hero-lead">
            Coridoor analysiert ausgewählte Unternehmensdaten und Dokumente aus
            der Perspektive eines kritischen Käufers. Sie erhalten eine
            priorisierte Vorschau auf Einwände, Beweislücken und mögliche
            Auswirkungen auf Kaufpreis und Deal-Struktur.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/register">
              Vertrauliche Analyse anfragen <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button button-ghost" href="/sample-report">
              Musterbericht ansehen
            </Link>
          </div>
          <div className="trust-line" aria-label="Vertrauensmerkmale">
            <span>NDA-geschützt</span>
            <span>Geschützter Dokumentenupload</span>
            <span>Feste Lieferung</span>
            <span>Keine langfristige Beratung</span>
          </div>
        </div>
        <RiskMap />
      </section>

      <section className="section shell perspective-section">
        <div className="section-heading split-heading">
          <p className="eyebrow">Die Käuferperspektive</p>
          <h2>
            Käufer bewerten nicht nur Leistung.
            <br />
            Sie bewerten <em>Beweisbarkeit.</em>
          </h2>
        </div>
        <div className="perspective-grid">
          {perspectiveItems.map((item) => (
            <article key={item.index}>
              <span>{item.index}</span>
              <div className="perspective-line" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-ink" id="methodik">
        <div className="shell">
          <div className="section-heading process-heading">
            <p className="eyebrow eyebrow-light">Fokussierter Mandantenprozess</p>
            <h2>
              Eine fokussierte Käuferperspektive.
              <br />
              <em>Innerhalb von fünf Werktagen.</em>
            </h2>
            <p>
              Keine monatelange Begleitung. Keine allgemeine Unternehmensberatung.
              Sie liefern die relevanten Informationen. Coridoor liefert eine
              strukturierte Vorschau auf Käuferargumente, Beweislücken und mögliche
              Deal-Folgen.
            </p>
          </div>
          <div className="process-line">
            {process.map((item, index) => (
              <div className="process-step" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <i />
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell deliverables-section">
        <div className="section-heading split-heading">
          <p className="eyebrow">Die Ergebnisse</p>
          <h2>Was Sie <em>erhalten</em></h2>
          <p>
            Kein generischer Score. Jeder Befund verbindet Beobachtung,
            Käuferinterpretation, mögliche Deal-Folge und den erforderlichen
            Gegenbeweis.
          </p>
        </div>
        <ReportModules />
        <div className="deliverables-list">
          {[
            "Founder Dependency Map",
            "Management Question Set",
            "Executive Risk Summary",
            "30-Day Proof Plan",
            "Finaler signierter PDF-Report"
          ].map((item) => (
            <span key={item}><Check size={15} aria-hidden="true" />{item}</span>
          ))}
        </div>
      </section>

      <section className="section shell finding-section">
        <div className="finding-meta">
          <p className="eyebrow">Illustratives Beispiel</p>
          <span>Buyer concern 04</span>
        </div>
        <article className="finding-card">
          <div className="finding-title">
            <span className="severity-tag">High</span>
            <h2>Customer concentration</h2>
            <p>42 % des Umsatzes entfallen auf zwei Kunden.</p>
          </div>
          <div className="finding-details">
            <div>
              <span>01</span>
              <p className="micro-label">Likely buyer interpretation</p>
              <p>
                Erhöhte Volatilität zukünftiger Cashflows und eingeschränkte
                Übertragbarkeit der Kundenbeziehungen.
              </p>
            </div>
            <div>
              <span>02</span>
              <p className="micro-label">Potential deal impact</p>
              <p>Earn-out, Kaufpreiseinbehalt oder reduzierte Bewertungsbasis.</p>
            </div>
            <div>
              <span>03</span>
              <p className="micro-label">Required evidence</p>
              <p>
                Vertragslaufzeiten, Kundenhistorie, Churn-Daten, Wechselkosten
                und belastbare Pipeline.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="section security-section">
        <div className="shell security-grid">
          <div className="security-copy">
            <p className="eyebrow">Vertraulichkeit</p>
            <h2>Built for sensitive <em>transaction data.</em></h2>
            <p>
              Der Mandantenprozess ist so konstruiert, dass sensible Unterlagen
              nicht öffentlich zugänglich sind und Ergebnisse erst nach manueller
              Qualitätskontrolle erscheinen.
            </p>
            <Link className="text-cta" href="/security">
              Sicherheitskonzept ansehen <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="security-panel">
            <div className="security-symbol">
              <Fingerprint aria-hidden="true" size={66} strokeWidth={0.8} />
              <ShieldCheck aria-hidden="true" size={28} strokeWidth={1.3} />
            </div>
            <div className="security-list">
              {securityPoints.map((item) => (
                <div key={item}><Check size={15} aria-hidden="true" />{item}</div>
              ))}
            </div>
            <p>
              <FileLock2 size={16} aria-hidden="true" />
              Keine Behauptung externer Zertifizierungen ohne Nachweis.
            </p>
          </div>
        </div>
      </section>

      <section className="section shell product-preview-section">
        <div className="section-heading product-preview-heading">
          <p className="eyebrow">Executive Interview</p>
          <h2>Präzise Fragen. <em>Nur wenn relevant.</em></h2>
          <p>
            Der Kunde beantwortet ein strukturiertes Unternehmensinterview.
            Folgefragen erscheinen abhängig von den vorherigen Angaben.
            Antworten werden automatisch gespeichert und können später
            fortgesetzt werden.
          </p>
        </div>
        <InterviewPreview />
      </section>

      <section className="section shell product-preview-section dealroom-section">
        <div className="section-heading product-preview-heading">
          <p className="eyebrow">Persönlicher Deal Room</p>
          <h2>Ein Mandat. <em>Ein geschützter Raum.</em></h2>
          <p>
            Alle Unterlagen, Rückfragen und finalen Deliverables stehen in einem
            geschützten Mandantenbereich bereit. Ergebnisse erscheinen
            ausschließlich nach manueller Freigabe.
          </p>
        </div>
        <DealroomPreview />
      </section>

      <section className="section shell audience-section">
        <div>
          <p className="eyebrow">Für wen Coridoor gebaut ist</p>
          <h2>Vor dem Prozess sehen, was später <em>Verhandlungsmacht</em> kostet.</h2>
        </div>
        <div className="audience-list">
          {[
            "Unternehmensverkauf prüfen",
            "Beteiligung vorbereiten",
            "Nachfolgelösung planen",
            "Käuferperspektive vor dem offiziellen Prozess verstehen",
            "Abhängigkeiten und Beweislücken frühzeitig erkennen"
          ].map((item, index) => (
            <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>
          ))}
        </div>
      </section>

      <section className="disclaimer shell">
        <p className="micro-label">Klare Abgrenzung</p>
        <p>
          Der Buyer Objection Report ersetzt keine rechtliche, steuerliche,
          finanzielle oder vollständige Due-Diligence-Prüfung, keine
          Unternehmensbewertung und keine Transaktionsberatung.
        </p>
      </section>

      <section className="final-cta">
        <div className="shell final-cta-grid">
          <div>
            <p className="eyebrow eyebrow-light">Der Stress Test vor dem Markt</p>
            <h2>
              Welche Argumente könnte ein Käufer heute gegen Ihren Deal verwenden?
            </h2>
          </div>
          <div>
            <p>
              Starten Sie mit einer vertraulichen Mandatsanfrage. Nach Prüfung
              erhalten Sie Zugang zum Executive Interview und Ihrem persönlichen
              Deal Room.
            </p>
            <div className="hero-actions">
              <Link className="button button-light" href="/register">
                Vertrauliche Analyse anfragen <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <Link className="button button-outline-light" href="/sample-report">
                Musterbericht ansehen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
