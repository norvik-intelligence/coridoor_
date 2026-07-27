import type { Metadata } from "next";
import { Check, LockKeyhole, ScrollText, ShieldCheck } from "lucide-react";
import { ContentHero, ContentSection } from "@/components/marketing/content-page";

export const metadata: Metadata = {
  title: "Vertraulichkeit und Sicherheit",
  description:
    "Technisches Sicherheitsmodell für Konten, private Dokumente, mandantenbezogene Zugriffskontrolle und kontrollierte Ergebnisfreigabe.",
  alternates: { canonical: "/security" }
};

export default function SecurityPage() {
  return (
    <>
      <ContentHero
        eyebrow="Sicherheitskonzept"
        title={<>Kontrollierter Zugang zu <em>sensiblen Transaktionsdaten.</em></>}
        intro="Coridoor setzt auf individuelle Konten, private Speicherung, Datenbankregeln pro Mandat und eine manuelle Freigabe finaler Ergebnisse."
        action={false}
      />
      <section className="security-principles shell">
        {[
          {
            icon: LockKeyhole,
            title: "Private by default",
            text: "Dokumente liegen in einem nicht öffentlichen Storage-Bucket. Downloads werden nur nach Berechtigungsprüfung über kurzlebige Links bereitgestellt."
          },
          {
            icon: ShieldCheck,
            title: "Tenant isolation",
            text: "Row Level Security trennt Organisationen, Engagements, Antworten und Dokumente auf Datenbankebene."
          },
          {
            icon: ScrollText,
            title: "Controlled release",
            text: "Analysebefunde und Deliverables bleiben unsichtbar, bis ein autorisierter Coridoor-Admin sie manuell veröffentlicht."
          }
        ].map(({ icon: Icon, ...item }, index) => (
          <article key={item.title}>
            <span>0{index + 1}</span>
            <Icon aria-hidden="true" size={26} strokeWidth={1.3} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
      <ContentSection index="01" title="Zugriffskontrolle">
        <ul className="check-list">
          {[
            "E-Mail-Verifizierung und serverseitig validierte Sitzungen",
            "Adminrollen können nicht über das Frontend vergeben werden",
            "Kunden sehen ausschließlich ihre Organisations- und Engagementdaten",
            "Interne Notizen und unveröffentlichte Befunde sind für Kunden gesperrt",
            "Service- und Secret-Keys werden niemals an den Browser ausgeliefert",
            "Geschützte Routen verwenden private No-Store-Antworten"
          ].map((item) => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}
        </ul>
      </ContentSection>
      <ContentSection index="02" title="Dokumente und Nachvollziehbarkeit">
        <p>
          Uploads werden nach Dateiendung, MIME-Type und Größenlimit geprüft.
          Aktive Inhalte, Makrodateien, Archive und ausführbare Formate werden
          standardmäßig abgelehnt. Dokumentmetadaten, Versionen und relevante
          Aktionen werden mandatsbezogen protokolliert.
        </p>
        <p className="legal-note">
          Coridoor behauptet keine externe Zertifizierung oder formale
          Compliance-Eigenschaft, solange diese nicht unabhängig nachgewiesen
          wurde. Das technische Konzept ersetzt keine individuelle
          Datenschutz-Folgenabschätzung.
        </p>
      </ContentSection>
    </>
  );
}
