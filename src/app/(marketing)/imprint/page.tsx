import type { Metadata } from "next";
import { ContentHero, ContentSection } from "@/components/marketing/content-page";

export const metadata: Metadata = {
  title: "Impressum",
  alternates: { canonical: "/imprint" },
  robots: { index: false, follow: true }
};

export default function ImprintPage() {
  return (
    <>
      <ContentHero
        eyebrow="Impressum"
        title={<>Rechtliche <em>Betreiberangaben.</em></>}
        intro="Die endgültigen Angaben hängen von der Betreibergesellschaft und deren Sitz ab."
        action={false}
      />
      <ContentSection index="01" title="Vor Veröffentlichung zu finalisieren">
        <p className="legal-note">
          Firmenname, Rechtsform, vertretungsberechtigte Person, ladungsfähige
          Anschrift, Registergericht, Registernummer, Umsatzsteuer-ID und
          berufsrechtliche Angaben liegen im Projekt noch nicht verifiziert vor.
          Sie werden bewusst nicht erfunden und müssen vor öffentlichem
          Live-Betrieb verbindlich ergänzt werden.
        </p>
        <p>
          Kontakt für Produktanfragen:{" "}
          <a className="inline-link" href="mailto:contact@coridoor.de">
            contact@coridoor.de
          </a>
        </p>
      </ContentSection>
    </>
  );
}
