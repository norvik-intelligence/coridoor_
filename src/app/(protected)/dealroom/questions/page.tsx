import { MessageSquareText } from "lucide-react";
import { answerClarification } from "@/lib/actions/dealroom";
import { getActiveEngagement } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { EmptyState, StatusTag, WorkspaceHeader } from "@/components/dealroom/workspace";

type Thread = {
  id: string;
  subject: string;
  status: "open" | "answered" | "closed";
  created_at: string;
  clarification_messages: Array<{
    id: string;
    body: string;
    is_internal: boolean;
    created_at: string;
    author_id: string;
  }>;
};

export default async function QuestionsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, user, engagement } = await getActiveEngagement();
  const { data: threads } = engagement
    ? await supabase
        .from("clarification_threads")
        .select("id, subject, status, created_at, clarification_messages(id, body, is_internal, created_at, author_id)")
        .eq("engagement_id", engagement.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow="Structured clarifications"
        title="Open Questions"
        description="Keine unübersichtlichen Chatverläufe: Jede Rückfrage ist einem Engagement, Thema und Status zugeordnet."
      />
      {params.error && <div className="form-message form-message-error">{params.error}</div>}
      {(threads ?? []).length === 0 ? (
        <EmptyState title="Keine offenen Rückfragen">
          Sobald Coridoor zusätzliche Belege oder Einordnungen benötigt, erscheint die Frage hier.
        </EmptyState>
      ) : (
        <div className="clarification-list">
          {(threads as Thread[]).map((thread) => (
            <article className="clarification-card" key={thread.id}>
              <header>
                <div>
                  <p className="micro-label">Rückfrage · {formatDate(thread.created_at)}</p>
                  <h2>{thread.subject}</h2>
                </div>
                <StatusTag tone={thread.status === "closed" ? "positive" : "attention"}>{thread.status}</StatusTag>
              </header>
              <div className="clarification-messages">
                {thread.clarification_messages
                  .filter((message) => !message.is_internal)
                  .sort((a, b) => a.created_at.localeCompare(b.created_at))
                  .map((message) => (
                    <div className={message.author_id === user.id ? "client-message" : "admin-message"} key={message.id}>
                      <span>{message.author_id === user.id ? "Ihre Antwort" : "Coridoor"}</span>
                      <p>{message.body}</p>
                      <small>{formatDate(message.created_at)}</small>
                    </div>
                  ))}
              </div>
              {thread.status === "open" && (
                <form action={answerClarification} className="clarification-form">
                  <input name="threadId" type="hidden" value={thread.id} />
                  <label>
                    Ihre Antwort
                    <textarea name="body" rows={4} required />
                  </label>
                  <button className="button button-dark" type="submit">
                    Antwort sicher übermitteln
                  </button>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
      <div className="workspace-context-note">
        <MessageSquareText size={18} strokeWidth={1.5} aria-hidden="true" />
        <p><strong>Mandatsbezogene Kommunikation</strong><span>Allgemeine Kontaktanfragen bitte weiterhin per E-Mail. Sensible Rückfragen bleiben hier im Deal Room.</span></p>
      </div>
    </div>
  );
}
