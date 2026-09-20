const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // ---- public ----
  getArticles: (category) =>
    fetch(`${API_URL}/articles${category ? `?category=${category}` : ""}`).then(handle),

  getArticleBySlug: (slug) =>
    fetch(`${API_URL}/articles/slug/${slug}`).then(handle),

  // ---- auth ----
  login: (email, password) =>
    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handle),

  // ---- admin ----
  getAllArticlesAdmin: () =>
    fetch(`${API_URL}/articles/all`, { headers: authHeaders() }).then(handle),

  getArticleById: (id) =>
    fetch(`${API_URL}/articles/admin/${id}`, { headers: authHeaders() }).then(handle),

  createArticle: (payload) =>
    fetch(`${API_URL}/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),

  updateArticle: (id, payload) =>
    fetch(`${API_URL}/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),

  deleteArticle: (id) =>
    fetch(`${API_URL}/articles/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handle),
};
