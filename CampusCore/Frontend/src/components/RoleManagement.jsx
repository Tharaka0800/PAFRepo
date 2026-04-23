import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Loader2, Trash2 } from 'lucide-react';

const RoleManagement = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8080/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            setError('Failed to fetch users. Ensure you have admin privileges.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`http://localhost:8080/api/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert('User role updated successfully!');
        } catch (err) {
            alert('Failed to update role.');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        const confirmed = window.confirm(`Delete user "${username}"? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            await axios.delete(`http://localhost:8080/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== userId));
            alert('User deleted successfully.');
        } catch (err) {
            alert(err.response?.data || 'Failed to delete user.');
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) || 
        (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return (
        <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '16px' }}>
            <Loader2 className="animate-spin text-purple-600" size={32} />
            <p className="text-muted">Loading campus members...</p>
        </div>
    );

    return (
        <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 className="title-gradient" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Users size={28} /> Role Management
                    </h2>
                    <p className="text-muted" style={{ margin: '4px 0 0' }}>Manage access permissions for campus members</p>
                </div>
                
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="input-field"
                        style={{ paddingLeft: '40px' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ textAlign: 'left', padding: '16px' }}>Username</th>
                            <th style={{ textAlign: 'left', padding: '16px' }}>Email</th>
                            <th style={{ textAlign: 'left', padding: '16px' }}>Current Role</th>
                            <th style={{ textAlign: 'right', padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '16px', fontWeight: '500' }}>{user.username}</td>
                                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{user.email || 'N/A'}</td>
                                <td style={{ padding: '16px' }}>
                                    <span className={`badge ${
                                        user.role === 'ADMIN' ? 'badge-urgent' : 
                                        user.role === 'TECHNICIAN' ? 'badge-progress' : 'badge-pending'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <select 
                                            className="input-field" 
                                            style={{ width: 'auto', display: 'inline-block', fontSize: '0.85rem', padding: '6px 12px', minWidth: '150px' }}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="STUDENT">Student</option>
                                            <option value="TECHNICIAN">Technician</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                        <button
                                            type="button"
                                            className="btn btn-pill btn-danger"
                                            style={{ padding: '8px 12px' }}
                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        No users found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleManagement;
