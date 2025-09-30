import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.scss';

export default function Sidebar() {
  const navigate = useNavigate();

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
            className="nav-item active"
            title="Dashboard"
            onClick={() => navigate('/')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          
          {/* Power BI / Graph Icon */}
          <div
            className="nav-item"
            title="Power BI"
            onClick={() => navigate('/power-bi')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v7H3v-7zm4-5h2v12H7V8zm4-4h2v16h-2V4zm4 8h2v8h-2v-8zm4-6h2v14h-2V6z"/>
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
}
