import React from 'react';

const Navbar = ({ currentView, onNavigate, user, onLogout }) => {
    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'dashboard', label: 'Tickets' },
        { id: 'facilities', label: 'Facilities' },
        { id: 'bookings', label: 'Bookings' },
        { id: 'notifications', label: 'Alerts' }
    ];

    return (
        <nav className="top-navbar" style={{ padding: '0 24px' }}>
            <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onNavigate('home')}>
                    <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        background: 'var(--purple-main)', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                    }}>CC</div>
                    <h3 style={{ margin: 0, color: 'var(--purple-dark)', fontSize: '1.1rem', fontWeight: '800' }}>CampusCore</h3>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`nav-link-horizontal ${currentView === item.id ? 'active' : ''}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div className="search-container" style={{ width: '220px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--purple-main)' }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="search-input"
                    />
                </div>

                <div className="navbar-actions">
                    <div className="notif-bell">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <div className="notif-dot"></div>
                    </div>

                    <div className="navbar-user-profile" style={{ border: 'none', paddingLeft: 0 }}>
                        <div className="navbar-avatar">
                            {(user && user.username) ? user.username.charAt(0).toUpperCase() : ""}
                        </div>
                        <button 
                            onClick={onLogout}
                            className="btn btn-pill btn-secondary"
                            style={{ padding: '4px 12px', fontSize: '0.75rem', marginLeft: '8px' }}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
