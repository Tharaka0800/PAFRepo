import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchWithAuth } from '../config/api';
import CommentSection from './CommentSection';

const TicketDetailsPage = ({ ticketId, onBack, user }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Status updates
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadTechnicians();
    }
  }, [user?.role]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`/tickets/${ticketId}`);
      setTicket(data);
      setNewStatus(data.status);
      setTechnicianId(data.assignedTechnicianId || '');
      setAssignmentNotes(data.assignmentNotes || '');
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

      const updatedData = await fetchWithAuth(`/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      setTicket(updatedData);
      
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      setLoadingTechnicians(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const technicianUsers = response.data.filter((candidate) => candidate.role === 'TECHNICIAN');
      setTechnicians(technicianUsers);
    } catch (err) {
      console.error('Failed to load technicians', err);
    } finally {
      setLoadingTechnicians(false);
    }
  };

  const handleAssignTechnician = async () => {
    if (!technicianId.trim()) {
      alert('Please enter a technician username.');
      return;
    }

    try {
      setAssigning(true);
      const updatedTicket = await fetchWithAuth(`/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technicianId: technicianId.trim(),
          assignmentNotes,
        }),
      });
      setTicket(updatedTicket);
      setNewStatus(updatedTicket.status);
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigning(false);
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

  if (loading) return <div style={{textAlign: 'center', padding: '40px'}}>Loading ticket details...</div>;
  if (error) return <div style={{color: 'red', textAlign: 'center'}}>{error}</div>;
  if (!ticket) return null;

  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  return (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        &larr; Back to Dashboard
      </button>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px' }}>
        {/* Main Details */}
        <div className="glass-panel">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px'}}>
            <div className="ticket-id-badge">
              #TKT-{ticket.id.substring(0, 5).toUpperCase()}
            </div>
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
              <div className="label">Assigned Technician</div>
              <div style={{ fontWeight: '500' }}>{ticket.assignedTechnicianId || 'Not assigned yet'}</div>
            </div>
            <div>
              <div className="label">Created Date</div>
              <div style={{ fontWeight: '500' }}>
                {formatDateTime(ticket.createdAt)}
              </div>
            </div>
          </div>
          
          <div style={{marginBottom: '24px'}}>
            <h3 style={{margin: '0 0 12px 0'}}>Description</h3>
            <div style={{background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '100px', whiteSpace: 'pre-wrap'}}>
              {ticket.description}
            </div>
          </div>

          {(ticket.assignmentNotes || ticket.resolutionNotes || ticket.rejectionReason) && (
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              {ticket.assignmentNotes && (
                <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>Admin Assignment Note</h3>
                  <div style={{ background: '#eef4ff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #c7d2fe', whiteSpace: 'pre-wrap' }}>
                    {ticket.assignmentNotes}
                  </div>
                </div>
              )}
              {ticket.resolutionNotes && (
                <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>Completion Notes</h3>
                  <div style={{ background: '#ecfdf5', padding: '14px 16px', borderRadius: '10px', border: '1px solid #a7f3d0', whiteSpace: 'pre-wrap' }}>
                    {ticket.resolutionNotes}
                  </div>
                </div>
              )}
              {ticket.rejectionReason && (
                <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>Rejection Reason</h3>
                  <div style={{ background: '#fff1f2', padding: '14px 16px', borderRadius: '10px', border: '1px solid #fecdd3', whiteSpace: 'pre-wrap' }}>
                    {ticket.rejectionReason}
                  </div>
                </div>
              )}
            </div>
          )}
          
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

          {(isAdmin || isTechnician) && (
            <div style={{background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '32px'}}>
              <h3 style={{margin: '0 0 16px 0'}}>Workflow Actions</h3>

              {isAdmin && (
                <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #dbe3ee' }}>
                  <h4 style={{ margin: '0 0 14px 0', color: 'var(--purple-dark)' }}>Assign Technician</h4>
                  <div className="form-group" style={{ maxWidth: '340px' }}>
                    <label className="label">Technician</label>
                    <select
                      className="input-field"
                      value={technicianId}
                      onChange={(e) => setTechnicianId(e.target.value)}
                      disabled={loadingTechnicians}
                    >
                      <option value="">
                        {loadingTechnicians ? 'Loading technicians...' : 'Select a technician'}
                      </option>
                      {technicians.map((technician) => (
                        <option key={technician.id} value={technician.username}>
                          {technician.username}{technician.email ? ` (${technician.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!loadingTechnicians && technicians.length === 0 && (
                    <div style={{ marginTop: '-6px', marginBottom: '14px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No technician accounts are available yet. Promote a user to technician first.
                    </div>
                  )}
                  <div className="form-group">
                    <label className="label">Short Admin Instruction</label>
                    <textarea
                      className="input-field"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      rows="3"
                      placeholder="Add a short note for the technician"
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleAssignTechnician} disabled={assigning}>
                    {assigning ? 'Assigning...' : 'Assign Technician'}
                  </button>
                </div>
              )}

              <div className="form-group" style={{maxWidth: '300px'}}>
                <label className="label">Change Status</label>
                <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  {isAdmin && <option value="CLOSED">Closed</option>}
                  {isAdmin && <option value="REJECTED">Rejected</option>}
                </select>
              </div>

              {newStatus === 'RESOLVED' && (
                <div className="form-group">
                  <label className="label">Completion Notes</label>
                  <textarea className="input-field" value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} rows="3"></textarea>
                </div>
              )}

              {isAdmin && newStatus === 'REJECTED' && (
                <div className="form-group">
                  <label className="label">Rejection Reason</label>
                  <textarea className="input-field" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows="3"></textarea>
                </div>
              )}

              <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={updating || newStatus === ticket.status}>
                {updating ? 'Updating...' : isTechnician && newStatus === 'RESOLVED' ? 'Mark as Done' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
        
        {/* Right Sidebar - Comments */}
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <CommentSection
            ticketId={ticketId}
            currentUserId={user?.username || 'anonymous_user'}
            currentUserName={user?.username || 'Anonymous User'}
          />
        </div>
      </div>
    </div>
  );
};
export default TicketDetailsPage;
