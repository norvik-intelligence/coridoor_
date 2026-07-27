"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  FileText,
  FolderLock,
  LayoutGrid,
  MessageSquareText,
  UserRound
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dealroom", label: "Overview", icon: LayoutGrid },
  { href: "/dealroom/interview", label: "Executive Interview", icon: ClipboardList },
  { href: "/dealroom/documents", label: "Documents", icon: FolderLock },
  { href: "/dealroom/questions", label: "Open Questions", icon: MessageSquareText },
  { href: "/dealroom/results", label: "Deliverables", icon: FileText },
  { href: "/dealroom/account", label: "Account", icon: UserRound }
];

export function DealroomNav() {
  const pathname = usePathname();
  return (
    <nav className="workspace-nav" aria-label="Deal Room Navigation">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/dealroom" ? pathname === href : pathname.startsWith(href);
        return (
          <Link className={cn(active && "active")} href={href} key={href}>
            <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
      <div className="workspace-nav-context">
        <Building2 size={17} strokeWidth={1.5} aria-hidden="true" />
        <p>Persönlicher Mandantenbereich<small>Zugriff wird protokolliert</small></p>
      </div>
    </nav>
  );
}
