import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";

const VALUES = [
  {
    title: "Practical over theoretical",
    body: "Every piece aims for something you can actually do today — a script, a number, a next step — not just a general idea to feel good about.",
    icon: "→",
  },
  {
    title: "Plain language, always",
    body: "If a concept needs jargon to explain, we haven't explained it well enough yet. We'd rather be clear than sound impressive.",
    icon: "✎",
  },
  {
    title: "Independent by design",
    body: "This site is ad-supported, not advertiser-directed. Coverage decisions are never influenced by who's buying ad space.",
    icon: "◆",
  },
];

export default function About() {
  return (
    <div>
      <div className="lr-hero py-5 mb-5">
        <div className="container fade-in-up">
          <h1 className="display-6 fw-bold mb-3">About Ledger &amp; Route</h1>
          <p className="lead text-secondary mb-0" style={{ maxWidth: 620 }}>
            We cover the two decisions that shape most people's financial lives: how you manage
            money, and how you build a career worth managing money from.
          </p>
        </div>
      </div>

      <div className="container pb-5">
        {/* ---------- Values ---------- */}
        <div className="row g-4 mb-5 reveal-group">
          {VALUES.map((v) => (
            <div className="col-md-4" key={v.title}>
              <Reveal className="h-100">
                <div className="lr-card h-100 p-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: 44,
                      height: 44,
                      background: "var(--ivory-dim)",
                      color: "var(--rust)",
                      fontSize: "1.1rem",
                    }}
                  >
                    {v.icon}
                  </div>
                  <h2 className="h6">{v.title}</h2>
                  <p className="text-secondary small mb-0">{v.body}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        <div className="row g-5">
          <div className="col-lg-8">
            <Reveal>
              <h2 className="h4 mb-3">What we cover</h2>
              <p>
                Three areas: <Link to="/finance" className="fw-semibold">Finance</Link> for
                budgeting, saving, credit, and investing; a real{" "}
                <Link to="/career" className="fw-semibold">Careers</Link> board linking directly to
                open roles at hiring companies; and{" "}
                <Link to="/news" className="fw-semibold">Money News</Link>, where we translate
                economic headlines into what they actually mean for your day-to-day decisions.
              </p>
              <p>
                We don't give personalized financial, legal, or career advice. The goal is to make
                the underlying ideas clear enough that you can make your own informed decision, or
                know the right questions to bring to a professional.
              </p>

              <h2 className="h4 mb-3 mt-4">How some of this content is made</h2>
              <p>
                Some articles on this site are drafted with AI assistance as part of a publishing
                process, and reviewed before being published. We'd rather say that plainly than
                have you wonder.
              </p>

              <h2 className="h4 mb-3 mt-4">A note on independence</h2>
              <p>
                This site is supported by advertising, served by Google AdSense. Ads are not
                personally endorsed by us, and editorial coverage is never influenced by
                advertisers.
              </p>
            </Reveal>
          </div>

          <div className="col-lg-4">
            <Reveal>
              <div className="lr-card p-4" style={{ background: "var(--ivory-dim)" }}>
                <h2 className="h6 text-uppercase text-secondary mb-3">Questions?</h2>
                <p className="text-secondary small mb-3">
                  Corrections, partnership questions, or anything else — we read every message.
                </p>
                <Link to="/contact" className="btn btn-warm w-100">
                  Get in touch
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
