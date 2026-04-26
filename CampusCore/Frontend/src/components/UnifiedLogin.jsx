import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UnifiedLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      onLoginSuccess(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Register new student account
        await axios.post('http://localhost:8080/api/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: 'STUDENT',
        });
        setIsRegister(false);
        setFormData((prev) => ({ ...prev, password: '' }));
        setError('Account created successfully! Please sign in.');
      } else {
        // Login - works for all roles
        const response = await axios.post('http://localhost:8080/api/auth/login', {
          username: formData.username,
          password: formData.password,
        });
        
        // Backend now returns { token, role, username }
        onLoginSuccess(response.data.token, response.data.role);
      }
    } catch (err) {
      setError(err.response?.data || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-page-card glass-panel">
        <div className="auth-page-header">
          <div className="auth-logo-mark">CC</div>
          <div className="auth-badge">Campus Portal</div>
          <h1>{isRegister ? 'Create Student Account' : 'Welcome Back'}</h1>
          <p>
            {isRegister
              ? 'Students can create an account to access campus services'
              : 'Sign in with your credentials to continue'}
          </p>
        </div>

        {error && (
          <div className={`auth-error-box ${error.includes('successfully') ? 'success' : ''}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="label">Email address</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="student@sliit.lk"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="label">{isRegister ? 'Username' : 'Email or username'}</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(event) => setFormData({ ...formData, username: event.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px' }} 
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          {!isRegister && (
            <>
              <div className="auth-divider">
                <span>or</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn btn-secondary"
                style={{ width: '100%', gap: '12px', justifyContent: 'center' }}
              >
                Continue with Google
              </button>
            </>
          )}
        </form>

        <div className="auth-footer-text">
          {isRegister ? 'Already have an account?' : 'New student here?'}{' '}
          <button
            type="button"
            className="auth-inline-button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div className="auth-info-box" style={{ marginTop: '20px', fontSize: '0.85rem', color: '#666' }}>
          <strong>Note:</strong> Admin and Technician accounts are managed by administrators. 
          Students can create their own accounts.
        </div>

        <button type="button" className="auth-home-link" onClick={() => navigate('/')}>
          Back to home
        </button>
      </div>
    </div>
  );
};

export default UnifiedLogin;
