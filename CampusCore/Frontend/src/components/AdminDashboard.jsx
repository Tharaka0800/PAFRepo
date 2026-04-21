import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../config/api';

const AdminDashboard = ({ user, onViewTicket }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Rejection Modal State
  const [rejectingTicketId, setRejectingTicketId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

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

  const handleConfirmReject = async () => {
    if (!rejectingTicketId) return;
    try {
      // Trying the user requested exact endpoint
      await fetchWithAuth(`/tickets/${rejectingTicketId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason, rejectionReason: rejectionReason, status: 'REJECTED' })
      });
      closeModal();
      loadTickets();
    } catch (error) {
      console.error("Failed to reject ticket with /reject endpoint, trying fallback.", error);
      // Fallback if the backend uses the generic status update endpoint as seen previously
      try {
        await fetchWithAuth(`/tickets/${rejectingTicketId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'REJECTED', rejectionReason: rejectionReason })
        });
        closeModal();
        loadTickets();
      } catch (fallbackError) {
          console.error("Fallback rejection failed", fallbackError);
      }
    }
  };

  const closeModal = () => {
    setRejectingTicketId(null);
    setRejectionReason('');
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

  // Stats calculation
  const totalTickets = tickets.length;
  const openIncidents = tickets.filter(t => t.status === 'OPEN').length;
  const pendingAssignments = tickets.filter(t => t.status === 'OPEN' && !t.technicianId).length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="glass-panel" style={{ animation: 'fadeIn 0.5s', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* Dynamic CSS for the table hover effect within component to ensure UX independence */}
      <style>{`
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--glass-shadow);
        }
        .admin-table th {
          text-align: left;
          padding: 16px;
          background-color: var(--purple-bg);
          color: var(--purple-dark);
          font-weight: 600;
          font-size: 0.9rem;
          border-bottom: 2px solid var(--purple-light);
        }
        .admin-table td {
          padding: 16px;
          border-bottom: 1px solid var(--purple-light);
          font-size: 0.9rem;
          color: var(--text-dark);
        }
        .admin-table tbody tr {
          transition: background-color 0.2s ease, transform 0.1s ease;
        }
        .admin-table tbody tr:hover {
          background-color: var(--purple-bg);
        }
        .table-container {
          overflow-x: auto;
          margin-top: 24px;
        }
        .stat-icon {
          font-size: 24px;
          margin-bottom: 8px;
          color: var(--purple-main);
        }
      `}</style>

      <div className="header" style={{ marginBottom: '24px' }}>
        <h1>Admin Moderation Dashboard</h1>
      </div>

      {/* Top Row: Statistics */}
      <div className="stats-container">
        <div className="stat-card" style={{ borderTop: '4px solid var(--purple-main)' }}>
          <div className="stat-icon">📊</div>
          <div className="stat-card-title">Total Tickets</div>
          <div className="stat-card-value">{totalTickets}</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid var(--danger-color)' }}>
          <div className="stat-icon">🔥</div>
          <div className="stat-card-title">Open Incidents</div>
          <div className="stat-card-value">{openIncidents}</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid var(--warning-color)' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-card-title">Pending Assignments</div>
          <div className="stat-card-value">{pendingAssignments}</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid var(--success-color)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-card-title">Resolved Successfully</div>
          <div className="stat-card-value">{resolvedCount}</div>
        </div>
      </div>

      {/* Main Section: The Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading Data...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reporter</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--purple-main)' }}>
                      #TKT-{ticket.id.substring(0, 5).toUpperCase()}
                    </td>
                    <td>{ticket.userUsername || ticket.userId || 'Student'}</td>
                    <td>{ticket.category}</td>
                    <td>
                      <strong style={{
                        color: ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH' 
                          ? 'var(--danger-color)' 
                          : ticket.priority === 'MEDIUM' 
                            ? 'var(--warning-color)' 
                            : 'var(--success-color)'
                      }}>
                        {ticket.priority}
                      </strong>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-pill btn-primary" onClick={() => onViewTicket(ticket.id)}>
                          View
                        </button>
                        {ticket.status !== 'REJECTED' && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                          <button className="btn btn-pill" style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none' }} onClick={() => setRejectingTicketId(ticket.id)}>
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No tickets available in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingTicketId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, color: 'var(--danger-color)' }}>Reject Ticket</h2>
            <p style={{ color: 'var(--text-muted)' }}>Please provide a reason for rejecting this ticket.</p>
            
            <div className="form-group">
              <label className="label">Rejection Reason <span style={{ color: 'var(--danger-color)' }}>*</span></label>
              <textarea 
                className="input-field" 
                placeholder="E.g., Duplicate ticket, out of scope..." 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
