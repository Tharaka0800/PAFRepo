import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingWorkflow = ({ token, username, role }) => {
    const [bookings, setBookings] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ facilityId: '', startTime: '', endTime: '' });
    const [error, setError] = useState('');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchBookings(), fetchFacilities()]);
        setLoading(false);
    };

    const fetchBookings = async () => {
        try {
            const url = role === 'STUDENT' 
                ? `http://localhost:8080/api/bookings?username=${username}`
                : 'http://localhost:8080/api/bookings';
            const res = await axios.get(url, config);
            setBookings(res.data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        }
    };

    const fetchFacilities = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/facilities', config);
            setFacilities(res.data);
            if (res.data.length > 0) setFormData(prev => ({ ...prev, facilityId: res.data[0].id }));
        } catch (err) {
            console.error('Failed to load facilities', err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('http://localhost:8080/api/bookings', { ...formData, username }, config);
            setShowModal(false);
            fetchBookings();
        } catch (err) {
            setError(err.response?.data || 'Failed to create booking due to conflict or error.');
        }
    };

    const handleAction = async (id, action) => {
        try {
            await axios.put(`http://localhost:8080/api/bookings/${id}/${action}`, {}, config);
            fetchBookings();
        } catch (err) {
            alert(err.response?.data || 'Error performing action');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return 'badge badge-resolved';
            case 'REJECTED': return 'badge badge-rejected';
            case 'PENDING': return 'badge badge-inprogress';
            default: return 'badge';
        }
    };

    return (
        <div style={{ padding: "28px 32px", width: "100%", minHeight: "100vh", background: "#f0eef8" }}>
            <div className="header">
                <h1>Facility Bookings</h1>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    + Request Booking
                </button>
            </div>

            <div className="stats-container">
                <div className="stat-card stat-border-progress">
                    <div className="stat-card-title">Pending</div>
                    <div className="stat-card-value">{bookings.filter(b => b.status === 'PENDING').length}</div>
                </div>
                <div className="stat-card stat-border-resolved">
                    <div className="stat-card-title">Approved</div>
                    <div className="stat-card-value">{bookings.filter(b => b.status === 'APPROVED').length}</div>
                </div>
                <div className="stat-card stat-border-critical">
                    <div className="stat-card-title">Rejected</div>
                    <div className="stat-card-value">{bookings.filter(b => b.status === 'REJECTED').length}</div>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid var(--purple-main)' }}>
                    <div className="stat-card-title">Total Requests</div>
                    <div className="stat-card-value">{bookings.length}</div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: 'var(--glass-border)', overflow: 'hidden' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--purple-bg)', color: 'var(--purple-dark)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
                            <th style={{ padding: '16px' }}>Facility</th>
                            <th style={{ padding: '16px' }}>Requester</th>
                            <th style={{ padding: '16px' }}>Schedule Period</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            {role === 'ADMIN' && <th style={{ padding: '16px', textAlign: 'center' }}>Admin Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</td></tr>
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No booking requests found.</td></tr>
                        ) : bookings.map(b => {
                            const fac = facilities.find(f => f.id === b.facilityId);
                            return (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--purple-light)', fontSize: '0.9rem' }}>
                                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--purple-dark)' }}>{fac ? fac.name : 'Unknown Facility'}</td>
                                    <td style={{ padding: '16px' }}>{b.username}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                                        <div style={{ fontWeight: '500', color: 'var(--text-dark)' }}>{new Date(b.startTime).toLocaleDateString()}</div>
                                        {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={getStatusBadge(b.status)}>{b.status}</span>
                                    </td>
                                    {role === 'ADMIN' && (
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            {b.status === 'PENDING' ? (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button onClick={() => handleAction(b.id, 'approve')} className="btn btn-pill btn-primary" style={{ padding: '4px 12px' }}>Approve</button>
                                                    <button onClick={() => handleAction(b.id, 'reject')} className="btn btn-pill btn-danger" style={{ padding: '4px 12px' }}>Reject</button>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Processed</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Request New Booking</h2>
                        {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>{error}</div>}
                        
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="label">Select Facility</label>
                                <select required className="input-field" value={formData.facilityId} onChange={e => setFormData({...formData, facilityId: e.target.value})}>
                                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name} ({f.type})</option>)}
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="label">Start Date & Time</label>
                                    <input type="datetime-local" required className="input-field" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="label">End Date & Time</label>
                                    <input type="datetime-local" required className="input-field" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingWorkflow;
