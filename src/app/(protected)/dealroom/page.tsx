import Link from "next/link";
import { ArrowUpRight, Check, Clock3, FileText, MessageSquareText } from "lucide-react";
import { acceptNda } from "@/lib/actions/dealroom";
import { getActiveEngagement } from "@/lib/auth";
import { formatDate, statusLabel } from "@/lib/utils";
import { EmptyState, StatusTag, WorkspaceHeader } from "@/components/dealroom/workspace";

export default async function DealroomOverview({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, user, engagement } = await getActiveEngagement();

  if (!engagement) {
    return (
      <div className="workspace-page">
        <WorkspaceHeader eyebrow="Deal Room" title="Kein aktives Engagement" />
        <EmptyState title="Ihr Mandat wird vorbereitet.">
          Nach interner Prüfung erscheint das Engagement automatisch in diesem Bereich.
        </EmptyState>
      </div>
    );
  }

  const [
    { data: ndaAcceptance },
    { data: ndaVersion },
    { data: response },
    { count: documentCount },
    { count: requestCount },
    { count: openQuestions }
  ] = await Promise.all([
    supabase
      .from("nda_acceptances")
      .select("id, accepted_at")
      .eq("engagement_id", engagement.id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("nda_versions")
      .select("id, version, title, content, content_hash")
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("questionnaire_responses")
      .select("id, status, progress, last_saved_at")
      .eq("engagement_id", engagement.id)
      .maybeSingle(),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("engagement_id", engagement.id),
    supabase.from("document_requests").select("*", { count: "exact", head: true }).eq("engagement_id", engagement.id).eq("is_required", true),
    supabase.from("clarification_threads").select("*", { count: "exact", head: true }).eq("engagement_id", engagement.id).eq("status", "open")
  ]);

  if (!ndaAcceptance && ndaVersion) {
    return (
      <div className="workspace-page">
        <WorkspaceHeader
          eyebrow="Setup · Schritt 1 von 2"
          title="Vertraulichkeit bestätigen"
          description="Bevor Sie sensible Informationen übermitteln, lesen und akzeptieren Sie bitte die aktuell hinterlegte Vereinbarung."
        />
        {params.error && <div className="form-message form-message-error">{params.error}</div>}
        <section className="nda-card">
          <div className="nda-card-head">
            <div>
              <p className="micro-label">Version {ndaVersion.version}</p>
              <h2>{ndaVersion.title}</h2>
            </div>
            <StatusTag tone="attention">Juristisch zu prüfende Vorlage</StatusTag>
          </div>
          <details>
            <summary>Vollständigen Text öffnen</summary>
            <div className="nda-content">{ndaVersion.content}</div>
          </details>
          <form action={acceptNda} className="nda-acceptance">
            <input type="hidden" name="engagementId" value={engagement.id} />
            <label className="checkbox-label">
              <input type="checkbox" name="accept" value="yes" required />
              <span>
                Ich habe die vollständige Fassung geöffnet, gelesen und akzeptiere
                die Verschwiegenheitsvereinbarung in dieser Version.
              </span>
            </label>
            <button className="button button-dark" type="submit">
              Verbindlich akzeptieren <ArrowUpRight size={17} aria-hidden="true" />
            </button>
          </form>
        </section>
      </div>
    );
  }

  const requestTotal = requestCount ?? 0;
  const docsTotal = documentCount ?? 0;
  const documentProgress = requestTotal === 0 ? 0 : Math.min(100, Math.round((docsTotal / requestTotal) * 100));

  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow="Aktives Engagement"
        title={engagement.title}
        description={`Letzte Aktualisierung ${formatDate(engagement.updated_at)}`}
        action={<StatusTag tone="attention">{statusLabel(engagement.status)}</StatusTag>}
      />
      <section className="workspace-metrics">
        <article>
          <p className="micro-label">NDA</p>
          <strong><Check size={18} aria-hidden="true" />Akzeptiert</strong>
          <small>{formatDate(ndaAcceptance?.accepted_at)}</small>
        </article>
        <article>
          <p className="micro-label">Interview</p>
          <strong>{response?.progress ?? 0}%</strong>
          <div className="progress-line"><i style={{ width: `${response?.progress ?? 0}%` }} /></div>
        </article>
        <article>
          <p className="micro-label">Dokumente</p>
          <strong>{docsTotal} / {requestTotal}</strong>
          <div className="progress-line"><i style={{ width: `${documentProgress}%` }} /></div>
        </article>
        <article>
          <p className="micro-label">Offene Rückfragen</p>
          <strong>{openQuestions ?? 0}</strong>
          <small>Mandatsbezogen</small>
        </article>
      </section>
      <section className="workspace-overview-grid">
        <div className="workspace-panel next-action-panel">
          <p className="micro-label">Nächster Schritt</p>
          {(response?.status ?? "draft") === "submitted" ? (
            <>
              <FileText size={25} strokeWidth={1.4} aria-hidden="true" />
              <h2>Unterlagen vervollständigen</h2>
              <p>Laden Sie die angeforderten Nachweise direkt in den privaten Dokumentenspeicher.</p>
              <Link className="button button-dark" href="/dealroom/documents">Dokumente öffnen</Link>
            </>
          ) : (
            <>
              <FileText size={25} strokeWidth={1.4} aria-hidden="true" />
              <h2>Executive Interview fortsetzen</h2>
              <p>Ihre Antworten werden automatisch gespeichert. Sie können jederzeit zurückkehren.</p>
              <Link className="button button-dark" href="/dealroom/interview">Interview öffnen</Link>
            </>
          )}
        </div>
        <div className="workspace-panel mandate-timeline">
          <p className="micro-label">Mandatsfortschritt</p>
          {[
            ["Secure intake", true],
            ["Executive Interview", (response?.progress ?? 0) === 100],
            ["Document review", engagement.status !== "interview_in_progress"],
            ["Buyer-side analysis", ["analysis_in_progress", "quality_assurance", "results_available", "completed"].includes(engagement.status)],
            ["Delivery", ["results_available", "completed"].includes(engagement.status)]
          ].map(([label, complete]) => (
            <div className={complete ? "timeline-row complete" : "timeline-row"} key={String(label)}>
              <i />
              <span>{label}</span>
              {complete ? <Check size={15} aria-hidden="true" /> : <Clock3 size={15} aria-hidden="true" />}
            </div>
          ))}
        </div>
        <div className="workspace-panel contact-panel">
          <MessageSquareText size={22} strokeWidth={1.5} aria-hidden="true" />
          <p className="micro-label">Ansprechpartner</p>
          <h3>Coridoor Transaction Desk</h3>
          <p>Mandatsbezogene Fragen werden strukturiert im Bereich „Open Questions“ beantwortet.</p>
          <Link href="/dealroom/questions">Rückfragen öffnen →</Link>
        </div>
        <div className="workspace-panel delivery-panel">
          <p className="micro-label">Voraussichtliche Lieferung</p>
          <strong>{formatDate(engagement.delivery_due_at)}</strong>
          <p>Der Termin wird nach vollständigem Intake und Dokumentenprüfung bestätigt.</p>
        </div>
      </section>
    </div>
  );
}
