import type { EngagementStatus } from "@/lib/types";

const statusLabels: Record<EngagementStatus, string> = {
  setup_required: "Setup erforderlich",
  interview_in_progress: "Interview läuft",
  documents_outstanding: "Unterlagen ausstehend",
  documents_under_review: "Unterlagen in Prüfung",
  clarifications_open: "Rückfragen offen",
  analysis_in_progress: "Analyse läuft",
  quality_assurance: "Qualitätssicherung",
  results_available: "Ergebnisse verfügbar",
  completed: "Abgeschlossen",
  archived: "Archiviert"
};

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function statusLabel(status: EngagementStatus) {
  return statusLabels[status];
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Noch nicht festgelegt";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

const unsafeFilename = /[^a-zA-Z0-9._-]+/g;

export function sanitizeFilename(filename: string) {
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  const extension = dot > 0 ? filename.slice(dot).toLowerCase() : "";
  const cleanBase = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(unsafeFilename, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .slice(0, 96);
  return `${cleanBase || "document"}${extension}`;
}

export function calculateProgress(
  answers: Record<string, unknown>,
  requiredQuestionIds: string[]
) {
  if (requiredQuestionIds.length === 0) return 0;
  const answered = requiredQuestionIds.filter((id) => {
    const value = answers[id];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== "";
  }).length;
  return Math.round((answered / requiredQuestionIds.length) * 100);
}
