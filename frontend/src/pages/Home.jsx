import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { CATEGORIES, formatDate } from "../categories";
import AdSlot from "../components/AdSlot";
import CoverImage from "../components/CoverImage";
import Reveal from "../components/Reveal";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getArticles()
      .then(setArticles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="lr-spinner" />
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
  const recent = rest.slice(0, 5);

  return (
    <div>
      <section className="lr-hero py-5">
        <div className="container py-4">
          <div className="row g-5 align-items-center">
            <div className="col-lg-7 fade-in-up">
              <span className={`badge ${CATEGORIES[feature.category]?.badgeClass} mb-3`}>
                {CATEGORIES[feature.category]?.label}
              </span>
              <h1 className="display-5 fw-bold">
                <Link to={`/${feature.category}/${feature.slug}`} className="text-decoration-none text-dark">
                  {feature.title}
                </Link>
              </h1>
              <p className="lead text-secondary">{feature.dek}</p>
              <p className="text-secondary small">
                {feature.readTime} · Updated {formatDate(feature.date)}
              </p>
              <Link to={`/${feature.category}/${feature.slug}`} className="btn btn-warm mt-2">
                Read the story
              </Link>
            </div>
            <div className="col-lg-5 fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="ratio ratio-4x3 rounded-4 overflow-hidden shadow-sm">
                <CoverImage src={feature.coverImage} category={feature.category} alt={feature.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-5">
        <Reveal as="h2" className="h5 text-uppercase text-secondary border-bottom pb-3 mb-3">
          Also new this week
        </Reveal>
        <div className="row g-3 reveal-group">
          {recent.map((a) => (
            <div className="col-md-6 col-lg-4" key={a._id}>
              <Reveal>
                <Link to={`/${a.category}/${a.slug}`} className="text-decoration-none text-dark">
                  <div className="lr-card h-100">
                    <div className="ratio ratio-16x9">
                      <CoverImage src={a.coverImage} category={a.category} alt={a.title} />
                    </div>
                    <div className="p-3">
                      <span className={`badge ${CATEGORIES[a.category]?.badgeClass} mb-2`}>
                        {CATEGORIES[a.category]?.label}
                      </span>
                      <div className="fw-semibold">{a.title}</div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            </div>
          ))}
        </div>

        <hr className="my-5" />

        <Reveal as="h2" className="mb-4">
          Where to start
        </Reveal>
        <div className="row g-3 reveal-group">
          {Object.entries(CATEGORIES).map(([key, c]) => (
            <div className="col-md-4" key={key}>
              <Reveal>
                <Link to={`/${key}`} className="text-decoration-none">
                  <div className="lr-card h-100 p-4" style={{ borderTop: `4px solid ${c.color}` }}>
                    <h3 className="h5" style={{ color: c.color }}>
                      {c.label}
                    </h3>
                    <p className="text-secondary small mb-0">
                      {key === "finance" && "Budgeting, saving, credit, and investing basics."}
                      {key === "career" && "Resumes, negotiation, and job-market advice."}
                      {key === "news" && "What's happening in the economy and job market."}
                    </p>
                  </div>
                </Link>
              </Reveal>
            </div>
          ))}
        </div>

        <AdSlot label="Ad slot — leaderboard (728×90)" height={90} />
      </div>
    </div>
  );
}
