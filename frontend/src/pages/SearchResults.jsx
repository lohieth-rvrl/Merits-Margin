import { useEffect, useState } from "react";
import LoadingState from "../components/LoadingState";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { CATEGORIES, formatDate } from "../categories";
import CoverImage from "../components/CoverImage";
import Reveal from "../components/Reveal";

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState({ articles: [], jobs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults({ articles: [], jobs: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .search(q)
      .then(setResults)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [q]);

  const totalResults = results.articles.length + results.jobs.length;

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-1">Search results</h1>
      <p className="text-secondary mb-4">
        {q ? (
          <>
            {totalResults} result{totalResults !== 1 ? "s" : ""} for <strong>"{q}"</strong>
          </>
        ) : (
          "Type something into the search box to get started."
        )}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <LoadingState />
      ) : (
        <>
          {results.articles.length > 0 && (
            <div className="mb-5">
              <h2 className="h5 mb-3">Articles</h2>
              <div className="row g-4 reveal-group">
                {results.articles.map((a) => (
                  <div className="col-md-6" key={a._id}>
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
                            <h3 className="h5">{a.title}</h3>
                            <p className="text-secondary small mb-1">{a.dek}</p>
                            <p className="text-secondary small mb-0">
                              {a.readTime} · {formatDate(a.date)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.jobs.length > 0 && (
            <div className="mb-5">
              <h2 className="h5 mb-3">Job listings</h2>
              <div className="d-flex flex-column gap-2 reveal-group">
                {results.jobs.map((j) => (
                  <Reveal key={j._id}>
                    <Link to="/career" className="text-decoration-none text-dark">
                      <div className="lr-card p-3">
                        <div className="fw-bold small">{j.company}</div>
                        <div className="fw-semibold">{j.title}</div>
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          <span className="badge badge-career">{j.level}</span>
                          <span className="badge bg-secondary">{j.type}</span>
                        </div>
                        <div className="text-secondary small mt-2">📍 {j.location}</div>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {q.trim() && totalResults === 0 && (
            <p className="text-secondary">
              Nothing matched "{q}". Try a different word, or browse{" "}
              <Link to="/finance">Finance</Link>, <Link to="/news">Money News</Link>, or{" "}
              <Link to="/career">Careers</Link> directly.
            </p>
          )}
        </>
      )}
    </div>
  );
}
