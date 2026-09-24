import { Link, NavLink } from "react-router-dom";
import SearchBox from "./SearchBox";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-md lr-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          Merit <span className="text-success">&amp;</span> Margin
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-md-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/finance">
                Finance
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/career">
                Careers
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/news">
                Money News
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">
                About
              </NavLink>
            </li>
            <li className="nav-item ms-md-2 my-2 my-md-0">
              <SearchBox />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
