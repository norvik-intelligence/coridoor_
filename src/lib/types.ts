export type UserRole = "client" | "advisor" | "admin";

export type EngagementStatus =
  | "setup_required"
  | "interview_in_progress"
  | "documents_outstanding"
  | "documents_under_review"
  | "clarifications_open"
  | "analysis_in_progress"
  | "quality_assurance"
  | "results_available"
  | "completed"
  | "archived";

export type DocumentStatus =
  | "requested"
  | "uploaded"
  | "under_review"
  | "clarification_required"
  | "accepted"
  | "rejected"
  | "not_applicable";

export type DocumentCategory =
  | "corporate"
  | "financial"
  | "customers"
  | "commercial"
  | "management"
  | "operations"
  | "legal"
  | "tax"
  | "technology"
  | "contracts"
  | "other";

export type QuestionKind =
  | "text"
  | "textarea"
  | "number"
  | "percent"
  | "currency"
  | "date"
  | "boolean"
  | "single"
  | "multiple";

export interface InterviewQuestion {
  id: string;
  section: string;
  sectionTitle: string;
  label: string;
  description?: string;
  kind: QuestionKind;
  required?: boolean;
  options?: string[];
  condition?: {
    questionId: string;
    operator: "equals" | "includes" | "greaterThan";
    value: string | number | boolean;
  };
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
}

export interface Engagement {
  id: string;
  organisation_id: string;
  client_owner_id: string;
  title: string;
  status: EngagementStatus;
  delivery_due_at: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  engagement_id: string;
  original_filename: string;
  sanitized_filename: string;
  mime_type: string;
  file_size: number;
  category: DocumentCategory;
  status: DocumentStatus;
  current_version: number;
  created_at: string;
}

export interface Deliverable {
  id: string;
  engagement_id: string;
  type: string;
  title: string;
  status: "draft" | "published" | "withdrawn";
  version: number;
  published_at: string | null;
  storage_path: string | null;
}
