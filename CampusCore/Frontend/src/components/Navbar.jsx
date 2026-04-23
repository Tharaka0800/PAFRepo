import React from 'react';

const Navbar = ({ currentView, onNavigate, user, onLogout }) => {
  const dashboardLabel = user?.role === 'ADMIN'
    ? 'Admin Dashboard'
    : user?.role === 'TECHNICIAN'
      ? 'Technician Dashboard'
      : 'Student Dashboard';

  const navItems = [
    { id: 'dashboard', label: dashboardLabel },
    { id: 'facilities', label: 'Facilities' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'notifications', label: 'Alerts' },
  ];

  return (
    <nav className="top-navbar" style={{ padding: '0 24px' }}>
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => onNavigate('dashboard')}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'var(--purple-main)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.9rem',
            }}
          >
            CC
          </div>
          <h3 style={{ margin: 0, color: 'var(--purple-dark)', fontSize: '1.1rem', fontWeight: '800' }}>CampusCore</h3>
        </div>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {navItems.map((item) => (
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
        <div className="navbar-user-profile" style={{ border: 'none', paddingLeft: 0 }}>
          <div className="navbar-avatar">
            {user?.username ? user.username.charAt(0).toUpperCase() : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--purple-dark)' }}>{user?.username}</strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="btn btn-pill btn-secondary"
            style={{ padding: '4px 12px', fontSize: '0.75rem', marginLeft: '12px' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
