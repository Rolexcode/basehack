"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container section">
      <h1>The lab hit an error.</h1>
      <p>
        Your wallet and funds are not involved. Reload the experiment to
        continue.
      </p>
      <button className="primary" onClick={reset}>
        Reload the lab
      </button>
    </main>
  );
}
