import Link from "next/link";
import { Check, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function AuthShell({
  title,
  intro,
  children
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <Logo />
          <div className="auth-heading">
            <p className="eyebrow">Secure mandate access</p>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
          {children}
          <Link className="auth-back" href="/">← Zurück zur Website</Link>
        </div>
      </section>
      <aside className="auth-aside">
        <div className="auth-aside-top">
          <LockKeyhole size={28} strokeWidth={1.4} aria-hidden="true" />
          <span>Protected client access</span>
        </div>
        <div className="auth-quote">
          <p>
            „Sensible Transaktionsdaten gehören in einen kontrollierten
            Mandantenprozess – nicht in E-Mail-Anhänge und offene Formulare.“
          </p>
        </div>
        <div className="auth-assurances">
          {[
            "Individuelles Kundenkonto",
            "NDA vor sensiblen Angaben",
            "Private Dokumentenspeicherung",
            "Manuelle Ergebnisfreigabe"
          ].map((item) => (
            <span key={item}><Check size={14} aria-hidden="true" />{item}</span>
          ))}
        </div>
      </aside>
    </main>
  );
}

export function AuthMessage({
  error,
  notice
}: {
  error?: string;
  notice?: string;
}) {
  const message = error ?? notice;
  if (!message) return null;
  return (
    <div className={error ? "form-message form-message-error" : "form-message"}>
      {message}
    </div>
  );
}
