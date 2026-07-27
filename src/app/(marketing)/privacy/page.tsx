import type { Metadata } from "next";
import { ContentHero, ContentSection } from "@/components/marketing/content-page";

export const metadata: Metadata = {
  title: "Datenschutz",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true }
};

export default function PrivacyPage() {
  return (
    <>
      <ContentHero
        eyebrow="Datenschutz"
        title={<>Transparenz über Daten, <em>Zweck und Zugriff.</em></>}
        intro="Diese Seite beschreibt die technische Datenverarbeitung des Coridoor-Mandantenprozesses. Betreiberangaben, Rechtsgrundlagen und Aufbewahrungsfristen sind vor Live-Betrieb rechtlich zu finalisieren."
        action={false}
      />
      <ContentSection index="01" title="Verarbeitete Daten">
        <p>
          Kontaktdaten, Organisations- und Mandatsangaben,
          Interviewantworten, Dokumentmetadaten, hochgeladene Dateien,
          Rückfragen, Freigaben sowie sparsame Sicherheits- und Auditdaten.
        </p>
      </ContentSection>
      <ContentSection index="02" title="Zweck und Empfänger">
        <p>
          Die Verarbeitung dient der Durchführung des angefragten Buyer
          Objection Reports, der sicheren Bereitstellung von Ergebnissen und der
          Nachvollziehbarkeit sicherheitsrelevanter Aktionen. Technische
          Auftragsverarbeiter werden erst in der finalen Datenschutzerklärung
          mit Rolle, Standort und Vertragsgrundlage vollständig benannt.
        </p>
      </ContentSection>
      <ContentSection index="03" title="Ihre Rechte">
        <p>
          Betroffene Personen können – abhängig von der anwendbaren
          Rechtsgrundlage – Auskunft, Berichtigung, Löschung, Einschränkung,
          Datenübertragbarkeit oder Widerspruch verlangen. Der verantwortliche
          Betreiber und die rechtsverbindliche Kontaktadresse müssen vor dem
          öffentlichen Start ergänzt werden.
        </p>
      </ContentSection>
    </>
  );
}
