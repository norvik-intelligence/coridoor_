import { notFound } from "next/navigation";
import { DeliverableUploader } from "@/components/admin/deliverable-uploader";
import { EngagementTabs } from "@/components/admin/engagement-tabs";
import { StatusTag, WorkspaceHeader } from "@/components/dealroom/workspace";
import {
  createClarification,
  createDeliverable,
  createFinding,
  setDeliverablePublication,
  setFindingPublication
} from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { formatBytes, formatDate } from "@/lib/utils";

const views = new Set(["interview", "documents", "questions", "analysis", "deliverables"]);

function ViewTitle({ view }: { view: string }) {
  const content: Record<string, [string, string]> = {
    interview: ["Interview Review", "Alle Antworten des Mandanten in einer internen Prüfungssicht."],
    documents: ["Document Review", "Dokumentstatus, Versionen und Dateimetadaten."],
    questions: ["Clarifications", "Gezielte Rückfragen ohne unstrukturierte Chat-Kommunikation."],
    analysis: ["Buyer Objection Register", "Interne Befunde erstellen, prüfen und kontrolliert veröffentlichen."],
    deliverables: ["Deliverable Control", "Module anlegen und erst nach Qualitätskontrolle freigeben."]
  };
  const [title, description] = content[view]!;
  return <WorkspaceHeader eyebrow="Engagement workstream" title={title} description={description} />;
}

