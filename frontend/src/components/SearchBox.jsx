import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form className="d-flex" role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        className="form-control form-control-sm"
        placeholder="Search…"
        aria-label="Search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: 160 }}
      />
    </form>
  );
}
