import "server-only";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Engagement, Profile } from "@/lib/types";

export function safeRedirectPath(value: FormDataEntryValue | string | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/dealroom";
  }
  return value;
}

export async function requireUser() {
  if (!isSupabaseConfigured()) {
    redirect("/login?notice=setup");
  }
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?next=/dealroom");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single<Profile>();
  const { data: accessControl } = await supabase
    .from("profile_access_controls")
    .select("suspended_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (accessControl?.suspended_at) {
    redirect("/unauthorized?reason=suspended");
  }
  return { supabase, user, profile };
}

export async function requireAdmin() {
  const { supabase, user, profile } = await requireUser();
  if (!profile || profile.role !== "admin") {
    redirect("/unauthorized");
  }
  return { supabase, user, profile };
}

export async function getActiveEngagement() {
  const { supabase, user } = await requireUser();
  const { data: engagement } = await supabase
    .from("engagements")
    .select("*")
    .eq("client_owner_id", user.id)
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Engagement>();
  return { supabase, user, engagement };
}
