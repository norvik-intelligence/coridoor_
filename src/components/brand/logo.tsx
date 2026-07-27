import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  className
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("brand-logo", className)} aria-label="Coridoor Startseite">
      <svg
        className="brand-mark"
        viewBox="0 0 42 42"
        role="img"
        aria-label="Coridoor Bildmarke"
      >
        <path d="M3 12.5 11.5 21 3 29.5" />
        <path d="M11 7.5 24.5 21 11 34.5" />
        <path d="M19 3v10l9 8-9 8v10" />
        <path d="M29 8v8l10 5-10 5v8" />
      </svg>
      {!compact && <span>Coridoor</span>}
    </Link>
  );
}