export default async function EngagementView({
  params,
  searchParams
}: {
  params: Promise<{ id: string; view: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, view } = await params;
  const query = await searchParams;
  if (!views.has(view)) notFound();
  const { supabase } = await requireAdmin();
  const { data: engagement } = await supabase
    .from("engagements")
    .select("id, title, organisation_id")
    .eq("id", id)
    .single();
  if (!engagement) notFound();

  let content: React.ReactNode;
  if (view === "interview") {
    const { data: response } = await supabase.from("questionnaire_responses").select("id, status, progress, submitted_at").eq("engagement_id", id).maybeSingle();
    const { data: items } = response
      ? await supabase.from("questionnaire_response_items").select("question_key, value, updated_at").eq("response_id", response.id).order("question_key")
      : { data: [] };
    content = (
      <section className="workspace-panel admin-review-list">
        <div className="workspace-section-head"><div><p className="micro-label">Status {response?.status ?? "not started"}</p><h2>{response?.progress ?? 0}% beantwortet</h2></div><span>{items?.length ?? 0}</span></div>
        {(items ?? []).map((item) => <article key={item.question_key}><span>{item.question_key.replaceAll("_", " ")}</span><pre>{typeof item.value === "string" ? item.value : JSON.stringify(item.value, null, 2)}</pre></article>)}
      </section>
    );
  } else if (view === "documents") {
    const { data: documents } = await supabase.from("documents").select("id, original_filename, category, file_size, status, current_version, created_at").eq("engagement_id", id).order("created_at", { ascending: false });
    content = (
      <section className="workspace-panel document-table-wrap">
        <table className="document-table admin-table"><thead><tr><th>Datei</th><th>Kategorie</th><th>Größe</th><th>Version</th><th>Status</th><th>Upload</th></tr></thead><tbody>
          {(documents ?? []).map((document) => <tr key={document.id}><td>{document.original_filename}</td><td>{document.category}</td><td>{formatBytes(document.file_size)}</td><td>v{document.current_version}</td><td><StatusTag tone="attention">{document.status}</StatusTag></td><td>{formatDate(document.created_at)}</td></tr>)}
        </tbody></table>
      </section>
    );
  } else if (view === "questions") {
    const { data: threads } = await supabase.from("clarification_threads").select("id, subject, status, created_at").eq("engagement_id", id).order("created_at", { ascending: false });
    content = (
      <div className="admin-two-column">
        <form action={createClarification} className="workspace-panel workspace-form">
          <div><p className="micro-label">Neue Rückfrage</p><h2>Mandant gezielt fragen</h2></div>
          <input name="engagementId" type="hidden" value={id} />
          <label>Betreff<input name="subject" required /></label>
          <label>Frage<textarea name="body" required rows={6} /></label>
          <button className="button button-dark" type="submit">Rückfrage veröffentlichen</button>
        </form>
        <section className="workspace-panel admin-review-list">
          <div className="workspace-section-head"><div><p className="micro-label">Verlauf</p><h2>Rückfragen</h2></div></div>
          {(threads ?? []).map((thread) => <article key={thread.id}><span>{thread.subject}</span><StatusTag tone={thread.status === "closed" ? "positive" : "attention"}>{thread.status}</StatusTag><small>{formatDate(thread.created_at)}</small></article>)}
        </section>
      </div>
    );
  } else if (view === "analysis") {
    const { data: findings } = await supabase.from("analysis_findings").select("*").eq("engagement_id", id).order("sort_order");
    content = (
      <div className="admin-analysis-layout">
        <form action={createFinding} className="workspace-panel workspace-form admin-finding-form">
          <div><p className="micro-label">Neuer interner Befund</p><h2>Buyer concern anlegen</h2></div>
          <input name="engagementId" type="hidden" value={id} />
          <div className="form-row"><label>Kategorie<input name="category" required /></label><label>Severity<select name="severity"><option>low</option><option>medium</option><option>high</option><option>critical</option></select></label></div>
          <label>Titel<input name="title" required /></label>
          <label>Observation<textarea name="observation" required rows={3} /></label>
          <label>Buyer interpretation<textarea name="buyerInterpretation" required rows={3} /></label>
          <label>Potential deal impact<textarea name="potentialDealImpact" required rows={3} /></label>
          <label>Required evidence<textarea name="requiredEvidence" required rows={3} /></label>
          <button className="button button-dark" type="submit">Als Entwurf speichern</button>
        </form>
        <section className="admin-findings-list">
          {(findings ?? []).map((finding) => <article className="workspace-panel" key={finding.id}><header><span>{finding.category}</span><StatusTag tone={finding.severity === "critical" || finding.severity === "high" ? "critical" : "attention"}>{finding.severity}</StatusTag></header><h2>{finding.title}</h2><p>{finding.observation}</p><form action={setFindingPublication}><input name="engagementId" type="hidden" value={id} /><input name="findingId" type="hidden" value={finding.id} /><input name="publish" type="hidden" value={finding.client_visible ? "false" : "true"} /><button className={finding.client_visible ? "button button-ghost" : "button button-dark"} type="submit">{finding.client_visible ? "Freigabe zurücknehmen" : "Für Mandant freigeben"}</button></form></article>)}
        </section>
      </div>
    );
  } else {
    const { data: deliverables } = await supabase.from("deliverables").select("*").eq("engagement_id", id).order("created_at");
    content = (
      <div className="admin-two-column">
        <form action={createDeliverable} className="workspace-panel workspace-form">
          <div><p className="micro-label">Neues Modul</p><h2>Deliverable anlegen</h2></div>
          <input name="engagementId" type="hidden" value={id} />
          <label>Typ<select name="type">{["executive_summary", "buyer_objection_register", "deal_term_risk_map", "evidence_gap_report", "founder_dependency_map", "management_questions", "proof_plan", "final_report"].map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></label>
          <label>Titel<input name="title" required /></label>
          <button className="button button-dark" type="submit">Entwurf anlegen</button>
        </form>
        <section className="admin-deliverables-list">
          {(deliverables ?? []).map((deliverable) => (
            <article className="workspace-panel" key={deliverable.id}>
              <p className="micro-label">{deliverable.type.replaceAll("_", " ")}</p>
              <h2>{deliverable.title}</h2>
              <span>Version {deliverable.version}</span>
              <StatusTag tone={deliverable.status === "published" ? "positive" : "neutral"}>
                {deliverable.status}
              </StatusTag>
              <DeliverableUploader
                deliverableId={deliverable.id}
                engagementId={id}
                organisationId={engagement.organisation_id}
                version={deliverable.version}
              />
              <form action={setDeliverablePublication}>
                <input name="engagementId" type="hidden" value={id} />
                <input name="deliverableId" type="hidden" value={deliverable.id} />
                <input name="publish" type="hidden" value={deliverable.status === "published" ? "false" : "true"} />
                <button className={deliverable.status === "published" ? "button button-ghost" : "button button-dark"} type="submit">
                  {deliverable.status === "published" ? "Freigabe zurücknehmen" : "Veröffentlichen"}
                </button>
              </form>
            </article>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <ViewTitle view={view} />
      <EngagementTabs engagementId={id} />
      {query.error && <div className="form-message form-message-error">{query.error}</div>}
      {content}
    </div>
  );
}
