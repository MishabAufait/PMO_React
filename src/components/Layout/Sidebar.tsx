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
          
          <div className="nav-item" title="Documents">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zM4 4v2h16V4H4zm12 4H8v12h8V8z"/>
            </svg>
          </div>
          
          {/* <div className="nav-item" title="Stars">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div> */}
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