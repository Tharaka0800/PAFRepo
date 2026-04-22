import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacilitiesCatalog = ({ token, role }) => {
    const [facilities, setFacilities] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', type: 'Lecture Hall', location: '', capacity: 10, isAvailable: true });

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchFacilities();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const url = `http://localhost:8080/api/facilities${search ? `?search=${search}` : ''}`;
            const res = await axios.get(url, config);
            setFacilities(res.data);
        } catch (err) {
            console.error('Failed to load facilities', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/facilities', formData, config);
            setShowModal(false);
            setFormData({ name: '', type: 'Lecture Hall', location: '', capacity: 10, isAvailable: true });
            fetchFacilities();
        } catch (err) {
            console.error('Failed to create facility', err);
            alert('Error creating facility');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this facility from the catalog?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/facilities/${id}`, config);
            fetchFacilities();
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    return (
        <div style={{ padding: "28px 32px", width: "100%", minHeight: "100vh", background: "#f0eef8" }}>
            <div className="header">
                <h1>Facilities Catalogue</h1>
                {(role === 'ADMIN' || role === 'TECHNICIAN') && (
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                        + Add Facility
                    </button>
                )}
            </div>

            <div style={{ marginBottom: '32px' }}>
                <div className="form-group" style={{ maxWidth: '400px', margin: 0 }}>
                   <label className="label">Search Resources</label>
                   <input 
                        type="text" placeholder="Search by name, type, or location..."
                        className="input-field"
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading resources...</div>
            ) : (
                <div className="dashboard-grid">
                    {facilities.map(fac => (
                        <div key={fac.id} className={`ticket-card`} style={{ borderLeftColor: fac.available ? 'var(--success-color)' : 'var(--danger-color)', padding: '20px' }}>
                            <div className="ticket-card-header">
                                <div>
                                    <h3 className="ticket-card-title">{fac.name}</h3>
                                    <div className="ticket-card-meta">{fac.type}</div>
                                </div>
                                <span className={`badge ${fac.available ? 'badge-resolved' : 'badge-rejected'}`}>
                                    {fac.available ? 'Available' : 'Maintenance'}
                                </span>
                            </div>
                            
                            <div style={{ margin: '16px 0', fontSize: '0.9rem', color: 'var(--text-dark)', flex: 1 }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                                    <span style={{ fontWeight: '500' }}>{fac.location}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Capacity:</span>
                                    <span style={{ fontWeight: '500' }}>{fac.capacity} Persons</span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--purple-light)', paddingTop: '12px', marginTop: 'auto' }}>
                                {role === 'ADMIN' && (
                                    <button onClick={() => handleDelete(fac.id)} className="btn btn-pill btn-danger">
                                        Delete
                                    </button>
                                )}
                                {role === 'STUDENT' && fac.available && (
                                    <button className="btn btn-pill btn-secondary">
                                        Request Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {facilities.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', gridColumn: '1/-1', background: 'white', borderRadius: '12px', border: 'var(--glass-border)' }}>
                            No facilities match your search criteria.
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Register New Campus Facility</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="label">Facility Name</label>
                                <input type="text" required className="input-field" placeholder="e.g. Main Auditorium, Chemistry Lab B" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="label">Resource Type</label>
                                    <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option>Lecture Hall</option>
                                        <option>Lab</option>
                                        <option>Research Center</option>
                                        <option>Equipment</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="label">Max Capacity</label>
                                    <input type="number" required min="1" className="input-field" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Location / Building</label>
                                <input type="text" required className="input-field" placeholder="e.g. Block C, Level 3" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Facility</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacilitiesCatalog;
