import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  responseId: z.uuid(),
  answers: z.record(z.string(), z.unknown()),
  progress: z.number().int().min(0).max(100)
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid interview data" }, { status: 400 });
  }

  const rows = Object.entries(parsed.data.answers).map(([questionKey, value]) => ({
    response_id: parsed.data.responseId,
    question_key: questionKey,
    value,
    answered_by: user.id,
    updated_at: new Date().toISOString()
  }));

  if (rows.length > 0) {
    const { error: answersError } = await supabase
      .from("questionnaire_response_items")
      .upsert(rows, { onConflict: "response_id,question_key" });
    if (answersError) {
      return Response.json({ error: "Answers could not be saved" }, { status: 403 });
    }
  }

  const savedAt = new Date().toISOString();
  const { error: responseError } = await supabase
    .from("questionnaire_responses")
    .update({
      progress: parsed.data.progress,
      last_saved_at: savedAt
    })
    .eq("id", parsed.data.responseId)
    .in("status", ["draft", "reopened"]);

  if (responseError) {
    return Response.json({ error: "Interview could not be updated" }, { status: 403 });
  }
  return Response.json({ savedAt });
}
