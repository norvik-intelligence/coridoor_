import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Clock3,
  FileText,
  LockKeyhole,
  MessageSquareText
} from "lucide-react";
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
        <WorkspaceHeader eyebrow="Private engagement" title="Ihr Mandat wird vorbereitet" />
        <EmptyState title="Noch kein aktives Engagement">
          Nach interner Prüfung erscheint Ihr persönlicher Deal Room automatisch in diesem Bereich.
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
          eyebrow="Confidentiality protocol · step 1 of 2"
          title="Vertraulichkeit vor Dateneingabe bestätigen"
          description="Der geschützte Mandantenprozess beginnt erst, nachdem Sie die hinterlegte Vereinbarung vollständig geöffnet und akzeptiert haben."
          action={<LockKeyhole size={28} strokeWidth={1.25} aria-hidden="true" />}
        />
        {params.error && <div className="form-message form-message-error">{params.error}</div>}
        <section className="nda-card">
          <div className="nda-card-head">
            <div>
              <p className="micro-label">Document version {ndaVersion.version}</p>
              <h2>{ndaVersion.title}</h2>
            </div>
            <StatusTag tone="attention">Juristisch zu prüfende Vorlage</StatusTag>
          </div>
          <details>
            <summary>Vollständigen Vertragstext öffnen</summary>
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
  const interviewProgress = response?.progress ?? 0;
  const interviewSubmitted = (response?.status ?? "draft") === "submitted";

  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow="Buyer Objection Report · private engagement"
        title={engagement.title}
        description={`Prepared in the Coridoor Transaction Desk · letzte Aktualisierung ${formatDate(engagement.updated_at)}`}
        action={<StatusTag tone="attention">{statusLabel(engagement.status)}</StatusTag>}
      />

      <section className="workspace-metrics" aria-label="Mandatsstatus">
        <article>
          <p className="micro-label">Confidentiality</p>
          <strong><Check size={18} aria-hidden="true" />NDA active</strong>
          <small>Akzeptiert am {formatDate(ndaAcceptance?.accepted_at)}</small>
        </article>
        <article>
          <p className="micro-label">Executive interview</p>
          <strong>{interviewProgress}%</strong>
          <div className="progress-line"><i style={{ width: `${interviewProgress}%` }} /></div>
          <small>{response?.last_saved_at ? `Zuletzt gespeichert ${formatDate(response.last_saved_at)}` : "Noch nicht begonnen"}</small>
        </article>
        <article>
          <p className="micro-label">Evidence received</p>
          <strong>{docsTotal} / {requestTotal}</strong>
          <div className="progress-line"><i style={{ width: `${documentProgress}%` }} /></div>
          <small>{documentProgress}% der angeforderten Unterlagen</small>
        </article>
        <article>
          <p className="micro-label">Open clarifications</p>
          <strong>{openQuestions ?? 0}</strong>
          <small>Strukturiert und mandatsbezogen</small>
        </article>
      </section>

      <section className="workspace-overview-grid">
        <div className="workspace-panel next-action-panel">
          <p className="micro-label">Required next action</p>
          {interviewSubmitted ? (
            <>
              <FileText size={27} strokeWidth={1.2} aria-hidden="true" />
              <h2>Die Beweislage vervollständigen</h2>
              <p>
                Laden Sie die angeforderten Nachweise in den privaten Dokumentenspeicher.
                Erst danach beginnt die finale Käuferperspektive und Qualitätskontrolle.
              </p>
              <Link className="button button-dark" href="/dealroom/documents">
                Dokumente öffnen <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <FileText size={27} strokeWidth={1.2} aria-hidden="true" />
              <h2>Das Executive Interview abschließen</h2>
              <p>
                Die Fragen erfassen Abhängigkeiten, Ergebnisqualität, Kundenstruktur und
                Beweislücken. Ihre Eingaben werden automatisch gespeichert.
              </p>
              <Link className="button button-dark" href="/dealroom/interview">
                Interview fortsetzen <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        <div className="workspace-panel mandate-timeline">
          <p className="micro-label">Engagement sequence</p>
          {[
            ["Confidentiality protocol", true],
            ["Executive interview", interviewProgress === 100],
            ["Document review", engagement.status !== "interview_in_progress"],
            ["Buyer-side analysis", ["analysis_in_progress", "quality_assurance", "results_available", "completed"].includes(engagement.status)],
            ["Controlled delivery", ["results_available", "completed"].includes(engagement.status)]
          ].map(([label, complete]) => (
            <div className={complete ? "timeline-row complete" : "timeline-row"} key={String(label)}>
              <i />
              <span>{label}</span>
              {complete ? <Check size={15} aria-hidden="true" /> : <Clock3 size={15} aria-hidden="true" />}
            </div>
          ))}
        </div>

        <div className="workspace-panel contact-panel">
          <MessageSquareText size={22} strokeWidth={1.35} aria-hidden="true" />
          <p className="micro-label">Transaction desk</p>
          <h3>Coridoor Analyst Office</h3>
          <p>Rückfragen werden als nachvollziehbare Clarifications geführt, nicht als unstrukturierter Chat.</p>
          <Link href="/dealroom/questions">Open Questions ansehen →</Link>
        </div>

        <div className="workspace-panel delivery-panel">
          <p className="micro-label">Target delivery</p>
          <strong>{formatDate(engagement.delivery_due_at)}</strong>
          <p>Der finale Termin wird nach vollständigem Intake und Dokumentenreview bestätigt.</p>
        </div>
      </section>
    </div>
  );
}
