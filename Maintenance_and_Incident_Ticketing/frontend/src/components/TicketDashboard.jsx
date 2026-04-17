import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../config/api';
//create ticket modal is imported in parent component (App.jsx) and passed as prop to this component, so no need to import here
const TicketDashboard = ({ onCreateNew, onViewTicket }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

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

  const displayedTickets = tickets.filter(t => filter === 'ALL' || t.status === filter);

  const stats = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    progress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    critical: tickets.filter(t => t.priority === 'CRITICAL').length,
  };

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

  return (
    <div className="glass-panel" style={{ animation: 'fadeIn 0.5s' }}>
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
            className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(status)}
            style={{ padding: '6px 16px', fontSize: '0.8rem', borderRadius: '50px' }}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
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
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketDashboard;
