import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/400.css";
import "./globals.css";
import "./coridoor-10.css";
import { getSiteUrl } from "@/lib/env";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Coridoor — Buyer-side Transaction Intelligence",
    template: "%s | Coridoor"
  },
  description:
    "Erkennen Sie vor dem Verkaufsprozess, wo Käufer Verhandlungsdruck aufbauen werden. Der Coridoor Buyer Objection Report macht Risiken, Beweislücken und Deal-Folgen sichtbar.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Coridoor",
    title: "Coridoor — Buyer-side Transaction Intelligence",
    description:
      "Priorisierte Käuferargumente, Beweislücken und mögliche Deal-Folgen – vor dem offiziellen Verkaufsprozess."
  },
  twitter: {
    card: "summary_large_image",
    title: "Coridoor — Buyer-side Transaction Intelligence",
    description:
      "Welche Argumente könnte ein Käufer heute gegen Ihren Deal verwenden?"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f1ea",
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Coridoor",
    url: siteUrl,
    description:
      "Buyer-side Transaction Intelligence und strukturierte Vorschau auf Käuferargumente."
  };

  return (
    <html lang="de">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
