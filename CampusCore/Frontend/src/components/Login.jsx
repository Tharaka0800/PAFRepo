import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'STUDENT' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await axios.post('http://localhost:8080/api/auth/register', formData);
                alert('Registration successful! Please log in.');
                setIsRegister(false);
            } else {
                const res = await axios.post('http://localhost:8080/api/auth/login', {
                    username: formData.username,
                    password: formData.password
                });
                const token = res.data.token;
                localStorage.setItem('token', token);
                onLoginSuccess(token);
            }
        } catch (err) {
            setError(err.response?.data || 'An error occurred. Check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                   <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        background: 'var(--purple-main)', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.5rem',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                    }}>SC</div>
                    <h2 style={{ margin: 0, color: 'var(--purple-dark)', fontSize: '1.75rem' }}>
                        {isRegister ? 'Join Smart Campus' : 'Welcome Back'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                        {isRegister ? 'Create your operational account' : 'Sign in to manage your campus tasks'}
                    </p>
                </div>

                {error && (
                    <div style={{ 
                        padding: '12px', 
                        fontSize: '0.85rem', 
                        color: '#991b1b', 
                        background: '#fee2e2', 
                        borderRadius: '8px', 
                        marginBottom: '20px',
                        border: '1px solid #fecaca'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Username</label>
                        <input type="text" required
                            className="input-field"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Password</label>
                        <input type="password" required
                            className="input-field"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    {isRegister && (
                        <div className="form-group">
                            <label className="label">Your Role</label>
                            <select
                                className="input-field"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="STUDENT">Student</option>
                                <option value="TECHNICIAN">Technician</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>
                    )}
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                        {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {isRegister ? 'Already have an account?' : "New to the platform?"}{' '}
                        <button 
                            type="button" 
                            style={{ background: 'none', border: 'none', color: 'var(--purple-main)', fontWeight: '600', cursor: 'pointer', padding: 0 }} 
                            onClick={() => setIsRegister(!isRegister)}
                        >
                            {isRegister ? 'Log In' : 'Create an Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
