import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { DealroomNav } from "@/components/dealroom/dealroom-nav";
import { logout } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DealroomLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <Logo />
        <DealroomNav />
        <div className="workspace-user">
          <span>{(profile?.full_name ?? user.email ?? "C").slice(0, 1).toUpperCase()}</span>
          <p>{profile?.full_name ?? "Mandant"}<small>{profile?.email ?? user.email}</small></p>
          <form action={logout}>
            <button type="submit" aria-label="Ausloggen"><LogOut size={16} /></button>
          </form>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-mobile-header">
          <Logo compact />
          <Link href="/dealroom/account">Account</Link>
        </header>
        {children}
      </div>
    </div>
  );
}
