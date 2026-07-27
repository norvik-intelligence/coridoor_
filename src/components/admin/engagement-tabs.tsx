"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  ["overview", "Overview"],
  ["interview", "Interview"],
  ["documents", "Documents"],
  ["questions", "Questions"],
  ["analysis", "Analysis"],
  ["deliverables", "Deliverables"]
];

export function EngagementTabs({ engagementId }: { engagementId: string }) {
  const pathname = usePathname();
  return (
    <nav className="engagement-tabs" aria-label="Engagement Bereiche">
      {tabs.map(([path, label]) => {
        const href = path === "overview" ? `/admin/engagements/${engagementId}` : `/admin/engagements/${engagementId}/${path}`;
        return <Link className={cn(pathname === href && "active")} href={href} key={path}>{label}</Link>;
      })}
    </nav>
  );
}
