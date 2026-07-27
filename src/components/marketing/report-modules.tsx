import { ArrowUpRight, FileCheck2, Scale, SearchCheck } from "lucide-react";

const modules = [
  {
    number: "01",
    icon: SearchCheck,
    title: "Buyer Objection Register",
    text: "Priorisierte Käuferargumente mit Risikosignal, möglicher Deal-Auswirkung und erforderlichem Gegenbeweis.",
    meta: "Objection · Evidence · Impact"
  },
  {
    number: "02",
    icon: Scale,
    title: "Deal-Term Risk Map",
    text: "Zuordnung potenzieller Risiken zu Earn-out, Holdback, Übergangsbindung, Garantien oder Bewertungsdruck.",
    meta: "Price · Terms · Structure"
  },
  {
    number: "03",
    icon: FileCheck2,
    title: "Evidence Gap Report",
    text: "Aussagen, die durch Verträge, Daten, Systeme oder dokumentierte Verantwortlichkeiten noch nicht belastbar sind.",
    meta: "Claim · Proof · Action"
  }
];

export function ReportModules() {
  return (
    <div className="report-modules">
      {modules.map(({ icon: Icon, ...module }) => (
        <article className="report-module" key={module.title}>
          <div className="module-topline">
            <span>{module.number}</span>
            <Icon aria-hidden="true" size={19} strokeWidth={1.5} />
          </div>
          <div>
            <p className="micro-label">{module.meta}</p>
            <h3>{module.title}</h3>
            <p>{module.text}</p>
          </div>
          <ArrowUpRight className="module-arrow" aria-hidden="true" size={20} />
        </article>
      ))}
    </div>
  );
}
