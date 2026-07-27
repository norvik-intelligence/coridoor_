import { cn } from "@/lib/utils";

export function WorkspaceHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="workspace-page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}

export function StatusTag({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "attention" | "critical";
}) {
  return <span className={cn("workspace-status", `workspace-status-${tone}`)}>{children}</span>;
}

export function EmptyState({
  title,
  children,
  action
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="workspace-empty">
      <span>—</span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
