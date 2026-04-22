import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'STUDENT' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Capture token from URL if redirected from OAuth2
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            onLoginSuccess(token);
            // Clear URL params to keep it clean
            window.history.replaceState({}, document.title, "/login");
        }
    }, [onLoginSuccess]);

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

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--purple-light)' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--purple-light)' }}></div>
                    </div>

                    <button 
                        type="button" 
                        onClick={handleGoogleLogin}
                        className="btn btn-secondary" 
                        style={{ width: '100%', gap: '12px', justifyContent: 'center' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
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
