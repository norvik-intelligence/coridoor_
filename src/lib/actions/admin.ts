"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email";

const uuid = z.uuid();

export async function updateEngagement(formData: FormData) {
  const input = z.object({
    engagementId: z.uuid(),
    status: z.enum([
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
    ]),
    deliveryDueAt: z.string().optional()
  }).parse({
    engagementId: formData.get("engagementId"),
    status: formData.get("status"),
    deliveryDueAt: formData.get("deliveryDueAt") || undefined
  });
  const { supabase, user } = await requireAdmin();
  await supabase.from("engagements").update({
    status: input.status,
    delivery_due_at: input.deliveryDueAt
      ? new Date(`${input.deliveryDueAt}T12:00:00Z`).toISOString()
      : null,
    completed_at: input.status === "completed" ? new Date().toISOString() : null,
    archived_at: input.status === "archived" ? new Date().toISOString() : null
  }).eq("id", input.engagementId);
  await supabase.from("audit_logs").insert({
    engagement_id: input.engagementId,
    actor_id: user.id,
    action: "engagement.status_changed",
    entity_type: "engagement",
    entity_id: input.engagementId,
    metadata: { status: input.status }
  });
  revalidatePath(`/admin/engagements/${input.engagementId}`);
  revalidatePath("/admin");
}

export async function createClarification(formData: FormData) {
  const input = z.object({
    engagementId: z.uuid(),
    subject: z.string().trim().min(3).max(200),
    body: z.string().trim().min(3).max(10000)
  }).parse({
    engagementId: formData.get("engagementId"),
    subject: formData.get("subject"),
    body: formData.get("body")
  });
  const { supabase, user } = await requireAdmin();
  const { data: thread } = await supabase.from("clarification_threads").insert({
    engagement_id: input.engagementId,
    subject: input.subject,
    status: "open",
    created_by: user.id
  }).select("id").single();
  if (!thread) redirect(`/admin/engagements/${input.engagementId}/questions?error=Rückfrage+konnte+nicht+erstellt+werden.`);
  await supabase.from("clarification_messages").insert({
    thread_id: thread.id,
    author_id: user.id,
    body: input.body,
    is_internal: false
  });
  await supabase.from("audit_logs").insert({
    engagement_id: input.engagementId,
    actor_id: user.id,
    action: "clarification.created",
    entity_type: "clarification_thread",
    entity_id: thread.id
  });
  const { data: owner } = await supabase
    .from("engagements")
    .select("profiles!engagements_client_owner_id_fkey(email)")
    .eq("id", input.engagementId)
    .single();
  const ownerEmail = (owner?.profiles as unknown as { email: string } | null)?.email;
  if (ownerEmail) {
    await sendTransactionalEmail({
      to: ownerEmail,
      kind: "clarification_created",
      href: "/dealroom/questions"
    });
  }
  revalidatePath(`/admin/engagements/${input.engagementId}/questions`);
}

export async function saveInternalNote(formData: FormData) {
  const engagementId = uuid.parse(formData.get("engagementId"));
  const body = z.string().trim().min(2).max(20000).parse(formData.get("body"));
  const { supabase, user } = await requireAdmin();
  await supabase.from("internal_notes").insert({
    engagement_id: engagementId,
    author_id: user.id,
    body
  });
  revalidatePath(`/admin/engagements/${engagementId}`);
}

export async function createFinding(formData: FormData) {
  const input = z.object({
    engagementId: z.uuid(),
    category: z.string().trim().min(2).max(80),
    title: z.string().trim().min(3).max(200),
    observation: z.string().trim().min(3).max(10000),
    buyerInterpretation: z.string().trim().min(3).max(10000),
    potentialDealImpact: z.string().trim().min(3).max(10000),
    requiredEvidence: z.string().trim().min(3).max(10000),
    severity: z.enum(["low", "medium", "high", "critical"])
  }).parse({
    engagementId: formData.get("engagementId"),
    category: formData.get("category"),
    title: formData.get("title"),
    observation: formData.get("observation"),
    buyerInterpretation: formData.get("buyerInterpretation"),
    potentialDealImpact: formData.get("potentialDealImpact"),
    requiredEvidence: formData.get("requiredEvidence"),
    severity: formData.get("severity")
  });
  const { supabase, user } = await requireAdmin();
  await supabase.from("analysis_findings").insert({
    engagement_id: input.engagementId,
    category: input.category,
    title: input.title,
    observation: input.observation,
    buyer_interpretation: input.buyerInterpretation,
    potential_deal_impact: input.potentialDealImpact,
    required_evidence: input.requiredEvidence,
    severity: input.severity,
    status: "draft",
    client_visible: false,
    created_by: user.id
  });
  revalidatePath(`/admin/engagements/${input.engagementId}/analysis`);
}

