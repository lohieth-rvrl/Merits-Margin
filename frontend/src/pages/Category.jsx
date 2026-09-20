import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { CATEGORIES, formatDate } from "../categories";
import AdSlot from "../components/AdSlot";
import CoverImage from "../components/CoverImage";
import Reveal from "../components/Reveal";
import Pagination from "../components/Pagination";
import NotFound from "./NotFound";

const PAGE_SIZE = 8;

const SORTS = {
  newest: { label: "Newest first", fn: (a, b) => new Date(b.date) - new Date(a.date) },
  oldest: { label: "Oldest first", fn: (a, b) => new Date(a.date) - new Date(b.date) },
  quickest: { label: "Quickest read first", fn: (a, b) => readMinutes(a) - readMinutes(b) },
  longest: { label: "Longest read first", fn: (a, b) => readMinutes(b) - readMinutes(a) },
};

function readMinutes(article) {
  const match = (article.readTime || "").match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export default function Category() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [year, setYear] = useState("");
  const [readLength, setReadLength] = useState(""); // "", "quick", "long"
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .getArticles(category)
      .then(setArticles)
      .finally(() => setLoading(false));
  }, [category]);

  const years = useMemo(() => {
    return [...new Set(articles.map((a) => new Date(a.date).getFullYear()))].sort((a, b) => b - a);
  }, [articles]);

  const filtered = useMemo(() => {
    let list = [...articles];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) => a.title.toLowerCase().includes(q) || (a.dek || "").toLowerCase().includes(q)
      );
    }
    if (year) {
      list = list.filter((a) => new Date(a.date).getFullYear() === Number(year));
    }
    if (readLength === "quick") {
      list = list.filter((a) => readMinutes(a) <= 5);
    } else if (readLength === "long") {
      list = list.filter((a) => readMinutes(a) > 5);
    }

    list.sort(SORTS[sort].fn);
    return list;
  }, [articles, search, year, readLength, sort]);

  useEffect(() => setPage(1), [search, year, readLength, sort, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const meta = CATEGORIES[category];
  if (!meta) return <NotFound />;

  const activeFilterCount = [search, year, readLength].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setYear("");
    setReadLength("");
  }

  return (
    <div>
      <div className="lr-hero py-5 mb-5">
        <div className="container fade-in-up">
          <span className={`badge ${meta.badgeClass} mb-2`}>Section</span>
          <h1 className="fw-bold" style={{ color: meta.color }}>
            {meta.label}
          </h1>
          <p className="text-secondary lead mb-0" style={{ maxWidth: 600 }}>
            {category === "finance" &&
              "Budgeting, saving, credit, and investing basics — explained without jargon."}
            {category === "news" &&
              "What's happening in the economy and job market, and what it actually means for you."}
          </p>
        </div>
      </div>

      <div className="container pb-5">
        {/* ---------- Search + filters ---------- */}
        <div className="lr-card p-3 p-md-4 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold mb-1">Search</label>
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Search titles and summaries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1">Sort by</label>
              <select className="form-select form-select-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="col-3 col-md-2">
              <label className="form-label small fw-semibold mb-1">Year</label>
              <select className="form-select form-select-sm" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">All</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="col-3 col-md-3">
              <label className="form-label small fw-semibold mb-1">Length</label>
              <select
                className="form-select form-select-sm"
                value={readLength}
                onChange={(e) => setReadLength(e.target.value)}
              >
                <option value="">Any length</option>
                <option value="quick">Quick reads (≤5 min)</option>
                <option value="long">Deep dives (5+ min)</option>
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="mt-3">
              <button className="lr-text-btn" onClick={clearFilters}>
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
        ) : articles.length === 0 ? (
          <p className="text-secondary py-4">No articles in this section yet.</p>
        ) : filtered.length === 0 ? (
          <p className="text-secondary py-4">No articles match those filters. Try clearing one or two.</p>
        ) : (
          <>
            <p className="text-secondary small mb-3">
              {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="row g-4 reveal-group">
              {visible.map((a) => (
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
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}

        <AdSlot label="Ad slot — in-feed (responsive)" />
      </div>
    </div>
  );
}
