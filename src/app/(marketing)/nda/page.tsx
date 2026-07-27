import type { Metadata } from "next";
import { ContentHero, ContentSection } from "@/components/marketing/content-page";

export const metadata: Metadata = {
  title: "Verschwiegenheitsvereinbarung",
  description: "Technische Vorschau der im Coridoor-Mandantenprozess verwendeten NDA.",
  alternates: { canonical: "/nda" },
  robots: { index: false, follow: true }
};

export default function NdaPage() {
  return (
    <>
      <ContentHero
        eyebrow="NDA · technische Vorlage"
        title={<>Verschwiegenheit vor der <em>Datenübermittlung.</em></>}
        intro="Der verbindliche NDA-Text wird im persönlichen Deal Room vollständig angezeigt und muss vor sensiblen Angaben aktiv akzeptiert werden."
        action={false}
      />
      <ContentSection index="01" title="Wichtiger rechtlicher Hinweis">
        <p className="legal-note">
          Der nachfolgend beschriebene Inhalt ist eine technische
          Strukturvorlage und noch keine anwaltlich freigegebene
          Verschwiegenheitsvereinbarung. Vor operativer Nutzung muss die finale
          Fassung durch qualifizierte Rechtsberatung geprüft und als versionierter
          Text in Coridoor hinterlegt werden.
        </p>
      </ContentSection>
      <ContentSection index="02" title="Technisch erfasste Zustimmung">
        <p>
          Bei der Annahme werden Nutzer, Engagement, Versionsnummer,
          Zeitstempel, eindeutiger Hash der Textfassung und – soweit rechtlich
          vorgesehen – technische Zugriffsinformationen protokolliert. Das
          Kontrollkästchen ist nie vorausgewählt.
        </p>
        <p>
          Eine spätere Änderung des Textes überschreibt keine frühere Annahme.
          Jede Fassung bleibt über ihre unveränderliche Versionsreferenz
          nachvollziehbar.
        </p>
      </ContentSection>
    </>
  );
}
