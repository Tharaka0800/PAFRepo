import React from 'react';

const HomePage = ({ onLaunchDashboard }) => {
    return (
        <div style={{ animation: 'fadeIn 0.8s ease' }}>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="floating-shape" style={{ width: '300px', height: '300px', background: 'var(--purple-main)', top: '-100px', left: '-100px' }}></div>
                <div className="floating-shape" style={{ width: '400px', height: '400px', background: '#3B82F6', bottom: '-150px', right: '-100px' }}></div>

                <div className="hero-tag">System Version 1.2 Now Live</div>
                <h1 className="hero-title">
                    The Modern Standard for <span>Campus Operations.</span>
                </h1>
                <p className="hero-subtitle">
                    Empower your institution with a unified platform for incident tracking, 
                    resource management, and real-time campus communications.
                </p>
                <button className="btn-hero" onClick={onLaunchDashboard}>
                    Launch Dashboard
                </button>
            </section>

            {/* Feature Grid */}
            <div className="feature-grid">
                <div className="feature-card">
                    <div className="feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                        </svg>
                    </div>
                    <h3>Smart Maintenance</h3>
                    <p>Report hardware, software, or facility issues instantly. Tracking and resolving campus incidents has never been this efficient.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <h3>Facility Resource Hub</h3>
                    <p>Real-time availability for lecture halls, laboratories, and specialized equipment. Conflict-free booking guaranteed.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <h3>Broadcast Alerts</h3>
                    <p>Targeted notifications for specific roles. Ensure high-priority updates reach the right audience across campus instantly.</p>
                </div>
            </div>

            {/* Extra Info Section */}
            <div className="glass-panel" style={{ marginTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px' }}>
                <div style={{ maxWidth: '500px' }}>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--purple-dark)', margin: '0 0 20px 0' }}>One Unified System.</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                        CampusCore is designed to eliminate silos. Whether you are a student reporting a broken projector 
                        or an administrator approving a lab booking, everything happens in one seamless flow.
                    </p>
                    <div style={{ display: 'flex', gap: '40px', marginTop: '32px' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--purple-main)' }}>100%</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Conflict Free</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--purple-main)' }}>24/7</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Live Support</div>
                        </div>
                    </div>
                </div>
                <div style={{ 
                    width: '350px', 
                    height: '250px', 
                    background: 'var(--purple-bg)', 
                    borderRadius: '24px', 
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--purple-main)',
                    fontSize: '3rem'
                }}>
                    🌐
                </div>
            </div>
        </div>
    );
};

export default HomePage;
