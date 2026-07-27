const riskBlocks = [
  {
    className: "risk-block risk-lime",
    score: "HIGH",
    label: "Founder Dependency",
    detail: "Transferability"
  },
  {
    className: "risk-block risk-pink",
    score: "42%",
    label: "Customer Concentration",
    detail: "Top 2 customers"
  },
  {
    className: "risk-block risk-violet",
    score: "MED",
    label: "Earnings Credibility",
    detail: "Adjustments"
  },
  {
    className: "risk-block risk-yellow",
    score: "06",
    label: "Evidence Gaps",
    detail: "Documents"
  }
];

export function RiskMap() {
  return (
    <div className="risk-map" aria-label="Illustrative Buyer-Pressure-Visualisierung">
      <div className="risk-map-topline">
        <span>Illustrative risk surface</span>
        <span>Pre-process review</span>
      </div>
      <div className="risk-map-grid">
        <div className="risk-metric">
          <span className="risk-metric-value">12</span>
          <span>Critical buyer objections</span>
          <small>Illustratives Beispiel</small>
        </div>
        <div className="risk-blocks">
          {riskBlocks.map((block) => (
            <div className={block.className} key={block.label}>
              <span className="risk-score">{block.score}</span>
              <strong>{block.label}</strong>
              <small>{block.detail}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="risk-legend">
        <span><i className="dot dot-navy" />Buyer pressure</span>
        <span><i className="dot dot-coral" />Evidence required</span>
        <span><i className="dot dot-blue" />Controllable</span>
      </div>
    </div>
  );
}
