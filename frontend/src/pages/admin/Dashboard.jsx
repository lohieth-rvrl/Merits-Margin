import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES, formatDate } from "../../categories";
import CoverImage from "../../components/CoverImage";

export default function Dashboard() {
  const { email, logout } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    api
      .getAllArticlesAdmin()
      .then(setArticles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    try {
      await api.deleteArticle(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h3 fw-bold mb-0">Dashboard</h1>
          <p className="text-secondary small mb-0">Signed in as {email}</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/new" className="btn btn-warm">
            + New article
          </Link>
          <button className="btn btn-warm-outline" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <div className="d-flex gap-3 mb-4 border-bottom">
        <span className="pb-2 fw-bold" style={{ color: "var(--rust)", borderBottom: "2px solid var(--rust)" }}>
          Articles
        </span>
        <Link to="/admin/jobs" className="lr-text-btn pb-2">Jobs</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="lr-spinner" />
        </div>
      ) : articles.length === 0 ? (
        <p className="text-secondary">No articles yet — create your first one.</p>
      ) : (
        <div className="row g-3">
          {articles.map((a) => (
            <div className="col-12" key={a._id}>
              <div className="lr-card p-3 d-flex gap-3 align-items-center flex-wrap">
                <div style={{ width: 96, height: 64, flexShrink: 0 }} className="rounded-3 overflow-hidden">
                  <CoverImage src={a.coverImage} category={a.category} alt={a.title} className="w-100 h-100" />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span className={`badge ${CATEGORIES[a.category]?.badgeClass}`}>
                      {CATEGORIES[a.category]?.label}
                    </span>
                    <span className={`badge ${a.status === "draft" ? "bg-secondary" : "bg-dark"}`}>
                      {a.status === "draft" ? "Draft" : "Published"}
                    </span>
                  </div>
                  <div className="fw-semibold">{a.title}</div>
                  <div className="text-secondary small">{formatDate(a.date)}</div>
                </div>
                <div className="d-flex gap-2">
                  <Link to={`/admin/edit/${a._id}`} className="btn btn-sm btn-warm-outline">
                    Edit
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(a._id, a.title)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
