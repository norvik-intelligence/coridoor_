import { requireAdmin } from "@/lib/auth";
import { setUserSuspension } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import { StatusTag, WorkspaceHeader } from "@/components/dealroom/workspace";

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, role, access_suspended_at, created_at").order("created_at", { ascending: false });
  return (
    <div className="workspace-page">
      <WorkspaceHeader eyebrow="Access control" title="Users" description="Rollen werden nicht über das Kundenfrontend vergeben. Änderungen erfolgen ausschließlich über kontrollierte Admin-Prozesse." />
      {query.error ? <div className="form-message form-message-error">{query.error}</div> : null}
      <section className="workspace-panel document-table-wrap">
        <table className="document-table admin-table"><thead><tr><th>Nutzer</th><th>E-Mail</th><th>Rolle</th><th>Zugang</th><th>Angelegt</th><th>Aktion</th></tr></thead><tbody>
          {(profiles ?? []).map((profile) => (
            <tr key={profile.id}>
              <td>{profile.full_name ?? "Ohne Namensangabe"}</td>
              <td>{profile.email}</td>
              <td>{profile.role}</td>
              <td><StatusTag tone={profile.access_suspended_at ? "critical" : "positive"}>{profile.access_suspended_at ? "Gesperrt" : "Aktiv"}</StatusTag></td>
              <td>{formatDate(profile.created_at)}</td>
              <td>
                <form action={setUserSuspension}>
                  <input name="userId" type="hidden" value={profile.id} />
                  <input name="suspend" type="hidden" value={profile.access_suspended_at ? "false" : "true"} />
                  <button className="table-action" type="submit">
                    {profile.access_suspended_at ? "Reaktivieren" : "Sperren"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody></table>
      </section>
    </div>
  );
}
