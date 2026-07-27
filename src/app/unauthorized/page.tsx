import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default async function UnauthorizedPage({
  searchParams
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const suspended = reason === "suspended";
  return (
    <main className="system-page">
      <Logo />
      <div>
        <LockKeyhole size={27} strokeWidth={1.4} aria-hidden="true" />
        <p className="eyebrow">Zugriff verweigert</p>
        <h1>
          {suspended
            ? "Dieser Zugang wurde vorübergehend gesperrt."
            : "Dieser Bereich ist für Ihren Zugang nicht freigegeben."}
        </h1>
        <p>
          {suspended
            ? "Bitte wenden Sie sich über den im Impressum genannten Kontakt an Coridoor."
            : "Mandats- und Adminrechte werden serverseitig geprüft. Melden Sie sich mit dem korrekten Konto an."}
        </p>
        <Link className="button button-dark" href={suspended ? "/" : "/dealroom"}>
          {suspended ? "Zur Startseite" : "Zum Deal Room"}
        </Link>
      </div>
    </main>
  );
}
