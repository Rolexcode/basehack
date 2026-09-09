"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container section">
      <p className="eyebrow">INVARIANT</p>
      <h1>Something went wrong.</h1>
      <p>
        Try loading this page again. No wallet action or transaction was submitted by this page.
      </p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
