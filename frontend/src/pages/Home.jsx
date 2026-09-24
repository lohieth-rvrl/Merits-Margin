import { useEffect, useState } from "react";
import LoadingState from "../components/LoadingState";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../api";
import { CATEGORIES, formatDate } from "../categories";
import AdSlot from "../components/AdSlot";
import CoverImage from "../components/CoverImage";
import Reveal from "../components/Reveal";
import Newsletter from "../components/Newsletter";

const VALUE_PROPS = [
  {
    title: "No jargon, no fluff",
    body: "Every piece explains the reasoning, not just the rule — so you actually understand the decision.",
    icon: "✎",
  },
  {
    title: "Written to be used",
    body: "Scripts, checklists, and numbers you can act on today, not vague encouragement.",
    icon: "→",
  },
  {
    title: "Independent, always",
    body: "Ad-supported, never advertiser-influenced. We tell you what we'd tell a friend.",
    icon: "◆",
  },
];

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getArticles(), api.getJobs()])
      .then(([a, j]) => {
        setArticles(a);
        setJobs(j);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container">
        <LoadingState />
      </div>
    );
  }
  if (error) return <div className="container py-5 text-danger">Couldn't load articles: {error}</div>;
  if (articles.length === 0) {
    return (
      <div className="container py-5">
        <p>No articles yet. Log in to the admin dashboard to publish your first one.</p>
      </div>
    );
  }

  const [feature, ...rest] = articles;
  const editorsPicks = rest.slice(0, 3);
  const moreRecent = rest.slice(3, 6);

  return (
    <div>
      <Helmet>
        <title>Merit & Margin — Money and career advice you can actually use</title>
        <meta
          name="description"
          content="No jargon, no fluff — practical finance and career guidance, plus real job listings that link straight to the employer."
        />
      </Helmet>

      {/* ---------- HERO ---------- */}
      <section className="lr-hero py-5">
        <div className="container py-4">
          <div className="row g-5 align-items-center">
            <div className="col-lg-7 fade-in-up">
              <span className={`badge ${CATEGORIES[feature.category]?.badgeClass} mb-3`}>
                {CATEGORIES[feature.category]?.label}
              </span>
              <h1 className="display-5 fw-bold mb-3">
                <Link to={`/${feature.category}/${feature.slug}`} className="text-decoration-none text-dark">
                  {feature.title}
                </Link>
              </h1>
              <p className="lead text-secondary">{feature.dek}</p>
              <p className="text-secondary small mb-4">
                {feature.readTime} · Updated {formatDate(feature.date)}
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Link to={`/${feature.category}/${feature.slug}`} className="btn btn-warm btn-lg">
                  Read the story
                </Link>
                <Link to="/finance" className="btn btn-warm-outline btn-lg">
                  Browse all topics
                </Link>
              </div>
            </div>
            <div className="col-lg-5 fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="ratio ratio-4x3 rounded-4 overflow-hidden shadow-sm">
                <CoverImage src={feature.coverImage} category={feature.category} alt={feature.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- STATS STRIP (real counts, not invented) ---------- */}
      <section className="py-3" style={{ background: "var(--espresso)" }}>
        <div className="container">
          <div className="d-flex flex-wrap justify-content-center gap-4 gap-md-5 text-center">
            <div className="text-ivory" style={{ color: "var(--ivory)" }}>
              <span className="fw-bold h5 mb-0" style={{ color: "var(--honey)" }}>{articles.length}</span>
              <span className="small ms-2" style={{ color: "var(--ivory-dim)" }}>articles published</span>
            </div>
            <div style={{ color: "var(--ivory)" }}>
              <span className="fw-bold h5 mb-0" style={{ color: "var(--honey)" }}>{jobs.length}</span>
              <span className="small ms-2" style={{ color: "var(--ivory-dim)" }}>open roles right now</span>
            </div>
            <div style={{ color: "var(--ivory)" }}>
              <span className="fw-bold h5 mb-0" style={{ color: "var(--honey)" }}>3</span>
              <span className="small ms-2" style={{ color: "var(--ivory-dim)" }}>topics covered</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- VALUE PROPS ---------- */}
      <section className="py-5" style={{ background: "white" }}>
        <div className="container">
          <div className="row g-4 reveal-group">
            {VALUE_PROPS.map((v) => (
              <div className="col-md-4" key={v.title}>
                <Reveal className="h-100">
                  <div className="h-100">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{
                        width: 48,
                        height: 48,
                        background: "var(--ivory-dim)",
                        color: "var(--rust)",
                        fontSize: "1.25rem",
                      }}
                    >
                      {v.icon}
                    </div>
                    <h3 className="h5">{v.title}</h3>
                    <p className="text-secondary mb-0">{v.body}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- EDITOR'S PICKS ---------- */}
      {editorsPicks.length > 0 && (
        <section className="py-5">
          <div className="container">
            <Reveal className="d-flex justify-content-between align-items-baseline mb-4 flex-wrap gap-2">
              <h2 className="mb-0">Editor's picks</h2>
              <Link to="/finance" className="text-decoration-none small fw-semibold">
                See all articles →
              </Link>
            </Reveal>
            <div className="row g-4 reveal-group">
              {editorsPicks.map((a) => (
                <div className="col-md-4" key={a._id}>
                  <Reveal>
                    <Link to={`/${a.category}/${a.slug}`} className="text-decoration-none text-dark">
                      <div className="lr-card h-100">
                        <div className="ratio ratio-4x3">
                          <CoverImage src={a.coverImage} category={a.category} alt={a.title} />
                        </div>
                        <div className="p-3">
                          <span className={`badge ${CATEGORIES[a.category]?.badgeClass} mb-2`}>
                            {CATEGORIES[a.category]?.label}
                          </span>
                          <h3 className="h6 mb-1">{a.title}</h3>
                          <p className="text-secondary small mb-0">{a.readTime}</p>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- CATEGORY SPOTLIGHTS ---------- */}
      <section className="py-5" style={{ background: "white" }}>
        <div className="container">
          <Reveal as="h2" className="mb-4">
            Where to start
          </Reveal>
          <div className="row g-3 reveal-group">
            {Object.entries(CATEGORIES).map(([key, c]) => (
              <div className="col-md-4" key={key}>
                <Reveal>
                  <Link to={`/${key}`} className="text-decoration-none">
                    <div
                      className="lr-card h-100 p-4"
                      style={{ borderTop: `4px solid ${c.color}` }}
                    >
                      <h3 className="h5" style={{ color: c.color }}>
                        {c.label}
                      </h3>
                      <p className="text-secondary small mb-3">
                        {key === "finance" && "Budgeting, saving, credit, and investing basics explained without jargon."}
                        {key === "career" && "Real open roles, linking straight to each employer's own site."}
                        {key === "news" && "What's happening in the economy and job market — and what it means for you."}
                      </p>
                      <span className="fw-semibold small" style={{ color: c.color }}>
                        Explore {c.label} →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURED OPEN ROLES ---------- */}
      {jobs.length > 0 && (
        <section className="py-5" style={{ background: "white" }}>
          <div className="container">
            <Reveal className="d-flex justify-content-between align-items-baseline mb-4 flex-wrap gap-2">
              <div>
                <span className="badge badge-career mb-2">Careers</span>
                <h2 className="mb-0">Featured open roles</h2>
              </div>
              <Link to="/career" className="text-decoration-none small fw-semibold">
                See all open roles →
              </Link>
            </Reveal>
            <div className="row g-3 reveal-group">
              {jobs.slice(0, 3).map((job) => (
                <div className="col-md-4" key={job._id}>
                  <Reveal>
                    <Link to="/career" className="text-decoration-none text-dark">
                      <div className="lr-card h-100 p-4">
                        <div className="fw-bold small mb-1">{job.company}</div>
                        <h3 className="h6 mb-2">{job.title}</h3>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          <span className="badge badge-career">{job.level}</span>
                          <span className="badge bg-secondary">{job.type}</span>
                        </div>
                        <div className="text-secondary small">📍 {job.location}</div>
                      </div>
                    </Link>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- MORE RECENT ---------- */}
      {moreRecent.length > 0 && (
        <section className="py-5">
          <div className="container">
            <Reveal as="h2" className="mb-4">
              More recent stories
            </Reveal>
            <div className="row g-3 reveal-group">
              {moreRecent.map((a) => (
                <div className="col-md-4" key={a._id}>
                  <Reveal>
                    <Link to={`/${a.category}/${a.slug}`} className="text-decoration-none text-dark">
                      <div className="d-flex gap-3 align-items-start">
                        <div
                          className="rounded-3 overflow-hidden flex-shrink-0"
                          style={{ width: 88, height: 64 }}
                        >
                          <CoverImage src={a.coverImage} category={a.category} alt={a.title} className="w-100 h-100" />
                        </div>
                        <div>
                          <span className={`badge ${CATEGORIES[a.category]?.badgeClass} mb-1`} style={{ fontSize: "0.65rem" }}>
                            {CATEGORIES[a.category]?.label}
                          </span>
                          <div className="fw-semibold small">{a.title}</div>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- NEWSLETTER ---------- */}
      <section className="py-5">
        <div className="container">
          <Reveal>
            <Newsletter />
          </Reveal>
        </div>
      </section>

      <div className="container pb-5">
        <AdSlot label="Ad slot — leaderboard (728×90)" height={90} />
      </div>
    </div>
  );
}
