"use client";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body>
        <main className="system-page">
          <div>
            <p className="eyebrow">Systemmeldung</p>
            <h1>Coridoor konnte nicht vollständig geladen werden.</h1>
            <button className="button button-dark" onClick={reset} type="button">Neu laden</button>
          </div>
        </main>
      </body>
    </html>
  );
}
