import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { WorkspaceHeader } from "@/components/dealroom/workspace";

export default async function AdminOverview() {
  const { supabase } = await requireAdmin();
  const [
    { count: active },
    { count: submitted },
    { count: questions },
    { count: due },
    { data: engagements }
  ] = await Promise.all([
    supabase.from("engagements").select("*", { count: "exact", head: true }).not("status", "in", '("completed","archived")'),
    supabase.from("questionnaire_responses").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("clarification_threads").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("engagements").select("*", { count: "exact", head: true }).in("status", ["analysis_in_progress", "quality_assurance"]),
    supabase.from("engagements").select("id, title, status, delivery_due_at, created_at, organisations(name)").order("created_at", { ascending: false }).limit(6)
  ]);
  const metrics = [
    ["Aktive Engagements", active ?? 0],
    ["Interview vollständig", submitted ?? 0],
    ["Rückfragen offen", questions ?? 0],
    ["Lieferung anstehend", due ?? 0]
  ];
  return (
    <div className="workspace-page">
      <WorkspaceHeader eyebrow="Internal operations" title="Transaction Desk" description="Aktive Mandate, Fristen und kontrollierte Veröffentlichungen in einer operativen Sicht." />
      <section className="admin-metrics">
        {metrics.map(([label, value]) => <article key={String(label)}><p>{label}</p><strong>{value}</strong></article>)}
      </section>
      <section className="workspace-panel admin-recent">
        <div className="workspace-section-head"><div><p className="micro-label">Priorität</p><h2>Neueste Engagements</h2></div><Link href="/admin/engagements">Alle öffnen →</Link></div>
        {(engagements ?? []).map((engagement) => (
          <Link href={`/admin/engagements/${engagement.id}`} key={engagement.id}>
            <span>{(engagement.organisations as unknown as { name: string } | null)?.name ?? "Organisation"}</span>
            <strong>{engagement.title}</strong>
            <small>{engagement.status.replaceAll("_", " ")}</small>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        ))}
      </section>
    </div>
  );
}
