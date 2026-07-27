import type { Metadata } from "next";
import { AuthMessage, AuthShell } from "@/components/auth/auth-shell";
import { updatePassword } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Neues Passwort",
  robots: { index: false, follow: false }
};

export default async function UpdatePasswordPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      title="Neues Passwort festlegen."
      intro="Wählen Sie ein einmaliges Passwort mit mindestens 10 Zeichen."
    >
      <AuthMessage error={params.error} />
      <form action={updatePassword} className="auth-form">
        <label>
          Neues Passwort
          <input name="password" type="password" minLength={10} autoComplete="new-password" required />
        </label>
        <button className="button button-dark" type="submit">
          Passwort aktualisieren
        </button>
      </form>
    </AuthShell>
  );
}
