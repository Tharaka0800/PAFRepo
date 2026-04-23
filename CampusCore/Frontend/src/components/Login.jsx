import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({
  onLoginSuccess,
  allowRegister = false,
  defaultRole = 'STUDENT',
  title = 'Welcome Back',
  subtitle = 'Sign in to continue',
  roleHint = 'User',
}) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const alternateRoutes = useMemo(
    () => [
      { to: '/student/login', label: 'Student' },
      { to: '/admin/login', label: 'Admin' },
      { to: '/technician/login', label: 'Technician' },
    ],
    [],
  );

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
      if (isRegister && allowRegister) {
        await axios.post('http://localhost:8080/api/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: 'STUDENT',
        });
        setIsRegister(false);
        setFormData((prev) => ({ ...prev, password: '' }));
      } else {
        const response = await axios.post('http://localhost:8080/api/auth/login', {
          username: formData.username,
          password: formData.password,
        });
        onLoginSuccess(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data || 'Authentication failed. Check whether the backend is running.');
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
          <div className="auth-badge">{roleHint} Portal</div>
          <h1>{isRegister ? 'Create Student Account' : title}</h1>
          <p>
            {isRegister
              ? 'Students can create a profile here and access their service dashboard immediately after login.'
              : subtitle}
          </p>
        </div>

        {error && <div className="auth-error-box">{error}</div>}

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
              placeholder={defaultRole === 'ADMIN' ? 'admin@sliitcampuscore.com' : 'Enter your username'}
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          {defaultRole === 'STUDENT' && !isRegister && (
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

        {allowRegister && (
          <div className="auth-footer-text">
            {isRegister ? 'Already have a student account?' : 'New student here?'}{' '}
            <button
              type="button"
              className="auth-inline-button"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        )}

        <div className="auth-route-switcher">
          <span>Role login paths</span>
          <div className="auth-route-links">
            {alternateRoutes.map((route) => (
              <Link key={route.to} to={route.to} className="auth-route-link">
                {route.label}
              </Link>
            ))}
          </div>
        </div>

        <button type="button" className="auth-home-link" onClick={() => navigate('/')}>
          Back to home
        </button>
      </div>
    </div>
  );
};

export default Login;
