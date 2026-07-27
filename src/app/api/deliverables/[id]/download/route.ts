import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: deliverable } = await supabase
    .from("deliverables")
    .select("id, engagement_id, storage_path, status")
    .eq("id", id)
    .eq("status", "published")
    .single();
  if (!deliverable?.storage_path) return Response.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await supabase.storage
    .from("deal-room-documents")
    .createSignedUrl(deliverable.storage_path, getServerEnv().SIGNED_URL_EXPIRY_SECONDS);
  if (error || !data) return Response.json({ error: "Link unavailable" }, { status: 404 });
  await supabase.from("audit_logs").insert({
    engagement_id: deliverable.engagement_id,
    actor_id: user.id,
    action: "deliverable.downloaded",
    entity_type: "deliverable",
    entity_id: deliverable.id
  });
  return NextResponse.redirect(data.signedUrl, 302);
}
