import { ImageResponse } from "next/og";

export const alt = "Coridoor — Buyer-side Transaction Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        color: "#081426",
        background: "#f4f3ee",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>Coridoor</div>
      <div style={{ display: "flex", maxWidth: 980, fontSize: 78, lineHeight: 0.98, letterSpacing: "-4px" }}>
        Buyer-side intelligence before the buyer sets the terms.
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#647080" }}>
        <span>Buyer Objection Report</span>
        <span>Confidential mandate process</span>
      </div>
    </div>,
    size
  );
}
