import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES } from "../../categories";
import CoverImage from "../../components/CoverImage";
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

function autoResize(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export default function ArticleForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { email } = useAuth();

  const titleRef = useRef(null);
  const dekRef = useRef(null);
  const bodyRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [lastStatus, setLastStatus] = useState("draft"); // reflects saved status, for the top-bar pill
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(null); // null | "draft" | "published"
  const [error, setError] = useState(null);

  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [showSelectionToolbar, setShowSelectionToolbar] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        setLastStatus(a.status || "draft");
        setSlugManuallyEdited(true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  // Auto-resize title/dek/body as content changes
  useEffect(() => autoResize(titleRef.current), [form.title]);
  useEffect(() => autoResize(dekRef.current), [form.dek]);
  useEffect(() => autoResize(bodyRef.current), [form.body]);

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
    try {
      const dataUrl = await compressImage(file, 1400, 0.82);
      update("coverImage", dataUrl);
    } catch {
      setError("Couldn't process that image — try a different file.");
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
      autoResize(textarea);
    });
  }

  // Converts the current selection into a heading (keeping the selected
  // words), instead of just dropping "## " in and deleting what was selected.
  function toolbarHeading() {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.body.slice(start, end) || "Heading";
    const insertText = `\n\n## ${selected}\n\n`;
    const newBody = form.body.slice(0, start) + insertText + form.body.slice(end);
    update("body", newBody);
    requestAnimationFrame(() => {
      textarea.focus();
      autoResize(textarea);
    });
  }

  function toYouTubeEmbedUrl(url) {
    try {
      const u = new URL(url);
      let videoId = null;
      if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.slice(1);
      } else if (u.hostname.includes("youtube.com")) {
        videoId = u.searchParams.get("v") || u.pathname.split("/embed/")[1];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  }

  function handleInsertEmbed() {
    const url = window.prompt("Paste a YouTube video URL to embed:");
    if (!url) return;
    const embedUrl = toYouTubeEmbedUrl(url.trim());
    if (embedUrl) {
      insertAtCursor(
        `\n\n<div class="lr-embed-wrapper"><iframe src="${embedUrl}" allowfullscreen title="Embedded video"></iframe></div>\n\n`
      );
    } else {
      // Non-YouTube links usually can't be embedded due to the source
      // site's iframe restrictions, so fall back to a plain link.
      insertAtCursor(`\n\n[Watch: ${url}](${url})\n\n`);
    }
    setShowInsertMenu(false);
  }

  function handleInsertCodeBlock() {
    insertAtCursor("\n\n```\nyour code here\n```\n\n");
    setShowInsertMenu(false);
  }

  async function handleInsertImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await compressImage(file, 900, 0.78);
      insertAtCursor(`\n\n![Describe this image](${dataUrl})\n\n`);
    } catch {
      setError("Couldn't process that image — try a different file.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
      setShowInsertMenu(false);
    }
  }

  function handleBodySelect() {
    const textarea = bodyRef.current;
    if (!textarea) return;
    setShowSelectionToolbar(textarea.selectionStart !== textarea.selectionEnd);
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
    if (!form.title.trim() || !form.body.trim()) {
      setError("Add a title and some body text before saving.");
      return;
    }
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
    <div>
      {/* ---------- TOP BAR ---------- */}
      <div className="lr-editor-topbar py-2 sticky-top">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <Link to="/admin" className="lr-editor-wordmark text-decoration-none">
              Ledger &amp; Route
            </Link>
            <span className="lr-status-pill">{lastStatus === "published" ? "Published" : "Draft"}</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            {error && <span className="text-danger small d-none d-md-inline">{error}</span>}
            <button className="lr-text-btn" type="button" onClick={() => setShowPreview((p) => !p)}>
              {showPreview ? "Back to editing" : "Preview"}
            </button>
            <button
              className="lr-text-btn"
              type="button"
              onClick={() => handleSave("draft")}
              disabled={saving !== null}
            >
              {saving === "draft" ? "Saving…" : "Save draft"}
            </button>
            <button className="lr-publish-btn" type="button" onClick={() => setShowPublishModal(true)}>
              Publish
            </button>
          </div>
        </div>
        {error && <div className="container text-danger small d-md-none pt-1">{error}</div>}
      </div>

      {showPreview ? (
        <div className="container py-5">
          <div className="lr-editor-canvas">
            <ArticleContent article={previewArticle} related={[]} showAds={false} linkable={false} />
          </div>
        </div>
      ) : (
        <div className="container py-5">
          <div className="lr-editor-canvas">
            {/* Cover image */}
            {form.coverImage ? (
              <div className="lr-cover-strip">
                <img src={form.coverImage} alt="Cover" />
                <div className="lr-cover-actions">
                  <label className="lr-text-btn bg-white rounded-pill px-3 py-1 shadow-sm" style={{ cursor: "pointer" }}>
                    Change
                    <input type="file" accept="image/*" className="d-none" onChange={handleCoverUpload} />
                  </label>
                  <button
                    className="lr-text-btn bg-white rounded-pill px-3 py-1 shadow-sm"
                    type="button"
                    onClick={() => update("coverImage", "")}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="lr-add-cover-link">
                🖼️ Add a cover image
                <input type="file" accept="image/*" className="d-none" onChange={handleCoverUpload} />
              </label>
            )}

            {/* Title */}
            <textarea
              ref={titleRef}
              className="lr-title-input"
              placeholder="Title"
              rows={1}
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />

            {/* Dek / subtitle */}
            <textarea
              ref={dekRef}
              className="lr-dek-input"
              placeholder="Write a one-line summary…"
              rows={1}
              value={form.dek}
              onChange={(e) => update("dek", e.target.value)}
            />

            {/* Selection toolbar */}
            {showSelectionToolbar && (
              <div className="lr-selection-toolbar">
                <button type="button" onClick={() => insertAtCursor("**", true)} title="Bold">
                  <strong>B</strong>
                </button>
                <button type="button" onClick={() => insertAtCursor("_", true)} title="Italic">
                  <em>I</em>
                </button>
                <button type="button" onClick={toolbarHeading} title="Heading">
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor("[link text](https://example.com)")}
                  title="Link"
                >
                  🔗
                </button>
              </div>
            )}

            {/* Body + plus menu */}
            <div className="lr-body-row">
              <button
                className={`lr-plus-btn ${showInsertMenu ? "is-open" : ""}`}
                type="button"
                onClick={() => setShowInsertMenu((s) => !s)}
                aria-label="Insert content"
              >
                +
              </button>

              <div className="flex-grow-1">
                {showInsertMenu && (
                  <div className="lr-insert-menu mb-2">
                    <label title="Insert image">
                      {uploadingImage ? "…" : "🖼️"}
                      <input type="file" accept="image/*" className="d-none" onChange={handleInsertImage} />
                    </label>
                    <button type="button" title="Divider" onClick={() => insertAtCursor("\n\n---\n\n")}>
                      ─
                    </button>
                    <button
                      type="button"
                      title="Heading"
                      onClick={() => insertAtCursor("\n\n## Section heading\n\n")}
                    >
                      H2
                    </button>
                    <button type="button" title="Quote" onClick={() => insertAtCursor("\n\n> Quote\n\n")}>
                      ❝
                    </button>
                    <button
                      type="button"
                      title="Bulleted list"
                      onClick={() => insertAtCursor("\n\n- List item\n- List item\n\n")}
                    >
                      •
                    </button>
                    <button type="button" title="Code block" onClick={handleInsertCodeBlock}>
                      {"</>"}
                    </button>
                    <button type="button" title="Embed a video" onClick={handleInsertEmbed}>
                      ▶
                    </button>
                  </div>
                )}
                <textarea
                  ref={bodyRef}
                  className="lr-body-textarea"
                  placeholder="Tell your story…"
                  value={form.body}
                  onChange={(e) => update("body", e.target.value)}
                  onSelect={handleBodySelect}
                  onBlur={() => setTimeout(() => setShowSelectionToolbar(false), 150)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- PUBLISH MODAL ---------- */}
      {showPublishModal && (
        <div className="lr-modal-backdrop" onClick={() => setShowPublishModal(false)}>
          <div className="lr-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="h4 mb-3">Story details</h2>

            <div className="lr-modal-preview-card">
              <CoverImage src={form.coverImage} category={form.category} alt={form.title} className="rounded-2" />
              <div>
                <div className="fw-semibold">{form.title || "Untitled story"}</div>
                <div className="text-secondary small">{form.dek}</div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label fw-semibold">URL slug</label>
                <input
                  className="form-control"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    update("slug", slugify(e.target.value));
                  }}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Category</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  {Object.entries(CATEGORIES).map(([key, c]) => (
                    <option key={key} value={key}>
                      {c.label}
                    </option>
                  ))}
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
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Read time</label>
                <input
                  className="form-control"
                  value={form.readTime}
                  onChange={(e) => update("readTime", e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Table of contents <span className="text-secondary fw-normal">(one heading per line)</span>
              </label>
              <textarea
                className="form-control"
                rows="3"
                value={form.toc}
                onChange={(e) => update("toc", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Related article slugs <span className="text-secondary fw-normal">(comma-separated)</span>
              </label>
              <input
                className="form-control"
                value={form.related}
                onChange={(e) => update("related", e.target.value)}
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex justify-content-end gap-2">
              <button className="lr-text-btn" type="button" onClick={() => setShowPublishModal(false)}>
                Cancel
              </button>
              <button
                className="lr-publish-btn"
                type="button"
                disabled={saving !== null}
                onClick={async () => {
                  await handleSave("published");
                  setShowPublishModal(false);
                }}
              >
                {saving === "published" ? "Publishing…" : "Publish now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
