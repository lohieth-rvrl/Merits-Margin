import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../categories";
import AdminTabs from "../../components/AdminTabs";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 8;
const EMPTY_FILTERS = { search: "", level: "", type: "", status: "" };

export default function JobsDashboard() {
  const { email, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  function load() {
    setLoading(true);
    api
      .getAllJobsAdmin()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    try {
      await api.deleteJob(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  const options = useMemo(() => {
    const uniq = (key) => [...new Set(jobs.map((j) => j[key]).filter(Boolean))].sort();
    return { level: uniq("level"), type: uniq("type") };
  }, [jobs]);

  const filtered = useMemo(() => {
    let list = [...jobs];
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
      );
    }
    if (filters.level) list = list.filter((j) => j.level === filters.level);
    if (filters.type) list = list.filter((j) => j.type === filters.type);
    if (filters.status) list = list.filter((j) => j.status === filters.status);
    list.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    return list;
  }, [jobs, filters]);

  useEffect(() => setPage(1), [filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h1 className="h3 fw-bold mb-0">Jobs dashboard</h1>
          <p className="text-secondary small mb-0">Signed in as {email}</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/jobs/new" className="btn btn-warm">
            + New job listing
          </Link>
          <button className="btn btn-warm-outline" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <AdminTabs active="jobs" />

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ---------- Filters ---------- */}
      <div className="lr-card p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold mb-1">Search title or company</label>
            <input
              type="search"
              className="form-control form-control-sm"
              placeholder="Search…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold mb-1">Level</label>
            <select
              className="form-select form-select-sm"
              value={filters.level}
              onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value }))}
            >
              <option value="">All</option>
              {options.level.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold mb-1">Type</label>
            <select
              className="form-select form-select-sm"
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="">All</option>
              {options.type.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3">
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
        {activeFilterCount > 0 && (
          <div className="mt-3">
            <button className="lr-text-btn" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} ✕
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="lr-spinner" />
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-secondary">No job listings yet — add your first one.</p>
      ) : filtered.length === 0 ? (
        <p className="text-secondary">No listings match those filters.</p>
      ) : (
        <>
          <p className="text-secondary small mb-2">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="d-flex flex-column gap-2">
            {visible.map((j) => (
              <div className="lr-card p-3 d-flex gap-3 align-items-center flex-wrap" key={j._id}>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span className="badge badge-career">{j.level}</span>
                    <span className={`badge ${j.status === "draft" ? "bg-secondary" : "bg-dark"}`}>
                      {j.status === "draft" ? "Draft" : "Published"}
                    </span>
                  </div>
                  <div className="fw-semibold">{j.title} — {j.company}</div>
                  <div className="text-secondary small">
                    {j.location} · {j.type} · Posted {formatDate(j.postedDate)} · {(j.clicks || 0).toLocaleString()} apply clicks
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Link to={`/admin/jobs/edit/${j._id}`} className="btn btn-sm btn-warm-outline">
                    Edit
                  </Link>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(j._id, j.title)}>
                    Delete
                  </button>
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
