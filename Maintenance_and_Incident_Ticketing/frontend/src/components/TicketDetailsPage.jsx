import React, { useState, useEffect } from 'react';
import { fetchWithAuth, API_BASE_URL } from '../config/api';
import CommentSection from './CommentSection';

const TicketDetailsPage = ({ ticketId, onBack }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Status updates
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`/tickets/${ticketId}`);
      setTicket(data);
      setNewStatus(data.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      const payload = { 
        status: newStatus, 
        resolutionNotes, 
        rejectionReason 
      };
      
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'admin_default' // Admin doing update
        },
        body: JSON.stringify(payload)
      });
      
      if(!response.ok) throw new Error("Failed to update status");
      
      const updatedData = await response.json();
      setTicket(updatedData);
      
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
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

  if (loading) return <div style={{textAlign: 'center', padding: '40px'}}>Loading ticket details...</div>;
  if (error) return <div style={{color: 'red', textAlign: 'center'}}>{error}</div>;
  if (!ticket) return null;

  return (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        &larr; Back to Dashboard
      </button>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px' }}>
        {/* Main Details */}
        <div className="glass-panel">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px'}}>
            <h1 style={{margin: 0, color: 'var(--primary-color)'}}>Ticket #{ticket.id.slice(0, 8)}</h1>
            <span className={getStatusBadgeClass(ticket.status)}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '12px'}}>
            <div>
              <div className="label">Category</div>
              <div style={{fontWeight: '500'}}>{ticket.category}</div>
            </div>
            <div>
              <div className="label">Resource / Location</div>
              <div style={{fontWeight: '500'}}>{ticket.resourceLocation}</div>
            </div>
            <div>
              <div className="label">Priority</div>
              <div style={{color: ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold'}}>{ticket.priority}</div>
            </div>
            <div>
              <div className="label">Created Date</div>
              <div style={{fontWeight: '500'}}>{new Date(ticket.createdAt).toLocaleString()}</div>
            </div>
          </div>
          
          <div style={{marginBottom: '24px'}}>
            <h3 style={{margin: '0 0 12px 0'}}>Description</h3>
            <div style={{background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '100px', whiteSpace: 'pre-wrap'}}>
              {ticket.description}
            </div>
          </div>
          
          {ticket.attachmentUrls && ticket.attachmentUrls.length > 0 && (
            <div style={{marginBottom: '24px'}}>
              <h3 style={{margin: '0 0 12px 0'}}>Evidence Images</h3>
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                {ticket.attachmentUrls.map((url, i) => (
                  <img key={i} src={`http://localhost:8080/${url}`} style={{width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1'}} alt={`Evidence ${i}`} />
                ))}
              </div>
            </div>
          )}

          {/* Timeline Stepper */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--purple-dark)' }}>Ticket Progress</h3>
            <div className="timeline">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((stepStatus, idx) => {
                const allStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
                const currentIdx = ticket.status === 'REJECTED' ? 0 : allStatuses.indexOf(ticket.status);
                const isComplete = idx <= currentIdx && ticket.status !== 'REJECTED';
                const isActive = idx === currentIdx;
                
                return (
                  <div key={stepStatus} className={`timeline-step ${isComplete ? 'active' : ''}`}>
                    <div className="timeline-icon">{idx + 1}</div>
                    <div className="timeline-content">
                      <strong style={{ color: isComplete ? 'var(--purple-dark)' : 'var(--text-muted)' }}>{stepStatus.replace('_', ' ')}</strong>
                      {isActive && ticket.status !== 'REJECTED' && <div style={{fontSize: '0.8rem', color: 'var(--purple-main)'}}>Current stage</div>}
                    </div>
                  </div>
                );
              })}
              
              {ticket.status === 'REJECTED' && (
                <div className="timeline-step active">
                  <div className="timeline-icon" style={{borderColor: 'var(--danger-color)', color: 'white', background: 'var(--danger-color)'}}>X</div>
                  <div className="timeline-content">
                    <strong style={{color: 'var(--danger-color)'}}>REJECTED</strong>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Ticket was rejected</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Workflow Updates */}
          <div style={{background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '32px'}}>
            <h3 style={{margin: '0 0 16px 0'}}>Update Ticket Workflow</h3>
            
            <div className="form-group" style={{maxWidth: '300px'}}>
              <label className="label">Change Status</label>
              <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            
            {newStatus === 'RESOLVED' && (
              <div className="form-group">
                <label className="label">Resolution Notes (Optional)</label>
                <textarea className="input-field" value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} rows="3"></textarea>
              </div>
            )}
            
            {newStatus === 'REJECTED' && (
              <div className="form-group">
                <label className="label">Rejection Reason</label>
                <textarea className="input-field" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows="3"></textarea>
              </div>
            )}
            
            <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={updating || newStatus === ticket.status}>
              {updating ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        {/* Right Sidebar - Comments */}
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <CommentSection ticketId={ticketId} currentUserId="user_123" currentUserName="John Doe" />
        </div>
      </div>
    </div>
  );
};
export default TicketDetailsPage;
