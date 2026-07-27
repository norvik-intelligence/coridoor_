import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { StatusTag, WorkspaceHeader } from "@/components/dealroom/workspace";

export default async function EngagementsPage() {
  const { supabase } = await requireAdmin();
  const { data: engagements } = await supabase
    .from("engagements")
    .select("id, title, status, delivery_due_at, created_at, organisations(name), profiles!engagements_client_owner_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });
  return (
    <div className="workspace-page">
      <WorkspaceHeader eyebrow="Mandatssteuerung" title="Engagements" description="Status, Intake, Analyse und Freigabe pro Mandat." />
      <section className="workspace-panel document-table-wrap">
        <table className="document-table admin-table">
          <thead><tr><th>Engagement</th><th>Organisation</th><th>Mandant</th><th>Status</th><th>Lieferung</th></tr></thead>
          <tbody>
            {(engagements ?? []).map((engagement) => (
              <tr key={engagement.id}>
                <td><Link href={`/admin/engagements/${engagement.id}`}>{engagement.title}</Link></td>
                <td>{(engagement.organisations as unknown as { name: string } | null)?.name}</td>
                <td>{(engagement.profiles as unknown as { full_name: string | null; email: string } | null)?.full_name ?? (engagement.profiles as unknown as { email: string } | null)?.email}</td>
                <td><StatusTag tone="attention">{engagement.status.replaceAll("_", " ")}</StatusTag></td>
                <td>{formatDate(engagement.delivery_due_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
