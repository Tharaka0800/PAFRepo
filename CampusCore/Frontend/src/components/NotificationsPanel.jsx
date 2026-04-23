import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const NotificationsPanel = ({ token, role }) => {
    const [notifications, setNotifications] = useState([]);
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('STUDENT');
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchNotifications();
        
        // Setup WebSocket connection
        const socket = new SockJS('http://localhost:8080/ws-notifications');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                client.subscribe(`/topic/notifications/${role}`, (message) => {
                    const newNotif = JSON.parse(message.body);
                    setNotifications(prev => [newNotif, ...prev]);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        });

        client.activate();

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [role]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:8080/api/notifications';
            if (role !== 'ADMIN') {
                url += `?role=${role}`;
            }
            const res = await axios.get(url, config);
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/notifications', { message, targetRole }, config);
            setMessage('');
            fetchNotifications();
        } catch (err) {
            console.error('Failed to create', err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/notifications/${id}/read`, {}, config);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/notifications/${id}`, config);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const getRoleBadgeClass = (notifRole) => {
        switch (notifRole) {
            case 'ADMIN': return 'badge badge-critical'; // Use critical for admin alerts
            case 'TECHNICIAN': return 'badge badge-inprogress';
            case 'STUDENT': return 'badge badge-open';
            default: return 'badge';
        }
    };

    return (
        <div style={{ padding: "28px 32px", width: "100%", minHeight: "100vh", background: "#f0eef8" }}>
            <div className="header">
                <h1>Campus Notifications</h1>
                {role === 'ADMIN' && (
                    <div className="badge badge-resolved">Admin Broadcast Active</div>
                )}
            </div>

            {role === 'ADMIN' && (
                <div style={{ background: 'var(--purple-bg)', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px dashed var(--purple-main)' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--purple-dark)' }}>Broadcast New System Alert</h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="label">Announcement Message</label>
                            <input 
                                type="text" required placeholder="Type the alert message here..."
                                className="input-field"
                                value={message} onChange={e => setMessage(e.target.value)}
                            />
                        </div>
                        <div style={{ width: '180px' }}>
                            <label className="label">Target Audience</label>
                            <select 
                                className="input-field"
                                value={targetRole} onChange={e => setTargetRole(e.target.value)}
                            >
                                <option value="STUDENT">Students</option>
                                <option value="TECHNICIAN">Technicians</option>
                                <option value="ADMIN">Administrators</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: '45px' }}>
                            Broadcast Alert
                        </button>
                    </form>
                </div>
            )}

            <div className="comment-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'white', borderRadius: '12px', border: 'var(--glass-border)' }}>
                        No notifications found.
                    </div>
                ) : notifications.map(notif => (
                    <div key={notif.id} className="comment-item" style={{ 
                        borderLeft: notif.isRead ? 'var(--glass-border)' : '4px solid var(--purple-main)',
                        opacity: notif.isRead ? 0.7 : 1,
                        transition: 'all 0.3s'
                    }}>
                        <div className="comment-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className={getRoleBadgeClass(notif.targetRole)}>{notif.targetRole}</span>
                                <span className="comment-date">{new Date(notif.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-2">
                                {!notif.isRead && (
                                    <button onClick={() => handleMarkAsRead(notif.id)} className="btn btn-pill btn-secondary">
                                        Mark as Read
                                    </button>
                                )}
                                {role === 'ADMIN' && (
                                    <button onClick={() => handleDelete(notif.id)} className="btn btn-pill btn-danger" style={{ padding: '4px 12px' }}>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                        <p style={{ margin: '12px 0 0 0', color: 'var(--text-dark)', fontSize: '1rem', lineHeight: '1.5' }}>
                            {notif.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationsPanel;
