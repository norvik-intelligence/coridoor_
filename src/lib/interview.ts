import type { InterviewQuestion } from "@/lib/types";

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "company_legal_name",
    section: "company",
    sectionTitle: "Unternehmensprofil",
    label: "Vollständige Firmierung",
    kind: "text",
    required: true
  },
  {
    id: "company_industry",
    section: "company",
    sectionTitle: "Unternehmensprofil",
    label: "Branche und Kernleistung",
    description: "Beschreiben Sie knapp, womit das Unternehmen den überwiegenden Umsatz erzielt.",
    kind: "textarea",
    required: true
  },
  {
    id: "revenue_current",
    section: "financials",
    sectionTitle: "Finanzielle Entwicklung",
    label: "Umsatz des letzten abgeschlossenen Geschäftsjahres",
    kind: "currency",
    required: true
  },
  {
    id: "ebitda_current",
    section: "financials",
    sectionTitle: "Finanzielle Entwicklung",
    label: "Bereinigtes EBITDA des letzten Geschäftsjahres",
    kind: "currency",
    required: true
  },
  {
    id: "adjustments_present",
    section: "earnings",
    sectionTitle: "Ergebnisqualität",
    label: "Enthält das Ergebnis Bereinigungen?",
    kind: "boolean",
    required: true
  },
  {
    id: "adjustments_detail",
    section: "earnings",
    sectionTitle: "Ergebnisqualität",
    label: "Art, Betrag und Beleglage der Bereinigungen",
    description: "Trennen Sie wiederkehrende von einmaligen Effekten.",
    kind: "textarea",
    required: true,
    condition: {
      questionId: "adjustments_present",
      operator: "equals",
      value: true
    }
  },
  {
    id: "largest_customer_share",
    section: "customers",
    sectionTitle: "Kundenstruktur",
    label: "Umsatzanteil des größten Kunden",
    kind: "percent",
    required: true
  },
  {
    id: "largest_customer_contract",
    section: "customers",
    sectionTitle: "Kundenstruktur",
    label: "Vertragslaufzeit, Kündigungsfrist und Wechselkosten",
    kind: "textarea",
    required: true,
    condition: {
      questionId: "largest_customer_share",
      operator: "greaterThan",
      value: 20
    }
  },
  {
    id: "revenue_model",
    section: "commercial",
    sectionTitle: "Umsatzwiederholung und Verträge",
    label: "Umsatzmodell",
    kind: "multiple",
    required: true,
    options: [
      "Wiederkehrende Verträge",
      "Rahmenverträge",
      "Projektgeschäft",
      "Transaktionsbasiert",
      "Einmalverkauf"
    ]
  },
  {
    id: "pipeline_quality",
    section: "commercial",
    sectionTitle: "Vertrieb und Pipeline",
    label: "Wie belastbar ist die dokumentierte Vertriebspipeline?",
    kind: "single",
    required: true,
    options: ["CRM-basiert und gewichtet", "Teilweise dokumentiert", "Überwiegend informell"]
  },
  {
    id: "founder_sales",
    section: "dependency",
    sectionTitle: "Founder Dependency",
    label: "Übernimmt der Inhaber zentrale Vertriebsaktivitäten?",
    kind: "boolean",
    required: true
  },
  {
    id: "founder_sales_share",
    section: "dependency",
    sectionTitle: "Founder Dependency",
    label: "Anteil persönlich gewonnener oder betreuter Kunden",
    kind: "percent",
    required: true,
    condition: {
      questionId: "founder_sales",
      operator: "equals",
      value: true
    }
  },
  {
    id: "management_depth",
    section: "management",
    sectionTitle: "Management und Schlüsselpersonen",
    label: "Welche Funktionen können sechs Monate ohne den Inhaber operieren?",
    kind: "textarea",
    required: true
  },
  {
    id: "core_processes",
    section: "operations",
    sectionTitle: "Operative Prozesse",
    label: "Welche Kernprozesse sind dokumentiert und vertretbar?",
    kind: "textarea",
    required: true
  },
  {
    id: "reporting_close",
    section: "data",
    sectionTitle: "Datenqualität und Reporting",
    label: "Zeit bis zum belastbaren Monatsabschluss",
    kind: "single",
    required: true,
    options: ["Bis 10 Arbeitstage", "11–20 Arbeitstage", "Mehr als 20 Arbeitstage", "Kein standardisierter Abschluss"]
  },
  {
    id: "systems",
    section: "technology",
    sectionTitle: "Technologie und Systeme",
    label: "Geschäftskritische Systeme und bekannte Abhängigkeiten",
    kind: "textarea",
    required: true
  },
  {
    id: "open_risks",
    section: "risks",
    sectionTitle: "Offene Risiken",
    label: "Welche Themen würde ein kritischer Käufer zuerst ansprechen?",
    kind: "textarea",
    required: true
  },
  {
    id: "confirmation",
    section: "review",
    sectionTitle: "Review und Bestätigung",
    label: "Ich bestätige, dass die Angaben nach bestem Wissen vollständig sind.",
    kind: "boolean",
    required: true
  }
];

export const interviewSections = Array.from(
  new Map(
    interviewQuestions.map((question) => [
      question.section,
      { id: question.section, title: question.sectionTitle }
    ])
  ).values()
);

export function isQuestionVisible(
  question: InterviewQuestion,
  answers: Record<string, unknown>
) {
  if (!question.condition) return true;
  const currentValue = answers[question.condition.questionId];
  if (question.condition.operator === "equals") {
    return currentValue === question.condition.value;
  }
  if (question.condition.operator === "includes") {
    return Array.isArray(currentValue) && currentValue.includes(question.condition.value);
  }
  return Number(currentValue) > Number(question.condition.value);
}
