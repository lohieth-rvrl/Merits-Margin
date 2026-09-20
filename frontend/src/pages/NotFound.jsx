import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5">
      <h1 className="display-4 fw-bold text-secondary">404</h1>
      <h2 className="h4">That page moved or never existed.</h2>
      <p>
        Try the <Link to="/">homepage</Link>, or one of the sections: {" "}
        <Link to="/finance">Finance</Link> · <Link to="/career">Career &amp; Jobs</Link> ·{" "}
        <Link to="/news">Money News</Link>
      </p>
    </div>
  );
}
