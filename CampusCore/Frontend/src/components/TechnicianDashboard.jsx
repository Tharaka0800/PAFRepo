import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../config/api';

const TechnicianDashboard = ({ user, onViewTicket }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For resolution input
  const [resolvingTicketId, setResolvingTicketId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

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

  const handleAssign = async (id) => {
    try {
      await fetchWithAuth(`/tickets/${id}/assign`, {
        method: 'PATCH', // Used PATCH per your request (Note: if backend uses @PUT, this might need to change to PUT)
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ technicianId: user.username })
      });
      loadTickets(); // Refresh tickets
    } catch (error) {
      console.error("Failed to assign ticket", error);
    }
  };

  const handleResolve = async (id) => {
    try {
      await fetchWithAuth(`/tickets/${id}/status`, {
        method: 'PATCH', // Following the convention you specified
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'RESOLVED', resolutionNotes })
      });
      setResolvingTicketId(null);
      setResolutionNotes('');
      loadTickets(); // Refresh tickets
    } catch (error) {
      console.error("Failed to resolve ticket", error);
    }
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

  // Filter based on user instructions
  const availableJobs = tickets.filter(t => t.status === 'OPEN');
  const activeTasks = tickets.filter(t => t.status === 'IN_PROGRESS');
  const completedHistory = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');

  // Shared Card component with color-coding logic embedded
  const TicketCard = ({ ticket, children }) => (
    <div className={`ticket-card ticket-priority-${ticket.priority?.toUpperCase()}`} style={{ marginBottom: '16px', padding: '16px' }}>
      <div className="ticket-card-header">
        <div>
          <div className="ticket-id-badge" style={{marginBottom: '8px', fontWeight: 'bold', color: 'var(--purple-main)'}}>
            #TKT-{ticket.id.substring(0, 5).toUpperCase()}
          </div>
          <h3 className="ticket-card-title" style={{ fontSize: '1rem', marginBottom: '4px' }}>{ticket.category}</h3>
          <div className="ticket-card-meta">{ticket.resourceLocation}</div>
        </div>
        <span className={getStatusBadgeClass(ticket.status)}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4' }}>
        {ticket.description && ticket.description.length > 60 ? ticket.description.substring(0, 60) + '...' : ticket.description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--purple-light)', paddingTop: '12px', marginBottom: '16px' }}>
          <span>Priority: <strong style={{color: ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'var(--danger-color)' : ticket.priority === 'MEDIUM' ? 'var(--warning-color)' : 'var(--success-color)'}}>{ticket.priority}</strong></span>
      </div>

      {children}
    </div>
  );

  return (
    <div className="glass-panel" style={{ animation: 'fadeIn 0.5s' }}>
      <div className="header" style={{ marginBottom: '32px' }}>
        <h1>Technician Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Column 1: Available Jobs */}
        <div style={{ background: 'var(--purple-bg)', padding: '20px', borderRadius: '12px', border: 'var(--glass-border)' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--purple-dark)', marginBottom: '20px', borderBottom: '2px solid var(--purple-light)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            Available Jobs <span className="badge badge-open">{availableJobs.length}</span>
          </h2>
          {loading ? <div>Loading...</div> : availableJobs.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No available jobs.</div> : availableJobs.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket}>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleAssign(ticket.id)}>
                Assign to Me
              </button>
            </TicketCard>
          ))}
        </div>

        {/* Column 2: My Active Tasks */}
        <div style={{ background: 'var(--purple-bg)', padding: '20px', borderRadius: '12px', border: 'var(--glass-border)' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--purple-dark)', marginBottom: '20px', borderBottom: '2px solid var(--purple-light)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            My Active Tasks <span className="badge badge-inprogress">{activeTasks.length}</span>
          </h2>
          {loading ? <div>Loading...</div> : activeTasks.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No active tasks.</div> : activeTasks.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket}>
              {resolvingTicketId === ticket.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <textarea 
                    className="input-field" 
                    placeholder="Resolution Notes..." 
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    style={{ minHeight: '60px', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleResolve(ticket.id)}>
                      Save & Resolve
                    </button>
                    <button className="btn btn-secondary" onClick={() => setResolvingTicketId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--success-color)', color: 'var(--success-color)' }} onClick={() => setResolvingTicketId(ticket.id)}>
                  Mark as Resolved
                </button>
              )}
            </TicketCard>
          ))}
        </div>

        {/* Column 3: Completed History */}
        <div style={{ background: 'var(--purple-bg)', padding: '20px', borderRadius: '12px', border: 'var(--glass-border)' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--purple-dark)', marginBottom: '20px', borderBottom: '2px solid var(--purple-light)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            Completed <span className="badge badge-resolved">{completedHistory.length}</span>
          </h2>
          {loading ? <div>Loading...</div> : completedHistory.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No completed history.</div> : completedHistory.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
