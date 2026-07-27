import "server-only";

import { getServerEnv, getSiteUrl } from "@/lib/env";

type EmailKind =
  | "nda_accepted"
  | "interview_submitted"
  | "clarification_created"
  | "clarification_answered"
  | "results_available";

const copy: Record<EmailKind, { subject: string; heading: string; body: string; cta: string }> = {
  nda_accepted: {
    subject: "NDA-Akzeptanz bestätigt",
    heading: "Ihre Zustimmung wurde protokolliert.",
    body: "Die akzeptierte Version bleibt mit Zeitstempel und eindeutiger Textreferenz in Ihrem Engagement hinterlegt.",
    cta: "Executive Interview öffnen"
  },
  interview_submitted: {
    subject: "Executive Interview eingereicht",
    heading: "Der strukturierte Intake ist eingegangen.",
    body: "Die Antworten sind für die interne Prüfung gesperrt. Fehlende Nachweise oder gezielte Rückfragen werden im Deal Room angezeigt.",
    cta: "Deal Room öffnen"
  },
  clarification_created: {
    subject: "Neue Rückfrage zu Ihrem Engagement",
    heading: "Coridoor benötigt eine gezielte Ergänzung.",
    body: "Die Rückfrage und ihr Kontext stehen geschützt im Bereich Open Questions bereit. Antworten Sie bitte direkt dort.",
    cta: "Rückfrage öffnen"
  },
  clarification_answered: {
    subject: "Rückfrage wurde beantwortet",
    heading: "Eine Mandatsrückfrage hat eine neue Antwort.",
    body: "Die Antwort ist im internen Engagement-Bereich verfügbar.",
    cta: "Engagement öffnen"
  },
  results_available: {
    subject: "Ergebnisse in Ihrem Deal Room verfügbar",
    heading: "Die Qualitätskontrolle ist abgeschlossen.",
    body: "Die ausdrücklich freigegebenen Deliverables stehen ab sofort in Ihrem persönlichen Deal Room bereit.",
    cta: "Deliverables öffnen"
  }
};

export async function sendTransactionalEmail(input: {
  to: string | string[];
  kind: EmailKind;
  href: string;
}) {
  const env = getServerEnv();
  if (!env.RESEND_API_KEY || !input.to || (Array.isArray(input.to) && input.to.length === 0)) {
    return { delivered: false, reason: "not_configured" } as const;
  }
  const message = copy[input.kind];
  const link = new URL(input.href, getSiteUrl()).toString();
  const html = `
    <div style="background:#f4f3ee;padding:40px 18px;font-family:Arial,sans-serif;color:#081426">
      <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #dfe3e6;padding:42px">
        <div style="font-size:22px;font-weight:700;margin-bottom:58px">Coridoor</div>
        <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7d8794;margin-bottom:18px">Secure mandate notice</div>
        <h1 style="font-size:34px;line-height:1.08;letter-spacing:-.04em;font-weight:500">${message.heading}</h1>
        <p style="font-size:15px;line-height:1.7;color:#4d5869;margin:24px 0 32px">${message.body}</p>
        <a href="${link}" style="display:inline-block;background:#081426;color:#fff;text-decoration:none;padding:14px 18px;border-radius:6px;font-size:13px">${message.cta}</a>
        <p style="font-size:11px;line-height:1.6;color:#7d8794;margin-top:55px;border-top:1px solid #dfe3e6;padding-top:18px">Diese Nachricht enthält keine sensiblen Mandatsdaten. Öffnen Sie Details ausschließlich über Ihren persönlichen Zugang.</p>
      </div>
    </div>`;
  const text = `Coridoor\n\n${message.heading}\n\n${message.body}\n\n${message.cta}: ${link}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: input.to,
      subject: message.subject,
      html,
      text
    }),
    cache: "no-store"
  });
  return { delivered: response.ok } as const;
}
