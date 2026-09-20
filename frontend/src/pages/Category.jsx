import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { CATEGORIES, formatDate } from "../categories";
import AdSlot from "../components/AdSlot";
import CoverImage from "../components/CoverImage";
import Reveal from "../components/Reveal";
import NotFound from "./NotFound";

export default function Category() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getArticles(category)
      .then(setArticles)
      .finally(() => setLoading(false));
  }, [category]);

  const meta = CATEGORIES[category];
  if (!meta) return <NotFound />;

  return (
    <div>
      <div className="lr-hero py-5 mb-5">
        <div className="container fade-in-up">
          <span className={`badge ${meta.badgeClass} mb-2`}>Section</span>
          <h1 className="fw-bold" style={{ color: meta.color }}>
            {meta.label}
          </h1>
        </div>
      </div>

      <div className="container pb-5">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="lr-spinner" />
          </div>
        ) : articles.length === 0 ? (
          <p className="text-secondary">No articles in this section yet.</p>
        ) : (
          <div className="row g-4 reveal-group">
            {articles.map((a) => (
              <div className="col-md-6" key={a._id}>
                <Reveal>
                  <Link to={`/${a.category}/${a.slug}`} className="text-decoration-none text-dark">
                    <div className="lr-card h-100">
                      <div className="ratio ratio-16x9">
                        <CoverImage src={a.coverImage} category={a.category} alt={a.title} />
                      </div>
                      <div className="p-3">
                        <span className={`badge ${meta.badgeClass} mb-2`}>{meta.label}</span>
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
        )}

        <AdSlot label="Ad slot — in-feed (responsive)" />
      </div>
    </div>
  );
}
