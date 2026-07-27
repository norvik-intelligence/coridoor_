import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ContentHero({
  eyebrow,
  title,
  intro,
  action = true
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  action?: boolean;
}) {
  return (
    <section className="content-hero shell">
      <p className="eyebrow">{eyebrow}</p>
      <div>
        <h1>{title}</h1>
        <p>{intro}</p>
        {action && (
          <Link className="button button-dark" href="/register">
            Vertrauliche Analyse anfragen <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}

export function ContentSection({
  index,
  title,
  children
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="content-section shell">
      <div className="content-section-title">
        <span>{index}</span>
        <h2>{title}</h2>
      </div>
      <div className="prose">{children}</div>
    </section>
  );
}
