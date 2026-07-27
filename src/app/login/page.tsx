import type { Metadata } from "next";
import Link from "next/link";
import { AuthMessage, AuthShell } from "@/components/auth/auth-shell";
import { login } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Einloggen",
  robots: { index: false, follow: false }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; notice?: string; next?: string }>;
}) {
  const params = await searchParams;
  const notice =
    params.notice === "setup"
      ? "Die sichere Datenbankverbindung wird gerade eingerichtet. Die öffentliche Website ist bereits verfügbar."
      : params.notice;

  return (
    <AuthShell
      title="Willkommen zurück."
      intro="Öffnen Sie Ihr aktives Engagement, beantworten Sie Rückfragen oder laden Sie freigegebene Ergebnisse herunter."
    >
      <AuthMessage error={params.error} notice={notice} />
      <form action={login} className="auth-form">
        <input type="hidden" name="next" value={params.next ?? "/dealroom"} />
        <label>
          E-Mail-Adresse
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span className="label-row">
            Passwort
            <Link href="/forgot-password">Passwort vergessen?</Link>
          </span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="button button-dark" type="submit">Sicher einloggen</button>
      </form>
      <p className="auth-switch">
        Noch kein Zugang? <Link href="/register">Vertrauliche Analyse anfragen</Link>
      </p>
    </AuthShell>
  );
}
