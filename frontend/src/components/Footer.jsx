import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="lr-footer py-4 mt-5">
      <div className="container d-flex flex-wrap justify-content-between gap-3 text-secondary small">
        <div>© {new Date().getFullYear()} Merit &amp; Margin. All rights reserved.</div>
        <div className="d-flex gap-3">
          <Link className="text-secondary text-decoration-none" to="/about">About</Link>
          <Link className="text-secondary text-decoration-none" to="/contact">Contact</Link>
          <Link className="text-secondary text-decoration-none" to="/privacy">Privacy Policy</Link>
          <Link className="text-secondary text-decoration-none" to="/terms">Terms</Link>
          <Link className="text-secondary text-decoration-none" to="/admin/login">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
