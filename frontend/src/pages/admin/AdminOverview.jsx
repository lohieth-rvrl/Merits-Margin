import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES, formatDate } from "../../categories";
import AdminTabs from "../../components/AdminTabs";
import StatCard from "../../components/StatCard";
import Reveal from "../../components/Reveal";

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function AdminOverview() {
  const { email } = useAuth();
  const [articles, setArticles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getAllArticlesAdmin(), api.getAllJobsAdmin()])
      .then(([a, j]) => {
        setArticles(a);
        setJobs(j);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const published = articles.filter((a) => a.status === "published");
    const drafts = articles.filter((a) => a.status === "draft");
    const scheduled = articles.filter((a) => a.status === "scheduled");
    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    const publishedJobs = jobs.filter((j) => j.status === "published");
    const totalClicks = jobs.reduce((sum, j) => sum + (j.clicks || 0), 0);
    return {
      totalArticles: articles.length,
      published: published.length,
      drafts: drafts.length,
      scheduled: scheduled.length,
      totalViews,
      totalJobs: jobs.length,
      publishedJobs: publishedJobs.length,
      totalClicks,
    };
  }, [articles, jobs]);

  const categoryData = useMemo(() => {
    return Object.entries(CATEGORIES).map(([key, c]) => ({
      name: c.label,
      count: articles.filter((a) => a.category === key).length,
      color: c.color,
    }));
  }, [articles]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push(monthKey(d));
    }
    const counts = Object.fromEntries(buckets.map((k) => [k, 0]));
    articles
      .filter((a) => a.status === "published")
      .forEach((a) => {
        const k = monthKey(a.date);
        if (counts[k] !== undefined) counts[k] += 1;
      });
    return buckets.map((k) => ({ month: monthLabel(k), count: counts[k] }));
  }, [articles]);

  const mostViewed = useMemo(() => {
    return [...articles]
      .filter((a) => a.status === "published")
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [articles]);

  const recentActivity = useMemo(() => {
    const articleEvents = articles.map((a) => ({
      type: "article",
      title: a.title,
      status: a.status,
      timestamp: a.updatedAt || a.createdAt,
      link: `/admin/edit/${a._id}`,
    }));
    const jobEvents = jobs.map((j) => ({
      type: "job",
      title: `${j.title} — ${j.company}`,
      status: j.status,
      timestamp: j.updatedAt || j.createdAt,
      link: `/admin/jobs/edit/${j._id}`,
    }));
    return [...articleEvents, ...jobEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 6);
  }, [articles, jobs]);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <div>
          <h1 className="h3 fw-bold mb-0">Overview</h1>
          <p className="text-secondary small mb-0">Signed in as {email}</p>
        </div>
      </div>

      <AdminTabs active="overview" />

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="lr-spinner" />
        </div>
      ) : (
        <>
          {/* ---------- KPI cards ---------- */}
          <div className="row g-3 mb-4 reveal-group">
            <div className="col-6 col-md-3">
              <Reveal><StatCard label="Total articles" value={stats.totalArticles} accent="var(--espresso)" /></Reveal>
            </div>
            <div className="col-6 col-md-3">
              <Reveal><StatCard label="Published" value={stats.published} accent="var(--sage)" /></Reveal>
            </div>
            <div className="col-6 col-md-3">
              <Reveal><StatCard label="Scheduled" value={stats.scheduled} accent="var(--honey)" /></Reveal>
            </div>
            <div className="col-6 col-md-3">
              <Reveal><StatCard label="Drafts" value={stats.drafts} accent="var(--honey-deep)" /></Reveal>
            </div>
          </div>
          <div className="row g-3 mb-5 reveal-group">
            <div className="col-6 col-md-3">
              <Reveal><StatCard label="Total views" value={stats.totalViews} accent="var(--rust)" /></Reveal>
            </div>
            <div className="col-6 col-md-3">
              <Reveal><StatCard label="Job listings" value={stats.totalJobs} accent="var(--espresso)" /></Reveal>
            </div>
            <div className="col-6 col-md-3">
              <Reveal><StatCard label="Live job listings" value={stats.publishedJobs} accent="var(--sage)" /></Reveal>
            </div>
            <div className="col-6 col-md-3">
              <Reveal><StatCard label="Apply clicks" value={stats.totalClicks} accent="var(--honey-deep)" /></Reveal>
            </div>
          </div>

          {/* ---------- Charts ---------- */}
          <div className="row g-4 mb-5">
            <div className="col-lg-6">
              <Reveal className="h-100">
                <div className="lr-card p-4 h-100">
                  <h2 className="h6 text-uppercase text-secondary mb-3">Articles by category</h2>
                  {stats.totalArticles === 0 ? (
                    <p className="text-secondary small mb-0">No articles yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--espresso-soft)" }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--espresso-soft)" }} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {categoryData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Reveal>
            </div>
            <div className="col-lg-6">
              <Reveal className="h-100">
                <div className="lr-card p-4 h-100">
                  <h2 className="h6 text-uppercase text-secondary mb-3">Published per month</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--rust)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--rust)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--espresso-soft)" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--espresso-soft)" }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="var(--rust)" fill="url(#colorCount)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Reveal>
            </div>
          </div>

          {/* ---------- Most viewed + recent activity ---------- */}
          <div className="row g-4">
            <div className="col-lg-6">
              <Reveal className="h-100">
                <div className="lr-card p-4 h-100">
                  <h2 className="h6 text-uppercase text-secondary mb-3">Most viewed articles</h2>
                  {mostViewed.length === 0 ? (
                    <p className="text-secondary small mb-0">No published articles with views yet.</p>
                  ) : (
                    <ol className="list-unstyled mb-0">
                      {mostViewed.map((a, i) => (
                        <li key={a._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <span className="d-flex align-items-center gap-2">
                            <span className="text-secondary small" style={{ width: 18 }}>{i + 1}.</span>
                            <Link to={`/admin/edit/${a._id}`} className="text-decoration-none text-dark small fw-semibold">
                              {a.title}
                            </Link>
                          </span>
                          <span className="badge bg-dark">{(a.views || 0).toLocaleString()} views</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </Reveal>
            </div>
            <div className="col-lg-6">
              <Reveal className="h-100">
                <div className="lr-card p-4 h-100">
                  <h2 className="h6 text-uppercase text-secondary mb-3">Recent activity</h2>
                  {recentActivity.length === 0 ? (
                    <p className="text-secondary small mb-0">Nothing yet.</p>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {recentActivity.map((item, i) => (
                        <li key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <span className="small">
                            <span className="me-2">{item.type === "article" ? "📝" : "💼"}</span>
                            <Link to={item.link} className="text-decoration-none text-dark fw-semibold">
                              {item.title}
                            </Link>
                          </span>
                          <span className={`badge ${item.status === "draft" ? "bg-secondary" : "bg-dark"}`}>
                            {item.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
