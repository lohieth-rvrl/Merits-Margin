import { useEffect, useMemo, useState } from "react";
import LoadingState from "../components/LoadingState";
import { Helmet } from "react-helmet-async";
import { api } from "../api";
import { formatDate } from "../categories";
import Reveal from "../components/Reveal";
import AdSlot from "../components/AdSlot";
import Pagination from "../components/Pagination";

const EMPTY_FILTERS = { level: "", type: "", role: "", location: "", company: "" };
const PAGE_SIZE = 8;

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .getJobs()
      .then((data) => {
        setJobs(data);
        if (data.length > 0) setSelectedId(data[0]._id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  useEffect(() => setPage(1), [filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Keep the selected job valid for whichever page is currently showing --
  // fall back to the first visible result, or clear the panel if none match.
  useEffect(() => {
    if (visible.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!visible.some((j) => j._id === selectedId)) {
      setSelectedId(visible[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const selectedJob = visible.find((j) => j._id === selectedId) || null;

  return (
    <div>
      <Helmet>
        <title>Careers — Open Roles — Merit & Margin</title>
        <meta
          name="description"
          content="Real open roles linking directly to each employer's own careers page — never a third-party job board."
        />
      </Helmet>
      <div className="lr-hero py-5 mb-5">
        <div className="container fade-in-up">
          <span className="badge badge-career mb-2">Careers</span>
          <h1 className="fw-bold" style={{ color: "var(--honey-deep)" }}>
            Open roles, straight from the source
          </h1>
          <p className="text-secondary lead mb-0" style={{ maxWidth: 620 }}>
            Every listing here links directly to the hiring company's own careers page —
            never a third-party job board, never a middleman.
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
          <LoadingState />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : jobs.length === 0 ? (
          <p className="text-secondary py-4">No open roles posted yet — check back soon.</p>
        ) : filtered.length === 0 ? (
          <p className="text-secondary py-4">No roles match those filters. Try clearing one or two.</p>
        ) : (
          <div className="row g-4">
            {/* ---- Left: filtered list ---- */}
            <div className="col-lg-4">
              <div className="d-flex flex-column gap-2" style={{ maxHeight: "68vh", overflowY: "auto" }}>
                {visible.map((job) => {
                  const isActive = job._id === selectedId;
                  return (
                    <button
                      key={job._id}
                      onClick={() => setSelectedId(job._id)}
                      className="text-start border-0 bg-transparent p-0"
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="lr-card p-3"
                        style={
                          isActive
                            ? { borderColor: "var(--rust)", borderWidth: 2, background: "var(--ivory-dim)" }
                            : {}
                        }
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <div className="fw-bold small">{job.company}</div>
                            <div className="fw-semibold">{job.title}</div>
                          </div>
                        </div>
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          <span className="badge badge-career">{job.level}</span>
                          <span className="badge bg-secondary">{job.type}</span>
                        </div>
                        <div className="text-secondary small mt-2">📍 {job.location}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>

            {/* ---- Right: selected job details ---- */}
            <div className="col-lg-8">
              {selectedJob && (
                <Reveal key={selectedJob._id}>
                  <div className="lr-card p-4 p-md-5">
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                      <span className="fw-bold">{selectedJob.company}</span>
                      <span className="text-secondary small">
                        · Posted {formatDate(selectedJob.postedDate)}
                      </span>
                    </div>
                    <h2 className="h3 mb-3">{selectedJob.title}</h2>

                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="badge badge-career">{selectedJob.level}</span>
                      <span className="badge bg-secondary">{selectedJob.type}</span>
                      <span className="badge bg-dark">{selectedJob.locationType}</span>
                      <span className="badge" style={{ background: "var(--sage)" }}>
                        {selectedJob.role}
                      </span>
                    </div>

                    <div className="text-secondary mb-4">📍 {selectedJob.location}</div>

                    {selectedJob.description && (
                      <p className="mb-4" style={{ maxWidth: 640, lineHeight: 1.75 }}>
                        {selectedJob.description}
                      </p>
                    )}

                    <div className="d-flex flex-wrap gap-3 align-items-center">
                      <a
                        href={selectedJob.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-warm btn-lg"
                        onClick={() => api.trackJobClick(selectedJob._id)}
                      >
                        Apply on {selectedJob.company}'s site ↗
                      </a>
                      {selectedJob.companyWebsite && (
                        <a
                          href={selectedJob.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary"
                        >
                          About {selectedJob.company} ↗
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        )}

        <AdSlot label="Ad slot — in-feed (responsive)" />
      </div>
    </div>
  );
}
