"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/env";
import { safeRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
  password: z.string().min(10, "Das Passwort muss mindestens 10 Zeichen enthalten.")
});

function messageUrl(path: string, kind: "error" | "notice", message: string) {
  const query = new URLSearchParams({ [kind]: message });
  return `${path}?${query.toString()}`;
}

export async function login(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect(messageUrl("/login", "error", "Die sichere Anmeldung wird gerade eingerichtet."));
  }
  const result = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  if (!result.success) {
    redirect(messageUrl("/login", "error", result.error.issues[0]?.message ?? "Ungültige Eingabe."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);
  if (error) {
    redirect(messageUrl("/login", "error", "E-Mail oder Passwort ist nicht korrekt."));
  }
  redirect(safeRedirectPath(formData.get("next")));
}

export async function register(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect(messageUrl("/register", "error", "Die Registrierung wird gerade eingerichtet."));
  }
  const result = credentialsSchema
    .extend({
      fullName: z.string().trim().min(2, "Bitte geben Sie Ihren vollständigen Namen ein."),
      company: z.string().trim().min(2, "Bitte geben Sie Ihr Unternehmen an.")
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      fullName: formData.get("fullName"),
      company: formData.get("company")
    });

  if (!result.success) {
    redirect(messageUrl("/register", "error", result.error.issues[0]?.message ?? "Ungültige Eingabe."));
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? getSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/dealroom`,
      data: {
        full_name: result.data.fullName,
        company_name: result.data.company
      }
    }
  });

  if (error) {
    redirect(messageUrl("/register", "error", "Das Konto konnte nicht angelegt werden."));
  }
  redirect(
    messageUrl(
      "/login",
      "notice",
      "Prüfen Sie Ihr E-Mail-Postfach und bestätigen Sie Ihre Adresse."
    )
  );
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect(messageUrl("/forgot-password", "error", "Der Passwortdienst wird gerade eingerichtet."));
  }
  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) {
    redirect(messageUrl("/forgot-password", "error", "Bitte geben Sie eine gültige E-Mail-Adresse ein."));
  }
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${getSiteUrl()}/auth/update-password`
  });
  redirect(
    messageUrl(
      "/forgot-password",
      "notice",
      "Wenn ein Konto existiert, wurde eine sichere E-Mail versendet."
    )
  );
}

export async function updatePassword(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect(messageUrl("/auth/update-password", "error", "Der Passwortdienst wird gerade eingerichtet."));
  }
  const password = z
    .string()
    .min(10, "Das Passwort muss mindestens 10 Zeichen enthalten.")
    .safeParse(formData.get("password"));
  if (!password.success) {
    redirect(messageUrl("/auth/update-password", "error", password.error.issues[0]?.message ?? "Ungültiges Passwort."));
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) {
    redirect(messageUrl("/auth/update-password", "error", "Das Passwort konnte nicht aktualisiert werden."));
  }
  redirect(messageUrl("/login", "notice", "Ihr Passwort wurde aktualisiert."));
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
