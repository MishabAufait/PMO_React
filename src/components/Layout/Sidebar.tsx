import * as React from 'react';
import './Sidebar.scss';

export default function Sidebar() {
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
          <div className="nav-item active" title="Dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          
          <div className="nav-item" title="Reports">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          
          <div className="nav-item" title="Approvals">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <div className="nav-item" title="Documents">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zM4 4v2h16V4H4zm12 4H8v12h8V8z"/>
            </svg>
          </div>
          
          <div className="nav-item" title="Stars">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Bottom Profile */}
      <div className="profile-section">
        <div className="profile-avatar">
          <span>JD</span>
        </div>
      </div>
    </aside>
  );
}