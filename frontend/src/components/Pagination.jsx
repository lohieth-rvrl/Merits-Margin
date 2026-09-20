export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and neighbors; collapse the rest with "…"
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav className="d-flex justify-content-center align-items-center gap-1 my-4" aria-label="Pagination">
      <button
        className="btn btn-sm btn-warm-outline"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ‹ Prev
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-secondary">…</span>
        ) : (
          <button
            key={p}
            className="btn btn-sm"
            onClick={() => onChange(p)}
            style={
              p === page
                ? { background: "var(--rust)", color: "white", border: "1px solid var(--rust)" }
                : { background: "white", color: "var(--espresso)", border: "1px solid var(--line)" }
            }
          >
            {p}
          </button>
        )
      )}
      <button
        className="btn btn-sm btn-warm-outline"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next ›
      </button>
    </nav>
  );
}
