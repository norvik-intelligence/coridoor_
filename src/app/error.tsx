"use client";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="system-page">
      <div>
        <p className="eyebrow">Unerwarteter Fehler</p>
        <h1>Der Vorgang konnte nicht abgeschlossen werden.</h1>
        <p>Es wurden keine technischen Details oder sensiblen Inhalte angezeigt. Versuchen Sie den Vorgang erneut.</p>
        <button className="button button-dark" onClick={reset} type="button">Erneut versuchen</button>
      </div>
    </main>
  );
}
