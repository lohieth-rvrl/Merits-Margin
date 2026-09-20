import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../categories";

export default function JobsDashboard() {
  const { email, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      <div className="d-flex gap-3 mb-4 border-bottom">
        <Link to="/admin" className="lr-text-btn pb-2">Articles</Link>
        <span className="pb-2 fw-bold" style={{ color: "var(--rust)", borderBottom: "2px solid var(--rust)" }}>
          Jobs
        </span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="lr-spinner" />
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-secondary">No job listings yet — add your first one.</p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {jobs.map((j) => (
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
                  {j.location} · {j.type} · Posted {formatDate(j.postedDate)}
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
      )}
    </div>
  );
}
