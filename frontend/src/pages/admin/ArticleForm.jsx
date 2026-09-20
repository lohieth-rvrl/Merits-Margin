import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import ArticleContent from "../../components/ArticleContent";

const emptyForm = {
  title: "",
  slug: "",
  category: "finance",
  dek: "",
  readTime: "5 min read",
  date: new Date().toISOString().slice(0, 10),
  toc: "",
  related: "",
  body: "",
  coverImage: "",
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Resize + compress an uploaded image client-side so base64 documents in
// MongoDB stay reasonably small, instead of storing multi-megabyte originals.
function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ArticleForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const bodyRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(null); // null | "draft" | "published"
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("write");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    api
      .getArticleById(id)
      .then((a) => {
        setForm({
          title: a.title,
          slug: a.slug,
          category: a.category,
          dek: a.dek,
          readTime: a.readTime,
          date: new Date(a.date).toISOString().slice(0, 10),
          toc: (a.toc || []).join("\n"),
          related: (a.related || []).join(", "),
          body: a.body,
          coverImage: a.coverImage || "",
        });
        setSlugManuallyEdited(true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "title" && !slugManuallyEdited) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const dataUrl = await compressImage(file, 1400, 0.82);
      update("coverImage", dataUrl);
    } catch {
      setError("Couldn't process that image — try a different file.");
    } finally {
      setUploadingCover(false);
    }
  }

  function insertAtCursor(snippet, wrapSelected = false) {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.body.slice(start, end);
    const insertText = wrapSelected && selected ? `${snippet}${selected}${snippet}` : snippet;
    const newBody = form.body.slice(0, start) + insertText + form.body.slice(end);
    update("body", newBody);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + insertText.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }

  function toolbarBold() {
    insertAtCursor("**", true);
  }
  function toolbarItalic() {
    insertAtCursor("_", true);
  }
  function toolbarHeading() {
    insertAtCursor("\n## Section heading\n");
  }
  function toolbarList() {
    insertAtCursor("\n- List item\n- List item\n");
  }
  function toolbarLink() {
    insertAtCursor("[link text](https://example.com)");
  }

  async function toolbarImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    try {
      const dataUrl = await compressImage(file, 1000, 0.78);
      insertAtCursor(`\n![Describe this image](${dataUrl})\n`);
    } catch {
      setError("Couldn't process that image — try a different file.");
    } finally {
      setUploadingInline(false);
      e.target.value = "";
    }
  }

  function buildPayload(status) {
    return {
      title: form.title,
      slug: form.slug,
      category: form.category,
      dek: form.dek,
      readTime: form.readTime,
      date: form.date,
      toc: form.toc.split("\n").map((s) => s.trim()).filter(Boolean),
      related: form.related.split(",").map((s) => s.trim()).filter(Boolean),
      body: form.body,
      coverImage: form.coverImage,
      status,
    };
  }

  async function handleSave(status) {
    setError(null);
    setSaving(status);
    const payload = buildPayload(status);
    try {
      if (isEditing) {
        await api.updateArticle(id, payload);
      } else {
        await api.createArticle(payload);
      }
      navigate("/admin");
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

  const previewArticle = {
    ...form,
    toc: form.toc.split("\n").map((s) => s.trim()).filter(Boolean),
  };

  return (
    <div className="container py-5" style={{ maxWidth: 920 }}>
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <h1 className="h3 fw-bold mb-0">{isEditing ? "Edit article" : "New article"}</h1>
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

      <ul className="nav nav-tabs lr-editor-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "write" ? "active" : ""}`}
            onClick={() => setActiveTab("write")}
            type="button"
          >
            Write
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
            type="button"
          >
            Preview
          </button>
        </li>
      </ul>

      {activeTab === "preview" ? (
        <div className="border rounded-4 p-4 bg-white">
          <ArticleContent article={previewArticle} related={[]} showAds={false} linkable={false} />
        </div>
      ) : (
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Cover image */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Cover image</label>
            {form.coverImage ? (
              <div className="position-relative" style={{ maxWidth: 420 }}>
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="rounded-4 w-100"
                  style={{ aspectRatio: "16/9", objectFit: "cover" }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2"
                  onClick={() => update("coverImage", "")}
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="lr-dropzone d-flex flex-column align-items-center justify-content-center p-4 text-center" style={{ maxWidth: 420, minHeight: 140 }}>
                {uploadingCover ? (
                  <div className="lr-spinner" />
                ) : (
                  <>
                    <div className="fw-semibold">Click to upload a cover image</div>
                    <div className="text-secondary small">JPG or PNG — automatically resized</div>
                  </>
                )}
                <input type="file" accept="image/*" className="d-none" onChange={handleCoverUpload} />
              </label>
            )}
            <div className="text-secondary small mt-2">
              No image? The site shows a generated illustration matching the category instead.
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Title</label>
            <input
              className="form-control"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-8 mb-3">
              <label className="form-label fw-semibold">
                URL slug <span className="text-secondary fw-normal">(auto-filled — edit if you like)</span>
              </label>
              <input
                className="form-control"
                value={form.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  update("slug", slugify(e.target.value));
                }}
                required
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                <option value="finance">Finance</option>
                <option value="career">Career & Jobs</option>
                <option value="news">Money News</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-8 mb-3">
              <label className="form-label fw-semibold">Publish date</label>
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                required
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Read time</label>
              <input
                className="form-control"
                value={form.readTime}
                onChange={(e) => update("readTime", e.target.value)}
                placeholder="6 min read"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Dek (one-sentence summary)</label>
            <textarea
              className="form-control"
              rows="2"
              value={form.dek}
              onChange={(e) => update("dek", e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Table of contents headings{" "}
              <span className="text-secondary fw-normal">(one per line, must match ## headings below)</span>
            </label>
            <textarea
              className="form-control"
              rows="3"
              value={form.toc}
              onChange={(e) => update("toc", e.target.value)}
              placeholder={"Start with your floor\nUse percentages, not fixed amounts"}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Related article slugs <span className="text-secondary fw-normal">(comma-separated)</span>
            </label>
            <input
              className="form-control"
              value={form.related}
              onChange={(e) => update("related", e.target.value)}
              placeholder="emergency-fund-how-much, budget-with-irregular-income"
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Body (Markdown)</label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              <button type="button" className="btn btn-sm btn-outline-secondary fw-bold" onClick={toolbarBold}>B</button>
              <button type="button" className="btn btn-sm btn-outline-secondary fst-italic" onClick={toolbarItalic}>I</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={toolbarHeading}>H2</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={toolbarList}>• List</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={toolbarLink}>🔗 Link</button>
              <label className="btn btn-sm btn-outline-secondary mb-0">
                {uploadingInline ? "Uploading…" : "🖼️ Insert image"}
                <input type="file" accept="image/*" className="d-none" onChange={toolbarImage} />
              </label>
            </div>
            <textarea
              ref={bodyRef}
              className="form-control font-monospace"
              rows="16"
              value={form.body}
              onChange={(e) => update("body", e.target.value)}
              placeholder="## First section heading&#10;&#10;Write your paragraph here..."
              required
            />
            <div className="text-secondary small mt-1">
              Use <code>## Heading</code> for sections, <code>**bold**</code>, <code>_italic_</code>, and{" "}
              <code>- item</code> for bulleted lists. Switch to the Preview tab anytime to see how it will look.
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
