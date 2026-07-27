import { Download, FileText } from "lucide-react";
import { DocumentUploader } from "@/components/dealroom/document-uploader";
import { EmptyState, StatusTag, WorkspaceHeader } from "@/components/dealroom/workspace";
import { getActiveEngagement } from "@/lib/auth";
import type { DocumentCategory, DocumentRecord } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const params = await searchParams;
  const { supabase, engagement } = await getActiveEngagement();
  if (!engagement) {
    return (
      <div className="workspace-page">
        <WorkspaceHeader eyebrow="Documents" title="Dokumente" />
        <EmptyState title="Kein aktives Engagement">Dokumente werden mandatsbezogen verwaltet.</EmptyState>
      </div>
    );
  }
  const [{ data: requests }, { data: documents }] = await Promise.all([
    supabase
      .from("document_requests")
      .select("id, title, description, category, status, is_required")
      .eq("engagement_id", engagement.id)
      .order("sort_order"),
    supabase
      .from("documents")
      .select("*")
      .eq("engagement_id", engagement.id)
      .order("created_at", { ascending: false })
  ]);

  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow="Private document storage"
        title="Documents"
        description="Dateien werden direkt in den privaten Mandantenspeicher übertragen. Es werden keine öffentlichen Datei-URLs erzeugt."
      />
      {params.notice && <div className="form-message">{params.notice}</div>}
      <section className="document-checklist">
        <div className="workspace-section-head">
          <div><p className="micro-label">Anforderungsliste</p><h2>Erforderliche Nachweise</h2></div>
          <span>{requests?.filter((request) => request.status === "uploaded" || request.status === "accepted").length ?? 0} / {requests?.length ?? 0}</span>
        </div>
        <div className="document-request-list">
          {(requests ?? []).map((request, index) => (
            <div key={request.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{request.title}</strong><small>{request.description}</small></div>
              <StatusTag tone={request.status === "accepted" ? "positive" : request.status === "uploaded" ? "attention" : "neutral"}>
                {request.status.replaceAll("_", " ")}
              </StatusTag>
            </div>
          ))}
        </div>
      </section>
      <DocumentUploader
        engagementId={engagement.id}
        maxSizeMb={Number(process.env.MAX_UPLOAD_SIZE_MB ?? 25)}
        organisationId={engagement.organisation_id}
        requestOptions={(requests ?? []).map((request) => ({
          id: request.id,
          title: request.title,
          category: request.category as DocumentCategory
        }))}
      />
      <section className="workspace-panel document-library">
        <div className="workspace-section-head">
          <div><p className="micro-label">Mandatsbibliothek</p><h2>Hochgeladene Dateien</h2></div>
        </div>
        {(documents ?? []).length === 0 ? (
          <EmptyState title="Noch keine Dokumente">
            Hochgeladene Unterlagen erscheinen mit Version, Status und sicherem Download in dieser Liste.
          </EmptyState>
        ) : (
          <div className="document-table-wrap">
            <table className="document-table">
              <thead><tr><th>Datei</th><th>Kategorie</th><th>Version</th><th>Upload</th><th>Status</th><th><span className="sr-only">Aktion</span></th></tr></thead>
              <tbody>
                {(documents as DocumentRecord[]).map((document) => (
                  <tr key={document.id}>
                    <td><FileText size={17} strokeWidth={1.5} aria-hidden="true" /><span>{document.original_filename}<small>{formatBytes(document.file_size)}</small></span></td>
                    <td>{document.category}</td>
                    <td>v{document.current_version}</td>
                    <td>{formatDate(document.created_at)}</td>
                    <td><StatusTag tone={document.status === "accepted" ? "positive" : "attention"}>{document.status.replaceAll("_", " ")}</StatusTag></td>
                    <td><a aria-label={`${document.original_filename} herunterladen`} href={`/api/documents/${document.id}/download`}><Download size={16} /></a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
