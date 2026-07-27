import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { WorkspaceHeader } from "@/components/dealroom/workspace";

export default async function AuditPage() {
  const { supabase } = await requireAdmin();
  const { data: logs } = await supabase.from("audit_logs").select("id, action, entity_type, entity_id, created_at, profiles(full_name, email)").order("created_at", { ascending: false }).limit(200);
  return (
    <div className="workspace-page">
      <WorkspaceHeader eyebrow="Security trail" title="Audit Log" description="Relevante Aktionen ohne unnötige sensible Inhalte. Die Sicht ist ausschließlich intern." />
      <section className="workspace-panel document-table-wrap">
        <table className="document-table admin-table"><thead><tr><th>Aktion</th><th>Akteur</th><th>Objekt</th><th>ID</th><th>Zeitpunkt</th></tr></thead><tbody>
          {(logs ?? []).map((log) => { const actor = log.profiles as unknown as { full_name: string | null; email: string } | null; return <tr key={log.id}><td>{log.action}</td><td>{actor?.full_name ?? actor?.email ?? "System"}</td><td>{log.entity_type ?? "—"}</td><td>{log.entity_id?.slice(0, 12) ?? "—"}</td><td>{formatDate(log.created_at)}</td></tr>; })}
        </tbody></table>
      </section>
    </div>
  );
}
