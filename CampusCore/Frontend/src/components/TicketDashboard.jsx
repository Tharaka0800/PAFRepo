import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../config/api';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'OPEN': return 'badge badge-open';
    case 'IN_PROGRESS': return 'badge badge-inprogress';
    case 'RESOLVED': return 'badge badge-resolved';
    case 'CLOSED': return 'badge badge-closed';
    case 'REJECTED': return 'badge badge-rejected';
    default: return 'badge';
  }
};

const formatDateTime = (dateVal) => {
  if (!dateVal || dateVal === 0) return 'Waiting for timestamp...';
  try {
    const d = Array.isArray(dateVal) 
      ? new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0)
      : new Date(dateVal);
    return isNaN(d.getTime()) ? 'Waiting for timestamp...' : d.toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
    });
  } catch (e) {
    return 'Waiting for timestamp...';
  }
};

const TicketDashboard = ({ user, activeView = 'ALL', onCreateNew, onViewTicket }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Left Sidebar State
  const [activeNav, setActiveNav] = useState('All Tickets');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/tickets');
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const displayedTickets = tickets.filter(t => {
    const matchesSearch = 
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeNav === 'My Tickets' || activeView === 'MY_TASKS') {
      return t.userId === user?.username && matchesSearch;
    }
    
    if (activeNav === 'Completed') {
      return (t.status === 'RESOLVED' || t.status === 'CLOSED') && matchesSearch;
    }
    
    const matchesStatus = filter === 'ALL' || t.status === filter;
    return matchesStatus && matchesSearch;
  });

  const stats = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    progress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    critical: tickets.filter(t => t.priority === 'CRITICAL').length,
  };
  
  // Right Panel Derived Data
  const categories = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});
  
  const highPriorityTickets = tickets.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').slice(0, 3);
  
  const recentActivity = tickets.slice(0, 3).map(t => ({
    id: t.id,
    action: `Ticket created: ${t.category}`,
    time: formatDateTime(t.createdAt)
  }));



  const navItems = ['My Tickets', 'All Tickets', 'Completed', 'Schedule', 'Account'];

  return (
    <div className="ticket-dashboard-3col">
      {/* Left Sidebar */}
      <div className="ticket-sidebar-left">
        <div style={{
          padding: "20px 16px 10px",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#9ca3af",
          letterSpacing: "1px",
          textTransform: "uppercase"
        }}>
          Menu
        </div>
        
        <div className="ticket-nav-menu">
          {navItems.map(item => (
            <div 
              key={item}
              className={`ticket-nav-item ${activeNav === item ? 'active' : ''}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </div>
          ))}
        </div>
        
        {user && (
          <div className="ticket-user-chip">
            <div className="ticket-user-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="ticket-user-info">
              <span className="ticket-user-name">{user.username}</span>
              <span className="ticket-user-role">{user.role || 'Student'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="ticket-main-content">
        <div className="glass-panel" style={{ animation: 'fadeIn 0.5s', flex: 1 }}>
          <div className="header">
            <h1>Incident Tickets</h1>
            <button className="btn btn-primary" onClick={onCreateNew}>
              + New Ticket
            </button>
          </div>

          <div className="stats-container">
            <div className="stat-card stat-border-open">
              <div className="stat-card-title">Open</div>
              <div className="stat-card-value">{stats.open}</div>
            </div>
            <div className="stat-card stat-border-progress">
              <div className="stat-card-title">In Progress</div>
              <div className="stat-card-value">{stats.progress}</div>
            </div>
            <div className="stat-card stat-border-resolved">
              <div className="stat-card-title">Resolved</div>
              <div className="stat-card-value">{stats.resolved}</div>
            </div>
            <div className="stat-card stat-border-critical">
              <div className="stat-card-title">Critical</div>
              <div className="stat-card-value">{stats.critical}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((status) => (
              <button 
                key={status}
                className={`btn btn-pill ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(status)}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by category, description, or ID..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : displayedTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No tickets found.
            </div>
          ) : (
            <div className="dashboard-grid">
              {displayedTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className={`ticket-card ticket-priority-${ticket.priority?.toUpperCase()}`}
                  onClick={() => onViewTicket(ticket.id)}
                >
                  <div className="ticket-card-header">
                    <div>
                      <div className="ticket-id-badge" style={{marginBottom: '8px'}}>
                        #TKT-{ticket.id.substring(0, 5).toUpperCase()}
                      </div>
                      <h3 className="ticket-card-title">{ticket.category}</h3>
                      <div className="ticket-card-meta">{ticket.resourceLocation}</div>
                    </div>
                    <span className={getStatusBadgeClass(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', flex: 1, marginBottom: '16px' }}>
                    {ticket.description.length > 80 
                      ? ticket.description.substring(0, 80) + '...' 
                      : ticket.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--purple-light)', paddingTop: '12px' }}>
                    <span>Priority: <strong style={{color: ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'var(--danger-color)' : 'inherit'}}>{ticket.priority}</strong></span>
                    <span>
                      <div style={{ fontWeight: '500' }}>
                        {formatDateTime(ticket.createdAt)}
                      </div>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Right Sidebar Panel */}
      <div className="ticket-sidebar-right">
        <div className="ticket-panel-card">
          <div className="ticket-panel-title">Tickets by category</div>
          {Object.entries(categories).slice(0, 5).map(([cat, count]) => {
            const max = Math.max(...Object.values(categories));
            const percentage = max > 0 ? (count / max) * 100 : 0;
            return (
              <div key={cat} className="category-bar-row">
                <div className="category-bar-label">
                  <span>{cat}</span>
                  <span>{count}</span>
                </div>
                <div className="category-bar-track">
                  <div className="category-bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
          {Object.keys(categories).length === 0 && (
             <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No data available</div>
          )}
        </div>
        
        <div className="ticket-panel-card">
          <div className="ticket-panel-title">High priority tickets</div>
          {highPriorityTickets.map(t => (
            <div key={t.id} className="hp-ticket" onClick={() => onViewTicket(t.id)} style={{cursor: 'pointer'}}>
              <div className="hp-ticket-header">
                <span className="hp-ticket-id">#TKT-{t.id.substring(0, 5).toUpperCase()}</span>
                <span className="hp-ticket-priority">{t.priority}</span>
              </div>
              <div className="hp-ticket-desc">{t.category} - {t.resourceLocation}</div>
            </div>
          ))}
          {highPriorityTickets.length === 0 && (
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No high priority tickets</div>
          )}
        </div>

        <div className="ticket-panel-card">
          <div className="ticket-panel-title">Recent activity</div>
          {recentActivity.map((act, i) => (
            <div key={i} className="activity-item">
              <div className="activity-icon">i</div>
              <div className="activity-content">
                <div>{act.action}</div>
                <div className="activity-time">{act.time}</div>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDashboard;
