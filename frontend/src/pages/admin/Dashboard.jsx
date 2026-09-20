import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES, formatDate } from "../../categories";
import CoverImage from "../../components/CoverImage";
import AdminTabs from "../../components/AdminTabs";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 8;
const EMPTY_FILTERS = { search: "", category: "", status: "" };

export default function Dashboard() {
  const { email, logout } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

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

  async function handleExport() {
    try {
      const blob = await api.exportAllData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ledger-and-route-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  }

  const filtered = useMemo(() => {
    let list = [...articles];
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q));
    }
    if (filters.category) list = list.filter((a) => a.category === filters.category);
    if (filters.status) list = list.filter((a) => a.status === filters.status);
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    return list;
  }, [articles, filters]);

  useEffect(() => setPage(1), [filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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

      <AdminTabs active="articles" />

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ---------- Filters ---------- */}
      <div className="lr-card p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-5">
            <label className="form-label small fw-semibold mb-1">Search title</label>
            <input
              type="search"
              className="form-control form-control-sm"
              placeholder="Search…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold mb-1">Category</label>
            <select
              className="form-select form-select-sm"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">All categories</option>
              {Object.entries(CATEGORIES).map(([key, c]) => (
                <option key={key} value={key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-4">
            <label className="form-label small fw-semibold mb-1">Status</label>
            <select
              className="form-select form-select-sm"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          {activeFilterCount > 0 ? (
            <button className="lr-text-btn" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} ✕
            </button>
          ) : <span />}
          <button className="lr-text-btn" onClick={handleExport}>
            ⬇ Export all data (JSON backup)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="lr-spinner" />
        </div>
      ) : articles.length === 0 ? (
        <p className="text-secondary">No articles yet — create your first one.</p>
      ) : filtered.length === 0 ? (
        <p className="text-secondary">No articles match those filters.</p>
      ) : (
        <>
          <p className="text-secondary small mb-2">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="row g-3">
            {visible.map((a) => (
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
                    <div className="text-secondary small">
                      {formatDate(a.date)} · {(a.views || 0).toLocaleString()} views
                    </div>
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
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
