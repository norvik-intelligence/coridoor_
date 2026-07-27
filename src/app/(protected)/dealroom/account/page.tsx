import { updateProfile } from "@/lib/actions/dealroom";
import { logout } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth";
import { WorkspaceHeader } from "@/components/dealroom/workspace";

export default async function AccountPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, created_at")
    .eq("id", user.id)
    .single();

  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow="Account"
        title="Kontozugang"
        description="Verwalten Sie ausschließlich Ihre persönlichen Profildaten. Rollen und Mandatszugriffe werden serverseitig vergeben."
      />
      <section className="account-grid">
        <form action={updateProfile} className="workspace-form workspace-panel">
          <div><p className="micro-label">Persönliche Angaben</p><h2>Profil</h2></div>
          <label>Vollständiger Name<input defaultValue={profile?.full_name ?? ""} name="fullName" required /></label>
          <label>E-Mail-Adresse<input disabled value={profile?.email ?? user.email ?? ""} /></label>
          <label>Rolle<input disabled value={profile?.role ?? "client"} /></label>
          <button className="button button-dark" type="submit">Profil speichern</button>
        </form>
        <div className="workspace-panel account-security">
          <p className="micro-label">Sitzung</p>
          <h2>Sicher ausloggen</h2>
          <p>Beendet die aktive Browsersitzung. Andere Sitzungen bleiben gemäß der Auth-Konfiguration bestehen.</p>
          <form action={logout}><button className="button button-ghost" type="submit">Ausloggen</button></form>
        </div>
      </section>
    </div>
  );
}
