"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email";
import { getServerEnv } from "@/lib/env";

const uuidSchema = z.uuid();

export async function acceptNda(formData: FormData) {
  const engagementId = uuidSchema.parse(formData.get("engagementId"));
  if (formData.get("accept") !== "yes") {
    redirect("/dealroom?error=Bitte+bestätigen+Sie+die+Vereinbarung+aktiv.");
  }
  const { supabase, user } = await requireUser();
  const [{ data: engagement }, { data: version }] = await Promise.all([
    supabase.from("engagements").select("id").eq("id", engagementId).single(),
    supabase
      .from("nda_versions")
      .select("id, version, content_hash")
      .eq("is_active", true)
      .single()
  ]);
  if (!engagement || !version) {
    redirect("/dealroom?error=Die+NDA-Fassung+konnte+nicht+geladen+werden.");
  }
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const { error } = await supabase.from("nda_acceptances").insert({
    user_id: user.id,
    engagement_id: engagementId,
    nda_version_id: version.id,
    nda_version: version.version,
    content_hash: version.content_hash,
    ip_address: forwardedFor || null,
    user_agent: requestHeaders.get("user-agent")
  });
  if (error) {
    redirect("/dealroom?error=Die+Zustimmung+konnte+nicht+gespeichert+werden.");
  }
  await supabase.from("audit_logs").insert({
    engagement_id: engagementId,
    actor_id: user.id,
    action: "nda.accepted",
    entity_type: "nda_version",
    entity_id: version.id
  });
  if (user.email) {
    await sendTransactionalEmail({
      to: user.email,
      kind: "nda_accepted",
      href: "/dealroom/interview"
    });
  }
  revalidatePath("/dealroom");
  redirect("/dealroom/interview");
}

export async function submitInterview(formData: FormData) {
  const responseId = uuidSchema.parse(formData.get("responseId"));
  const { supabase, user } = await requireUser();
  const { data: response } = await supabase
    .from("questionnaire_responses")
    .update({
      status: "submitted",
      progress: 100,
      submitted_at: new Date().toISOString()
    })
    .eq("id", responseId)
    .select("id, engagement_id")
    .single();
  if (!response) {
    redirect("/dealroom/interview?error=Das+Interview+konnte+nicht+eingereicht+werden.");
  }
  await supabase.from("audit_logs").insert({
    engagement_id: response.engagement_id,
    actor_id: user.id,
    action: "interview.submitted",
    entity_type: "questionnaire_response",
    entity_id: response.id
  });
  const adminEmails = getServerEnv().ADMIN_EMAILS.split(",").map((email) => email.trim()).filter(Boolean);
  await sendTransactionalEmail({
    to: adminEmails,
    kind: "interview_submitted",
    href: `/admin/engagements/${response.engagement_id}/interview`
  });
  revalidatePath("/dealroom");
  redirect("/dealroom/documents?notice=Interview+erfolgreich+eingereicht.");
}

export async function answerClarification(formData: FormData) {
  const threadId = uuidSchema.parse(formData.get("threadId"));
  const body = z.string().trim().min(2).max(10000).parse(formData.get("body"));
  const { supabase, user } = await requireUser();
  const { data: thread } = await supabase
    .from("clarification_threads")
    .select("id, engagement_id")
    .eq("id", threadId)
    .single();
  if (!thread) {
    redirect("/dealroom/questions?error=Die+Rückfrage+wurde+nicht+gefunden.");
  }
  const { error } = await supabase.from("clarification_messages").insert({
    thread_id: threadId,
    author_id: user.id,
    body,
    is_internal: false
  });
  if (error) {
    redirect("/dealroom/questions?error=Die+Antwort+konnte+nicht+gespeichert+werden.");
  }
  await supabase.from("audit_logs").insert({
    engagement_id: thread.engagement_id,
    actor_id: user.id,
    action: "clarification.answered",
    entity_type: "clarification_thread",
    entity_id: threadId
  });
  const adminEmails = getServerEnv().ADMIN_EMAILS.split(",").map((email) => email.trim()).filter(Boolean);
  await sendTransactionalEmail({
    to: adminEmails,
    kind: "clarification_answered",
    href: `/admin/engagements/${thread.engagement_id}/questions`
  });
  revalidatePath("/dealroom/questions");
}

export async function updateProfile(formData: FormData) {
  const fullName = z.string().trim().min(2).max(120).parse(formData.get("fullName"));
  const { supabase, user } = await requireUser();
  await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  revalidatePath("/dealroom/account");
}
