import { redirect } from "next/navigation";
import { InterviewForm } from "@/components/dealroom/interview-form";
import { EmptyState, WorkspaceHeader } from "@/components/dealroom/workspace";
import { getActiveEngagement } from "@/lib/auth";

export default async function InterviewPage() {
  const { supabase, user, engagement } = await getActiveEngagement();
  if (!engagement) redirect("/dealroom");

  const { data: nda } = await supabase
    .from("nda_acceptances")
    .select("id")
    .eq("engagement_id", engagement.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!nda) redirect("/dealroom");

  const { data: response } = await supabase
    .from("questionnaire_responses")
    .select("id, status")
    .eq("engagement_id", engagement.id)
    .maybeSingle();

  if (!response) {
    return (
      <div className="workspace-page">
        <WorkspaceHeader eyebrow="Executive Interview" title="Interview wird vorbereitet" />
        <EmptyState title="Noch kein Interview verfügbar.">
          Das Interview wird automatisch mit Ihrem Engagement angelegt.
        </EmptyState>
      </div>
    );
  }

  const { data: items } = await supabase
    .from("questionnaire_response_items")
    .select("question_key, value")
    .eq("response_id", response.id);
  const initialAnswers = Object.fromEntries(
    (items ?? []).map((item) => [item.question_key, item.value])
  );

  return (
    <div className="workspace-page workspace-page-wide">
      <WorkspaceHeader
        eyebrow="Executive Interview"
        title="Unternehmensprofil aus Käuferperspektive"
        description={
          response.status === "submitted"
            ? "Das Interview wurde eingereicht. Coridoor kann es bei Bedarf für Ergänzungen wieder öffnen."
            : "Antworten werden automatisch gespeichert. Bedingte Folgefragen erscheinen nur, wenn sie relevant sind."
        }
      />
      <InterviewForm
        initialAnswers={initialAnswers}
        locked={["submitted", "locked"].includes(response.status)}
        responseId={response.id}
      />
    </div>
  );
}
