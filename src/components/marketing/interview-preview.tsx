const sections = [
  ["Unternehmensprofil", "Vollständig"],
  ["Ergebnisqualität", "In Bearbeitung"],
  ["Kundenstruktur", "Offen"],
  ["Founder Dependency", "Offen"]
];

export function InterviewPreview() {
  return (
    <div className="interview-preview">
      <div className="preview-window-bar">
        <span />
        <span />
        <span />
        <small>Executive Interview</small>
      </div>
      <div className="interview-preview-body">
        <aside>
          <p className="micro-label">Fortschritt</p>
          <strong>38%</strong>
          <div className="progress-line"><i style={{ width: "38%" }} /></div>
          <nav aria-label="Beispielhafte Interviewabschnitte">
            {sections.map(([title, status], index) => (
              <div className={index === 1 ? "preview-section active" : "preview-section"} key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{title}<small>{status}</small></p>
              </div>
            ))}
          </nav>
        </aside>
        <div className="preview-form">
          <p className="micro-label">05 · Kundenstruktur</p>
          <h3>Wie konzentriert ist Ihr Kundenportfolio?</h3>
          <p>
            Geben Sie den Umsatzanteil des größten Kunden an. Ab 20 % folgen
            gezielte Fragen zu Bindung und Übertragbarkeit.
          </p>
          <label>
            Umsatzanteil größter Kunde
            <span className="preview-input">24 <i>%</i></span>
          </label>
          <div className="preview-note">
            <span>Adaptive Folgefrage aktiviert</span>
            <small>Zuletzt automatisch gespeichert · gerade eben</small>
          </div>
        </div>
      </div>
    </div>
  );
}