export async function setFindingPublication(formData: FormData) {
  const engagementId = uuid.parse(formData.get("engagementId"));
  const findingId = uuid.parse(formData.get("findingId"));
  const publish = formData.get("publish") === "true";
  const { supabase, user } = await requireAdmin();
  await supabase.from("analysis_findings").update({
    status: publish ? "approved" : "in_review",
    client_visible: publish
  }).eq("id", findingId).eq("engagement_id", engagementId);
  await supabase.from("audit_logs").insert({
    engagement_id: engagementId,
    actor_id: user.id,
    action: publish ? "finding.published" : "finding.withdrawn",
    entity_type: "analysis_finding",
    entity_id: findingId
  });
  revalidatePath(`/admin/engagements/${engagementId}/analysis`);
  revalidatePath("/dealroom/results");
}

export async function createDeliverable(formData: FormData) {
  const input = z.object({
    engagementId: z.uuid(),
    type: z.enum(["executive_summary", "buyer_objection_register", "deal_term_risk_map", "evidence_gap_report", "founder_dependency_map", "management_questions", "proof_plan", "final_report"]),
    title: z.string().trim().min(3).max(200)
  }).parse({
    engagementId: formData.get("engagementId"),
    type: formData.get("type"),
    title: formData.get("title")
  });
  const { supabase } = await requireAdmin();
  await supabase.from("deliverables").insert({
    engagement_id: input.engagementId,
    type: input.type,
    title: input.title,
    status: "draft",
    version: 1
  });
  revalidatePath(`/admin/engagements/${input.engagementId}/deliverables`);
}

export async function setDeliverablePublication(formData: FormData) {
  const engagementId = uuid.parse(formData.get("engagementId"));
  const deliverableId = uuid.parse(formData.get("deliverableId"));
  const publish = formData.get("publish") === "true";
  const { supabase, user } = await requireAdmin();
  if (publish) {
    const { data: deliverable } = await supabase
      .from("deliverables")
      .select("storage_path")
      .eq("id", deliverableId)
      .eq("engagement_id", engagementId)
      .single();
    if (!deliverable?.storage_path) {
      redirect(
        `/admin/engagements/${engagementId}/deliverables?error=Vor+der+Freigabe+muss+ein+PDF+hochgeladen+werden.`
      );
    }
  }
  await supabase.from("deliverables").update({
    status: publish ? "published" : "withdrawn",
    published_at: publish ? new Date().toISOString() : null,
    published_by: publish ? user.id : null
  }).eq("id", deliverableId).eq("engagement_id", engagementId);
  await supabase.from("audit_logs").insert({
    engagement_id: engagementId,
    actor_id: user.id,
    action: publish ? "deliverable.published" : "deliverable.withdrawn",
    entity_type: "deliverable",
    entity_id: deliverableId
  });
  if (publish) {
    const { data: owner } = await supabase
      .from("engagements")
      .select("profiles!engagements_client_owner_id_fkey(email)")
      .eq("id", engagementId)
      .single();
    const ownerEmail = (owner?.profiles as unknown as { email: string } | null)?.email;
    if (ownerEmail) {
      await sendTransactionalEmail({
        to: ownerEmail,
        kind: "results_available",
        href: "/dealroom/results"
      });
    }
  }
  revalidatePath(`/admin/engagements/${engagementId}/deliverables`);
  revalidatePath("/dealroom/results");
}

export async function setUserSuspension(formData: FormData) {
  const userId = uuid.parse(formData.get("userId"));
  const suspend = formData.get("suspend") === "true";
  const { supabase, user } = await requireAdmin();
  if (userId === user.id) {
    redirect("/admin/users?error=Der+eigene+Adminzugang+kann+nicht+gesperrt+werden.");
  }
  const { error } = await supabase.from("profile_access_controls").upsert({
    user_id: userId,
    suspended_at: suspend ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  });
  if (error) {
    redirect("/admin/users?error=Die+Zugangsänderung+konnte+nicht+gespeichert+werden.");
  }
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: suspend ? "user.suspended" : "user.reactivated",
    entity_type: "profile",
    entity_id: userId
  });
  revalidatePath("/admin/users");
}
