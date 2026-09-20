import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Placeholder -- wire this up to Mailchimp/ConvertKit/Buttondown etc.
    // once you pick a provider. For now it just confirms visually.
    setSubmitted(true);
  }

  return (
    <div className="lr-card p-4 p-md-5 text-center" style={{ background: "var(--ivory-dim)" }}>
      <h2 className="h4 mb-2">Get one useful email a week</h2>
      <p className="text-secondary mb-4">
        No spam, no daily noise — just the best new piece from Finance, Career &amp; Jobs, and Money News.
      </p>
      {submitted ? (
        <p className="fw-semibold mb-0" style={{ color: "var(--sage)" }}>
          You're on the list — thanks for signing up.
        </p>
      ) : (
        <form
          className="d-flex flex-column flex-sm-row gap-2 justify-content-center mx-auto"
          style={{ maxWidth: 440 }}
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            required
            className="form-control"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-warm text-nowrap" type="submit">
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
