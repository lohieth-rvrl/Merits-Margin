import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { formatDate } from "../categories";
import Reveal from "../components/Reveal";
import AdSlot from "../components/AdSlot";

const EMPTY_FILTERS = { level: "", type: "", role: "", location: "", company: "" };

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    setLoading(true);
    api
      .getJobs()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filter options are derived from whatever's actually posted, so the
  // dropdowns never show a choice with zero matching listings.
  const options = useMemo(() => {
    const uniq = (key) => [...new Set(jobs.map((j) => j[key]).filter(Boolean))].sort();
    return {
      level: uniq("level"),
      type: uniq("type"),
      role: uniq("role"),
      location: uniq("location"),
      company: uniq("company"),
    };
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((j) =>
      Object.entries(filters).every(([key, val]) => !val || j[key] === val)
    );
  }, [jobs, filters]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div>
      <div className="lr-hero py-5 mb-5">
        <div className="container fade-in-up">
          <span className="badge badge-career mb-2">Careers</span>
          <h1 className="fw-bold" style={{ color: "var(--honey-deep)" }}>
            Open roles, straight from the source
          </h1>
          <p className="text-secondary lead mb-0" style={{ maxWidth: 620 }}>
            Every listing here links directly to the hiring company's own careers page —
            never a third-party job board, never a middleman. What you see is what the employer posted.
          </p>
        </div>
      </div>

      <div className="container pb-5">
        {/* ---------- Filters ---------- */}
        <div className="lr-card p-3 p-md-4 mb-4">
          <div className="row g-3">
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Level</label>
              <select
                className="form-select form-select-sm"
                value={filters.level}
                onChange={(e) => updateFilter("level", e.target.value)}
              >
                <option value="">All levels</option>
                {options.level.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Type</label>
              <select
                className="form-select form-select-sm"
                value={filters.type}
                onChange={(e) => updateFilter("type", e.target.value)}
              >
                <option value="">All types</option>
                {options.type.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Role</label>
              <select
                className="form-select form-select-sm"
                value={filters.role}
                onChange={(e) => updateFilter("role", e.target.value)}
              >
                <option value="">All roles</option>
                {options.role.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1">Location</label>
              <select
                className="form-select form-select-sm"
                value={filters.location}
                onChange={(e) => updateFilter("location", e.target.value)}
              >
                <option value="">All locations</option>
                {options.location.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1">Company</label>
              <select
                className="form-select form-select-sm"
                value={filters.company}
                onChange={(e) => updateFilter("company", e.target.value)}
              >
                <option value="">All companies</option>
                {options.company.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
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

        {/* ---------- Results ---------- */}
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="lr-spinner" />
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filtered.length === 0 ? (
          <p className="text-secondary py-4">
            {jobs.length === 0
              ? "No open roles posted yet — check back soon."
              : "No roles match those filters. Try clearing one or two."}
          </p>
        ) : (
          <div className="d-flex flex-column gap-3 reveal-group">
            {filtered.map((job) => (
              <Reveal key={job._id}>
                <div className="lr-card p-4">
                  <div className="d-flex justify-content-between flex-wrap gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <span className="fw-bold">{job.company}</span>
                        <span className="text-secondary small">· {formatDate(job.postedDate)}</span>
                      </div>
                      <h2 className="h5 mb-2">{job.title}</h2>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <span className="badge badge-career">{job.level}</span>
                        <span className="badge bg-secondary">{job.type}</span>
                        <span className="badge bg-dark">{job.locationType}</span>
                        <span className="badge" style={{ background: "var(--sage)" }}>{job.role}</span>
                      </div>
                      <div className="text-secondary small mb-2">📍 {job.location}</div>
                      {job.description && (
                        <p className="text-secondary mb-0" style={{ maxWidth: 560 }}>
                          {job.description}
                        </p>
                      )}
                    </div>
                    <div className="d-flex flex-column align-items-end justify-content-between">
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-warm text-nowrap"
                      >
                        Apply on {job.company}'s site ↗
                      </a>
                      {job.companyWebsite && (
                        <a
                          href={job.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="small text-secondary mt-2"
                        >
                          About {job.company}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <AdSlot label="Ad slot — in-feed (responsive)" />
      </div>
    </div>
  );
}
