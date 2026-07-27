import type { Metadata } from "next";
import Link from "next/link";
import { AuthMessage, AuthShell } from "@/components/auth/auth-shell";
import { register } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Analyse anfragen",
  robots: { index: false, follow: false }
};

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      title="Vertrauliche Mandatsanfrage."
      intro="Legen Sie Ihren persönlichen Zugang an. Nach E-Mail-Bestätigung startet der geschützte Intake-Prozess."
    >
      <AuthMessage error={params.error} />
      <form action={register} className="auth-form auth-form-grid">
        <label>
          Vollständiger Name
          <input name="fullName" type="text" autoComplete="name" required />
        </label>
        <label>
          Unternehmen
          <input name="company" type="text" autoComplete="organization" required />
        </label>
        <label className="form-span">
          Geschäftliche E-Mail-Adresse
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="form-span">
          Passwort
          <input
            name="password"
            type="password"
            minLength={10}
            autoComplete="new-password"
            aria-describedby="password-help"
            required
          />
          <small id="password-help">Mindestens 10 Zeichen.</small>
        </label>
        <label className="checkbox-label form-span">
          <input name="privacy" type="checkbox" required />
          <span>
            Ich habe die <Link href="/privacy">Datenschutzhinweise</Link> gelesen.
            Die NDA wird separat vor sensiblen Angaben akzeptiert.
          </span>
        </label>
        <button className="button button-dark form-span" type="submit">
          Zugang anlegen
        </button>
      </form>
      <p className="auth-switch">
        Bereits registriert? <Link href="/login">Einloggen</Link>
      </p>
    </AuthShell>
  );
}
