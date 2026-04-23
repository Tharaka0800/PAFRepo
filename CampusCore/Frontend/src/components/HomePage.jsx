import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={{ animation: 'fadeIn 0.8s ease' }}>
      <section className="public-topbar">
        <div className="public-brand">
          <div className="public-brand-mark">CC</div>
          <div>
            <strong>CampusCore</strong>
            <span>Campus service management system</span>
          </div>
        </div>

        <div className="public-topbar-links">
          <a href="#features">Features</a>
          <a href="#flows">User Paths</a>
          <Link to="/student/login" className="btn btn-secondary">
            Login
          </Link>
        </div>
      </section>

      <section className="hero-section">
        <div className="floating-shape" style={{ width: '300px', height: '300px', background: 'var(--purple-main)', top: '-100px', left: '-100px' }} />
        <div className="floating-shape" style={{ width: '400px', height: '400px', background: '#3B82F6', bottom: '-150px', right: '-100px' }} />

        <div className="hero-tag">Unified Student, Technician, and Admin Experience</div>
        <h1 className="hero-title">
          A cleaner flow for <span>every campus role.</span>
        </h1>
        <p className="hero-subtitle">
          Students can create accounts and report issues, administrators manage the system from a control
          dashboard, and technicians sign in directly to their work queue.
        </p>

        <div className="public-hero-actions">
          <Link to="/student/login" className="btn-hero">
            Student Login
          </Link>
          <Link to="/admin/login" className="btn btn-secondary public-hero-secondary">
            Admin Login
          </Link>
          <Link to="/technician/login" className="btn btn-secondary public-hero-secondary">
            Technician Login
          </Link>
        </div>
      </section>

      <div id="features" className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h3>Student Self-Service</h3>
          <p>Students can create their own account, log in, view profile details, and submit service requests from one clear dashboard.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3>Admin Governance</h3>
          <p>Administrators use a protected login and land directly on the admin dashboard to manage roles, tickets, and system activity.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3>Technician Work Queue</h3>
          <p>Technicians sign in through their own access path and go straight into the technician dashboard for assignments and resolutions.</p>
        </div>
      </div>

      <div id="flows" className="glass-panel public-flow-panel">
        <div className="public-flow-copy">
          <h2>Standard website flow</h2>
          <p>
            Public landing page first, then role-based login paths, and finally direct dashboard routing based
            on the authenticated role.
          </p>
        </div>

        <div className="public-flow-grid">
          <div className="public-flow-card">
            <span className="public-flow-label">Student</span>
            <strong>/student/login</strong>
            <p>Students can create an account and then continue to `/student/dashboard`.</p>
          </div>
          <div className="public-flow-card">
            <span className="public-flow-label">Admin</span>
            <strong>/admin/login</strong>
            <p>Admins sign in only, with no self-registration, and land at `/admin/dashboard`.</p>
          </div>
          <div className="public-flow-card">
            <span className="public-flow-label">Technician</span>
            <strong>/technician/login</strong>
            <p>Technicians sign in through a dedicated access page and go directly to `/technician/dashboard`.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
