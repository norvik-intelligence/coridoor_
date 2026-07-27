"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, LayoutDashboard, ScrollText, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/engagements", label: "Engagements", icon: ClipboardCheck },
  { href: "/admin/users", label: "Users", icon: UsersRound },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText }
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="workspace-nav">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          className={cn((href === "/admin" ? pathname === href : pathname.startsWith(href)) && "active")}
          href={href}
          key={href}
        >
          <Icon size={17} strokeWidth={1.6} aria-hidden="true" />{label}
        </Link>
      ))}
    </nav>
  );
}
