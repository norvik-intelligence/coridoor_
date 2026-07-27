import { notFound } from "next/navigation";
import { EngagementTabs } from "@/components/admin/engagement-tabs";
import { StatusTag, WorkspaceHeader } from "@/components/dealroom/workspace";
import { saveInternalNote, updateEngagement } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

const statuses = [
  "setup_required",
  "interview_in_progress",
  "documents_outstanding",
  "documents_under_review",
  "clarifications_open",
  "analysis_in_progress",
  "quality_assurance",
  "results_available",
  "completed",
  "archived"
];

export default async function EngagementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: engagement } = await supabase
    .from("engagements")
    .select("*, organisations(*), profiles!engagements_client_owner_id_fkey(full_name, email)")
    .eq("id", id)
    .single();
  if (!engagement) notFound();
  const [
    { data: nda },
    { data: response },
    { count: documents },
    { count: questions },
    { data: notes }
  ] = await Promise.all([
    supabase.from("nda_acceptances").select("accepted_at, nda_version").eq("engagement_id", id).maybeSingle(),
    supabase.from("questionnaire_responses").select("status, progress, submitted_at").eq("engagement_id", id).maybeSingle(),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("engagement_id", id),
    supabase.from("clarification_threads").select("*", { count: "exact", head: true }).eq("engagement_id", id).eq("status", "open"),
    supabase.from("internal_notes").select("id, body, created_at").eq("engagement_id", id).order("created_at", { ascending: false })
  ]);
  const org = engagement.organisations as unknown as { name: string; legal_name: string | null; website: string | null };
  const owner = engagement.profiles as unknown as { full_name: string | null; email: string };
  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow={org.name}
        title={engagement.title}
        description={`${owner.full_name ?? owner.email} · angelegt ${formatDate(engagement.created_at)}`}
        action={<StatusTag tone="attention">{engagement.status.replaceAll("_", " ")}</StatusTag>}
      />
      <EngagementTabs engagementId={id} />
      <section className="admin-detail-grid">
        <div className="workspace-panel admin-status-panel">
          <div><p className="micro-label">Mandatssteuerung</p><h2>Status und Frist</h2></div>
          <form action={updateEngagement} className="workspace-form compact-form">
            <input name="engagementId" type="hidden" value={id} />
            <label>Status<select defaultValue={engagement.status} name="status">{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label>
            <label>Liefertermin<input defaultValue={engagement.delivery_due_at?.slice(0, 10) ?? ""} name="deliveryDueAt" type="date" /></label>
            <button className="button button-dark" type="submit">Mandat aktualisieren</button>
          </form>
        </div>
        <div className="admin-snapshot">
          {[
            ["NDA", nda ? `Akzeptiert · ${formatDate(nda.accepted_at)}` : "Ausstehend"],
            ["Interview", `${response?.progress ?? 0}% · ${response?.status ?? "draft"}`],
            ["Dokumente", String(documents ?? 0)],
            ["Offene Rückfragen", String(questions ?? 0)]
          ].map(([label, value]) => <article className="workspace-panel" key={label}><p>{label}</p><strong>{value}</strong></article>)}
        </div>
        <div className="workspace-panel admin-client-card">
          <p className="micro-label">Mandant</p>
          <h2>{owner.full_name ?? "Ohne Namensangabe"}</h2>
          <a href={`mailto:${owner.email}`}>{owner.email}</a>
          <p>{org.legal_name ?? org.name}</p>
          {org.website && <a href={org.website} rel="noreferrer" target="_blank">{org.website} ↗</a>}
        </div>
        <div className="workspace-panel internal-notes">
          <p className="micro-label">Internal only</p>
          <h2>Interne Notizen</h2>
          <form action={saveInternalNote}>
            <input name="engagementId" type="hidden" value={id} />
            <textarea name="body" placeholder="Nur für Coridoor sichtbar" required rows={4} />
            <button className="button button-dark" type="submit">Notiz speichern</button>
          </form>
          <div>{(notes ?? []).map((note) => <article key={note.id}><p>{note.body}</p><small>{formatDate(note.created_at)}</small></article>)}</div>
        </div>
      </section>
    </div>
  );
}
