import { Download, FileCheck2, LockKeyhole } from "lucide-react";
import { getActiveEngagement } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { EmptyState, StatusTag, WorkspaceHeader } from "@/components/dealroom/workspace";

type Finding = {
  id: string;
  category: string;
  title: string;
  observation: string;
  buyer_interpretation: string;
  potential_deal_impact: string;
  required_evidence: string;
  severity: "low" | "medium" | "high" | "critical";
};

export default async function ResultsPage() {
  const { supabase, engagement } = await getActiveEngagement();
  const [{ data: deliverables }, { data: findings }] = engagement
    ? await Promise.all([
        supabase
          .from("deliverables")
          .select("id, type, title, status, version, published_at, storage_path")
          .eq("engagement_id", engagement.id)
          .eq("status", "published")
          .order("published_at", { ascending: false }),
        supabase
          .from("analysis_findings")
          .select("id, category, title, observation, buyer_interpretation, potential_deal_impact, required_evidence, severity")
          .eq("engagement_id", engagement.id)
          .eq("client_visible", true)
          .eq("status", "approved")
          .order("sort_order")
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow="Controlled release"
        title="Deliverables"
        description="Ergebnisse erscheinen erst nach manueller Qualitätskontrolle und ausdrücklicher Freigabe."
      />
      {(deliverables ?? []).length === 0 ? (
        <EmptyState
          action={<LockKeyhole size={23} strokeWidth={1.4} aria-hidden="true" />}
          title="Ihre Unterlagen befinden sich in der Analyse."
        >
          Unveröffentlichte Befunde sind nicht sichtbar. Sie erhalten eine Nachricht,
          sobald die Qualitätskontrolle abgeschlossen ist.
        </EmptyState>
      ) : (
        <>
          <section className="deliverable-list">
            {(deliverables ?? []).map((deliverable) => (
              <article key={deliverable.id}>
                <FileCheck2 size={22} strokeWidth={1.4} aria-hidden="true" />
                <div>
                  <p className="micro-label">{deliverable.type.replaceAll("_", " ")}</p>
                  <h2>{deliverable.title}</h2>
                  <span>Version {deliverable.version} · veröffentlicht {formatDate(deliverable.published_at)}</span>
                </div>
                <StatusTag tone="positive">Freigegeben</StatusTag>
                {deliverable.storage_path && (
                  <a aria-label={`${deliverable.title} herunterladen`} href={`/api/deliverables/${deliverable.id}/download`}>
                    <Download size={17} />
                  </a>
                )}
              </article>
            ))}
          </section>
          {(findings ?? []).length > 0 && (
            <section className="published-findings">
              <div className="workspace-section-head">
                <div><p className="micro-label">Buyer Objection Register</p><h2>Freigegebene Kernbefunde</h2></div>
              </div>
              {(findings as Finding[]).map((finding, index) => (
                <article key={finding.id}>
                  <header>
                    <span>Concern {String(index + 1).padStart(2, "0")}</span>
                    <StatusTag tone={finding.severity === "critical" || finding.severity === "high" ? "critical" : "attention"}>{finding.severity}</StatusTag>
                  </header>
                  <h3>{finding.title}</h3>
                  <p>{finding.observation}</p>
                  <div>
                    <section><span>Buyer interpretation</span><p>{finding.buyer_interpretation}</p></section>
                    <section><span>Potential deal impact</span><p>{finding.potential_deal_impact}</p></section>
                    <section><span>Required evidence</span><p>{finding.required_evidence}</p></section>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
