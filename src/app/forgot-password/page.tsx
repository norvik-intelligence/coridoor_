import type { Metadata } from "next";
import { AuthMessage, AuthShell } from "@/components/auth/auth-shell";
import { requestPasswordReset } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen",
  robots: { index: false, follow: false }
};

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      title="Zugang wiederherstellen."
      intro="Sie erhalten einen zeitlich begrenzten Link. Aus Sicherheitsgründen bestätigen wir nicht, ob eine E-Mail-Adresse registriert ist."
    >
      <AuthMessage error={params.error} notice={params.notice} />
      <form action={requestPasswordReset} className="auth-form">
        <label>
          E-Mail-Adresse
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <button className="button button-dark" type="submit">
          Reset-Link anfordern
        </button>
      </form>
    </AuthShell>
  );
}
