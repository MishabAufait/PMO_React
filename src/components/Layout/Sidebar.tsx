import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.scss";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active path
  const currentPath = location.pathname;

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">
            <div className="logo-squares">
              <div className="square square-1"></div>
              <div className="square square-2"></div>
              <div className="square square-3"></div>
              <div className="square square-4"></div>
            </div>
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="nav-icons">
          {/* Dashboard Icon */}
          <div
            className={`nav-item ${currentPath === "/" ? "active" : ""}`}
            title="Dashboard"
            onClick={() => navigate("/")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>

          {/* Power BI Icon */}
          <div
            className={`nav-item ${
              currentPath === "/power-bi" ? "active" : ""
            }`}
            title="Power BI"
            onClick={() => navigate("/power-bi")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v7H3v-7zm4-5h2v12H7V8zm4-4h2v16h-2V4zm4 8h2v8h-2v-8zm4-6h2v14h-2V6z" />
            </svg>
          </div>
          {/* Weekly Milestone Icon */}
          <div
            className={`nav-item ${
              currentPath === "/weeklymilestone" ? "active" : ""
            }`}
            title="Weekly Milestone"
            onClick={() => navigate("/weeklymilestone")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-file-pen-icon lucide-file-pen"
            >
              <path d="M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
}
