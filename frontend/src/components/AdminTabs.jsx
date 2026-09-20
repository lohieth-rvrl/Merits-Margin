import { Link } from "react-router-dom";

const TABS = [
  { to: "/admin", key: "overview", label: "Overview" },
  { to: "/admin/articles", key: "articles", label: "Articles" },
  { to: "/admin/jobs", key: "jobs", label: "Jobs" },
];

export default function AdminTabs({ active }) {
  return (
    <div className="d-flex gap-3 mb-4 border-bottom">
      {TABS.map((tab) =>
        tab.key === active ? (
          <span
            key={tab.key}
            className="pb-2 fw-bold"
            style={{ color: "var(--rust)", borderBottom: "2px solid var(--rust)" }}
          >
            {tab.label}
          </span>
        ) : (
          <Link key={tab.key} to={tab.to} className="lr-text-btn pb-2">
            {tab.label}
          </Link>
        )
      )}
    </div>
  );
}
