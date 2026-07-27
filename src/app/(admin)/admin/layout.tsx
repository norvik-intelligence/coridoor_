import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return (
    <div className="workspace-shell admin-shell">
      <aside className="workspace-sidebar admin-sidebar">
        <Logo />
        <div className="admin-label">Internal Operations</div>
        <AdminNav />
        <div className="workspace-user">
          <span>{(profile.full_name ?? "A").slice(0, 1).toUpperCase()}</span>
          <p>{profile.full_name ?? "Coridoor Admin"}<small>{profile.email}</small></p>
          <Link aria-label="Zum Deal Room" href="/dealroom">↗</Link>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-mobile-header"><Logo compact /><Link href="/dealroom">Client view</Link></header>
        {children}
      </div>
    </div>
  );
}
