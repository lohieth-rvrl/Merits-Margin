import { marked } from "marked";
import { Link } from "react-router-dom";
import { CATEGORIES, formatDate } from "../categories";
import CoverImage from "./CoverImage";
import AdSlot from "./AdSlot";

export function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function renderArticleBody(body) {
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth, text }) {
    const html = this.parser.parseInline(tokens);
    if (depth === 2) {
      const id = slugifyHeading(text);
      return `<h2 id="${id}">${html}</h2>`;
    }
    return `<h${depth}>${html}</h${depth}>`;
  };
  return marked.parse(body || "", { renderer });
}

/**
 * Renders a full article reading view. Used by the live public Article page
 * AND the admin editor's Preview tab, so what you see while writing is
 * exactly what visitors will see.
 */
export default function ArticleContent({ article, related = [], showAds = true, linkable = true }) {
  const meta = CATEGORIES[article.category] || CATEGORIES.finance;
  const html = renderArticleBody(article.body);

  return (
    <div>
      <div className="ratio ratio-21x9 rounded-4 overflow-hidden mb-4 fade-in-up">
        <CoverImage src={article.coverImage} category={article.category} alt={article.title} />
      </div>

      <span className={`badge ${meta.badgeClass} mb-2`}>{meta.label}</span>
      <h1 className="fw-bold">{article.title}</h1>
      <p className="text-secondary">
        {article.readTime} · {article.date ? formatDate(article.date) : ""}
      </p>

      <div className="row g-5 mt-2">
        <div className="col-lg-8">
          <p className="lead">{article.dek}</p>
          {showAds && <AdSlot label="Ad slot — in-article (responsive)" />}
          <div className="lr-article-body" dangerouslySetInnerHTML={{ __html: html }} />
          {showAds && <AdSlot label="Ad slot — in-article, end of post" />}
        </div>

        <div className="col-lg-4">
          {article.toc?.length > 0 && (
            <div className="border rounded-4 p-3 mb-4 sticky-top bg-white" style={{ top: 90 }}>
              <h4 className="h6 text-uppercase text-secondary">In this article</h4>
              <ol className="small ps-3 mb-0">
                {article.toc.map((heading) => (
                  <li key={heading} className="mb-2">
                    <a href={`#${slugifyHeading(heading)}`} className="text-decoration-none">
                      {heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {showAds && <AdSlot label="Ad slot — sidebar (300×250)" height={250} />}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-5 pt-4 border-top">
          <h2 className="h4 mb-3">Related reading</h2>
          <div className="row g-3">
            {related.map((r) => {
              const card = (
                <div className="lr-card p-3 h-100">
                  <span className={`badge ${CATEGORIES[r.category]?.badgeClass} mb-2`}>
                    {CATEGORIES[r.category]?.label}
                  </span>
                  <h3 className="h6 mb-0">{r.title}</h3>
                </div>
              );
              return (
                <div className="col-md-4" key={r._id || r.slug}>
                  {linkable ? (
                    <Link to={`/${r.category}/${r.slug}`} className="text-decoration-none text-dark">
                      {card}
                    </Link>
                  ) : (
                    card
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
