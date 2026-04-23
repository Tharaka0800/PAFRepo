import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Filter,
  FolderKanban,
  Search,
  ShieldCheck,
  SquareActivity,
  Users2,
  XCircle,
} from 'lucide-react';
import { fetchWithAuth } from '../config/api';
import RoleManagement from './RoleManagement';

const AdminDashboard = ({ user, onViewTicket }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
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
      console.error('Failed to load tickets', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setRejectingTicketId(null);
    setRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingTicketId) return;

    try {
      await fetchWithAuth(`/tickets/${rejectingTicketId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: rejectionReason,
          rejectionReason,
          status: 'REJECTED',
        }),
      });
      closeModal();
      loadTickets();
    } catch (error) {
      console.error('Failed to reject ticket with /reject endpoint, trying fallback.', error);
      try {
        await fetchWithAuth(`/tickets/${rejectingTicketId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'REJECTED', rejectionReason }),
        });
        closeModal();
        loadTickets();
      } catch (fallbackError) {
        console.error('Fallback rejection failed', fallbackError);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'badge badge-open';
      case 'IN_PROGRESS':
        return 'badge badge-inprogress';
      case 'RESOLVED':
        return 'badge badge-resolved';
      case 'CLOSED':
        return 'badge badge-closed';
      case 'REJECTED':
        return 'badge badge-rejected';
      default:
        return 'badge';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'admin-priority admin-priority-critical';
      case 'HIGH':
        return 'admin-priority admin-priority-high';
      case 'MEDIUM':
        return 'admin-priority admin-priority-medium';
      default:
        return 'admin-priority admin-priority-low';
    }
  };

  const formatTicketCode = (id) => `TKT-${id.substring(0, 6).toUpperCase()}`;

  const formatDate = (value) => {
    if (!value) return 'No timestamp';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No timestamp';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const totalTickets = tickets.length;
  const openIncidents = tickets.filter((ticket) => ticket.status === 'OPEN').length;
  const inProgressCount = tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length;
  const rejectedCount = tickets.filter((ticket) => ticket.status === 'REJECTED').length;
  const pendingAssignments = tickets.filter((ticket) => ticket.status === 'OPEN' && !ticket.assignedTechnicianId).length;
  const criticalCount = tickets.filter((ticket) => ticket.priority === 'CRITICAL').length;

  const filteredTickets = tickets.filter((ticket) => {
    const reporter = `${ticket.userUsername || ''} ${ticket.userId || ''}`.toLowerCase();
    const category = (ticket.category || '').toLowerCase();
    const description = (ticket.description || '').toLowerCase();
    const code = formatTicketCode(ticket.id).toLowerCase();
    const searchMatch =
      !searchTerm ||
      reporter.includes(searchTerm.toLowerCase()) ||
      category.includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase()) ||
      code.includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'ALL' || ticket.status === statusFilter;
    const priorityMatch = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
    return searchMatch && statusMatch && priorityMatch;
  });

  const urgentTickets = tickets
    .filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS')
    .sort((a, b) => {
      const priorityRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99);
    })
    .slice(0, 4);

  const categoryCounts = tickets.reduce((acc, ticket) => {
    const key = ticket.category || 'Uncategorized';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const resolutionRate = totalTickets ? Math.round((resolvedCount / totalTickets) * 100) : 0;
  const assignmentRate = openIncidents ? Math.round(((openIncidents - pendingAssignments) / openIncidents) * 100) : 0;

  return (
    <div className="admin-workspace">
      <section className="admin-hero">
        <div className="admin-hero-copy">
          <div className="admin-eyebrow">
            <ShieldCheck size={16} />
            Administrative control center
          </div>
          <h1>Admin dashboard</h1>
          <p>
            Monitor ticket operations, manage workforce permissions, and keep high-priority campus
            issues moving without delay.
          </p>
        </div>

        <div className="admin-hero-panels">
          <div className="admin-hero-card">
            <span className="admin-hero-label">Signed in as</span>
            <strong>{user.username}</strong>
            <span className="admin-hero-meta">Role: {user.role}</span>
          </div>
          <div className="admin-hero-card">
            <span className="admin-hero-label">Live workload</span>
            <strong>{openIncidents} active incidents</strong>
            <span className="admin-hero-meta">{pendingAssignments} still need assignment</span>
          </div>
        </div>
      </section>

      <section className="admin-metric-grid">
        <article className="admin-metric-card">
          <div className="admin-metric-icon">
            <FolderKanban size={18} />
          </div>
          <span className="admin-metric-label">Total tickets</span>
          <strong>{totalTickets}</strong>
          <p>All requests currently tracked by the service desk.</p>
        </article>

        <article className="admin-metric-card">
          <div className="admin-metric-icon admin-metric-icon-warning">
            <AlertTriangle size={18} />
          </div>
          <span className="admin-metric-label">Open incidents</span>
          <strong>{openIncidents}</strong>
          <p>{criticalCount} critical items need elevated attention.</p>
        </article>

        <article className="admin-metric-card">
          <div className="admin-metric-icon admin-metric-icon-neutral">
            <Clock3 size={18} />
          </div>
          <span className="admin-metric-label">Pending assignment</span>
          <strong>{pendingAssignments}</strong>
          <p>{assignmentRate}% of open work already has an owner.</p>
        </article>

        <article className="admin-metric-card">
          <div className="admin-metric-icon admin-metric-icon-success">
            <CheckCircle2 size={18} />
          </div>
          <span className="admin-metric-label">Resolution rate</span>
          <strong>{resolutionRate}%</strong>
          <p>{resolvedCount} tickets resolved or closed successfully.</p>
        </article>
      </section>

      <section className="admin-tabbar">
        <button
          className={`admin-tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <SquareActivity size={16} />
          Operations queue
        </button>
        <button
          className={`admin-tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <Users2 size={16} />
          Role management
        </button>
      </section>

      {activeTab === 'tickets' ? (
        <div className="admin-shell">
          <section className="admin-main-panel glass-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Ticket review queue</h2>
                <p>Filter, review, and moderate operational incidents from one place.</p>
              </div>
              <div className="admin-chip">
                <Filter size={14} />
                {filteredTickets.length} visible
              </div>
            </div>

            <div className="admin-filter-row">
              <div className="admin-searchbox">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search ticket ID, reporter, category, or issue"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <select
                className="input-field admin-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                className="input-field admin-select"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="ALL">All priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="admin-table-wrap">
              {loading ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon">
                    <Clock3 size={18} />
                  </div>
                  Loading ticket operations...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon">
                    <Search size={18} />
                  </div>
                  No tickets match the current filters.
                </div>
              ) : (
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Reporter</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          <div className="admin-ticket-cell">
                            <strong>{formatTicketCode(ticket.id)}</strong>
                            <span>{ticket.description || 'No description provided'}</span>
                          </div>
                        </td>
                        <td>{ticket.userUsername || ticket.userId || 'Student'}</td>
                        <td>{ticket.category || 'General'}</td>
                        <td>
                          <span className={getPriorityClass(ticket.priority)}>{ticket.priority || 'LOW'}</span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(ticket.status)}>
                            {(ticket.status || 'UNKNOWN').replace('_', ' ')}
                          </span>
                        </td>
                        <td>{formatDate(ticket.createdAt)}</td>
                        <td>
                          <div className="admin-action-row">
                            <button className="btn btn-pill btn-primary" onClick={() => onViewTicket(ticket.id)}>
                              Review
                            </button>
                            {ticket.status !== 'REJECTED' &&
                              ticket.status !== 'CLOSED' &&
                              ticket.status !== 'RESOLVED' && (
                                <button
                                  className="btn btn-pill admin-reject-btn"
                                  onClick={() => setRejectingTicketId(ticket.id)}
                                >
                                  Reject
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <aside className="admin-sidebar">
            <section className="glass-panel admin-side-card">
              <div className="admin-side-header">
                <h3>Attention required</h3>
                <ArrowUpRight size={16} />
              </div>
              {urgentTickets.length === 0 ? (
                <p className="admin-side-empty">No urgent tickets are waiting right now.</p>
              ) : (
                urgentTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    className="admin-urgent-item"
                    onClick={() => onViewTicket(ticket.id)}
                  >
                    <div>
                      <strong>{formatTicketCode(ticket.id)}</strong>
                      <span>{ticket.category || 'General'}</span>
                    </div>
                    <span className={getPriorityClass(ticket.priority)}>{ticket.priority}</span>
                  </button>
                ))
              )}
            </section>

            <section className="glass-panel admin-side-card">
              <div className="admin-side-header">
                <h3>Operational snapshot</h3>
                <SquareActivity size={16} />
              </div>

              <div className="admin-mini-stat">
                <span>In progress</span>
                <strong>{inProgressCount}</strong>
              </div>
              <div className="admin-mini-stat">
                <span>Rejected</span>
                <strong>{rejectedCount}</strong>
              </div>

              <div className="admin-progress-group">
                <div className="admin-progress-label">
                  <span>Resolution coverage</span>
                  <span>{resolutionRate}%</span>
                </div>
                <div className="admin-progress-track">
                  <div className="admin-progress-fill" style={{ width: `${resolutionRate}%` }} />
                </div>
              </div>

              <div className="admin-progress-group">
                <div className="admin-progress-label">
                  <span>Assignment coverage</span>
                  <span>{assignmentRate}%</span>
                </div>
                <div className="admin-progress-track">
                  <div className="admin-progress-fill admin-progress-fill-gold" style={{ width: `${assignmentRate}%` }} />
                </div>
              </div>
            </section>

            <section className="glass-panel admin-side-card">
              <div className="admin-side-header">
                <h3>Top categories</h3>
                <FolderKanban size={16} />
              </div>
              {topCategories.length === 0 ? (
                <p className="admin-side-empty">Ticket categories will appear here once requests arrive.</p>
              ) : (
                topCategories.map(([category, count]) => (
                  <div key={category} className="admin-category-row">
                    <div className="admin-category-label">
                      <span>{category}</span>
                      <span>{count}</span>
                    </div>
                    <div className="admin-progress-track">
                      <div
                        className="admin-progress-fill"
                        style={{ width: `${Math.max((count / totalTickets) * 100, 10)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </section>
          </aside>
        </div>
      ) : (
        <RoleManagement token={localStorage.getItem('token')} />
      )}

      {rejectingTicketId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="admin-modal-heading">
              <div className="admin-modal-icon">
                <XCircle size={18} />
              </div>
              <div>
                <h2>Reject ticket</h2>
                <p>Record a clear reason so the team understands why this request was declined.</p>
              </div>
            </div>

            <div className="form-group">
              <label className="label">
                Rejection reason <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <textarea
                className="input-field"
                placeholder="Example: duplicate submission, insufficient detail, or outside service scope"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                style={{ minHeight: '110px', resize: 'vertical' }}
              />
            </div>

            <div className="admin-modal-actions">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmReject} disabled={!rejectionReason.trim()}>
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
