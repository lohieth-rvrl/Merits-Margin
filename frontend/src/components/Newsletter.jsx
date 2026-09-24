import { useState } from "react";

// Buttondown's public embed endpoint is designed for exactly this: a plain
// form POST, no API key needed client-side. Set your own username via
// VITE_BUTTONDOWN_USERNAME once you've created a free account at
// https://buttondown.com -- until then this shows a clear setup notice
// instead of silently pretending to work.
const BUTTONDOWN_USERNAME = import.meta.env.VITE_BUTTONDOWN_USERNAME || "";

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  if (!BUTTONDOWN_USERNAME) {
    return (
      <div className="lr-card p-4 p-md-5 text-center" style={{ background: "var(--ivory-dim)" }}>
        <h2 className="h4 mb-2">Get one useful email a week</h2>
        <p className="text-secondary small mb-0">
          Newsletter signup isn't connected yet — create a free account at{" "}
          <a href="https://buttondown.com" target="_blank" rel="noreferrer">buttondown.com</a> and set{" "}
          <code>VITE_BUTTONDOWN_USERNAME</code> in <code>frontend/.env</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="lr-card p-4 p-md-5 text-center" style={{ background: "var(--ivory-dim)" }}>
      <h2 className="h4 mb-2">Get one useful email a week</h2>
      <p className="text-secondary mb-4">
        No spam, no daily noise — just the best new piece from Finance, Career &amp; Jobs, and Money News.
      </p>
      {submitted ? (
        <p className="fw-semibold mb-0" style={{ color: "var(--sage)" }}>
          Almost there — check the popup window to confirm your subscription.
        </p>
      ) : (
        <form
          action={`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`}
          method="post"
          target="popupwindow"
          onSubmit={() => {
            window.open(`https://buttondown.com/${BUTTONDOWN_USERNAME}`, "popupwindow");
            setSubmitted(true);
          }}
          className="d-flex flex-column flex-sm-row gap-2 justify-content-center mx-auto"
          style={{ maxWidth: 440 }}
        >
          <input
            type="email"
            name="email"
            required
            className="form-control"
            placeholder="you@example.com"
          />
          <input type="hidden" name="embed" value="1" />
          <button className="btn btn-warm text-nowrap" type="submit">
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
