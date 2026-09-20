import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";

const emptyForm = {
  title: "",
  company: "",
  companyWebsite: "",
  applyUrl: "",
  location: "",
  locationType: "On-site",
  type: "Full-time",
  level: "Entry-level",
  role: "",
  description: "",
  postedDate: new Date().toISOString().slice(0, 10),
};

// Common aggregator domains -- if the apply link points to one of these,
// warn the admin, since the whole point of this board is direct-to-employer
// applications rather than routing through a third-party job site.
const AGGREGATOR_HINTS = [
  "indeed.", "linkedin.", "glassdoor.", "ziprecruiter.", "monster.",
  "simplyhired.", "careerbuilder.", "ergrenzen", "ivyexec.",
];

function looksLikeAggregator(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return AGGREGATOR_HINTS.some((frag) => host.includes(frag));
  } catch {
    return false;
  }
}

export default function JobForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditing) return;
    api
      .getJobById(id)
      .then((j) =>
        setForm({
          title: j.title,
          company: j.company,
          companyWebsite: j.companyWebsite || "",
          applyUrl: j.applyUrl,
          location: j.location,
          locationType: j.locationType,
          type: j.type,
          level: j.level,
          role: j.role,
          description: j.description || "",
          postedDate: new Date(j.postedDate).toISOString().slice(0, 10),
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(status) {
    if (!form.title || !form.company || !form.applyUrl || !form.location || !form.role) {
      setError("Title, company, apply link, location, and role are all required.");
      return;
    }
    setError(null);
    setSaving(status);
    const payload = { ...form, status };
    try {
      if (isEditing) {
        await api.updateJob(id, payload);
      } else {
        await api.createJob(payload);
      }
      navigate("/admin/jobs");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="lr-spinner" />
      </div>
    );
  }

  const applyUrlWarning = form.applyUrl && looksLikeAggregator(form.applyUrl);

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <h1 className="h3 fw-bold mb-0">{isEditing ? "Edit job listing" : "New job listing"}</h1>
        <div className="d-flex gap-2">
          <button
            className="btn btn-warm-outline"
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving !== null}
          >
            {saving === "draft" ? "Saving…" : "Save as draft"}
          </button>
          <button
            className="btn btn-warm"
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving !== null}
          >
            {saving === "published" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row">
          <div className="col-md-7 mb-3">
            <label className="form-label fw-semibold">Job title</label>
            <input
              className="form-control"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Software Engineer"
              required
            />
          </div>
          <div className="col-md-5 mb-3">
            <label className="form-label fw-semibold">Company</label>
            <input
              className="form-control"
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Acme Inc."
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Apply link <span className="text-secondary fw-normal">(must go directly to the employer's own site)</span>
          </label>
          <input
            type="url"
            className="form-control"
            value={form.applyUrl}
            onChange={(e) => update("applyUrl", e.target.value)}
            placeholder="https://acme.com/careers/software-engineer"
            required
          />
          {applyUrlWarning && (
            <div className="alert alert-warning mt-2 py-2 small mb-0">
              ⚠️ This link looks like a third-party job board rather than the company's own site.
              This board is meant to only link directly to employers — double check before publishing.
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">
            Company website <span className="text-secondary fw-normal">(optional — shown as "About the company")</span>
          </label>
          <input
            type="url"
            className="form-control"
            value={form.companyWebsite}
            onChange={(e) => update("companyWebsite", e.target.value)}
            placeholder="https://acme.com"
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Location</label>
            <input
              className="form-control"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Remote (US), or New York, NY"
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Location type</label>
            <select
              className="form-select"
              value={form.locationType}
              onChange={(e) => update("locationType", e.target.value)}
            >
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label fw-semibold">Job type</label>
            <select className="form-select" value={form.type} onChange={(e) => update("type", e.target.value)}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label fw-semibold">Level</label>
            <select className="form-select" value={form.level} onChange={(e) => update("level", e.target.value)}>
              <option>Entry-level</option>
              <option>Mid-level</option>
              <option>Senior</option>
              <option>Lead / Manager</option>
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label fw-semibold">Role / department</label>
            <input
              className="form-control"
              list="role-suggestions"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Engineering"
              required
            />
            <datalist id="role-suggestions">
              <option value="Engineering" />
              <option value="Design" />
              <option value="Marketing" />
              <option value="Sales" />
              <option value="Customer Support" />
              <option value="Operations" />
              <option value="Finance" />
              <option value="Other" />
            </datalist>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Posted date</label>
          <input
            type="date"
            className="form-control"
            style={{ maxWidth: 220 }}
            value={form.postedDate}
            onChange={(e) => update("postedDate", e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Short description (optional)</label>
          <textarea
            className="form-control"
            rows="4"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="A sentence or two on the role -- kept short since the real details live on the employer's own posting."
          />
        </div>
      </form>
    </div>
  );
}
