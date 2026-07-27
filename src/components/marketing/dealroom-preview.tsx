import { Check, Clock3, FileText, LockKeyhole, MessageSquareText } from "lucide-react";

const rows = [
  { icon: Check, label: "NDA", value: "Akzeptiert", state: "complete" },
  { icon: FileText, label: "Executive Interview", value: "Eingereicht", state: "complete" },
  { icon: LockKeyhole, label: "Dokumente", value: "18 / 21", state: "review" },
  { icon: MessageSquareText, label: "Offene Rückfragen", value: "2", state: "open" }
];

export function DealroomPreview() {
  return (
    <div className="dealroom-preview">
      <div className="dealroom-preview-head">
        <div>
          <p className="micro-label">Aktives Engagement</p>
          <h3>Project Northstar</h3>
        </div>
        <span className="status-pill"><i />Unterlagen in Prüfung</span>
      </div>
      <div className="dealroom-preview-grid">
        <div className="dealroom-list">
          {rows.map(({ icon: Icon, ...row }) => (
            <div className="dealroom-row" key={row.label}>
              <Icon aria-hidden="true" size={18} strokeWidth={1.6} />
              <span>{row.label}</span>
              <strong className={`state-${row.state}`}>{row.value}</strong>
            </div>
          ))}
        </div>
        <div className="delivery-card">
          <Clock3 aria-hidden="true" size={20} strokeWidth={1.5} />
          <p>Geplante Lieferung</p>
          <strong>05. August 2026</strong>
          <small>Ergebnisse werden nach manueller Qualitätskontrolle freigegeben.</small>
        </div>
      </div>
    </div>
  );
}
