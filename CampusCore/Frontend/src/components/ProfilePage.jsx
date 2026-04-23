import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePage = ({ token, user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const headers = {
    Authorization: `Bearer ${token}`,
    'X-User-Id': user?.username || 'anonymous_user',
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/users/me', { headers });
      setProfile(response.data);
      setEmail(response.data.email || '');
    } catch (err) {
      setError(err.response?.data || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    try {
      setProfileSaving(true);
      setError('');
      setMessage('');
      const response = await axios.put(
        '/api/users/me',
        { email },
        { headers: { ...headers, 'Content-Type': 'application/json' } },
      );
      setProfile(response.data);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      setPasswordSaving(true);
      setError('');
      setMessage('');
      await axios.put(
        '/api/users/me/password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: { ...headers, 'Content-Type': 'application/json' } },
      );
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password updated successfully.');
    } catch (err) {
      setError(err.response?.data || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setPhotoSaving(true);
      setError('');
      setMessage('');
      const formData = new FormData();
      formData.append('photo', file);
      const response = await axios.post('/api/users/me/photo', formData, { headers });
      setProfile(response.data);
      setMessage('Profile photo updated successfully.');
    } catch (err) {
      setError(err.response?.data || 'Failed to upload profile photo.');
    } finally {
      setPhotoSaving(false);
      event.target.value = '';
    }
  };

  const photoSrc = profile?.photoUrl ? `http://localhost:8080/${profile.photoUrl}` : null;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</div>;
  }

  return (
    <div className="profile-page-shell">
      <div className="profile-page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account email, password, and profile photo.</p>
        </div>
      </div>

      {(message || error) && (
        <div className={error ? 'profile-alert profile-alert-error' : 'profile-alert profile-alert-success'}>
          {error || message}
        </div>
      )}

      <div className="profile-grid">
        <section className="glass-panel profile-card">
          <h2>Profile Overview</h2>
          <div className="profile-identity">
            <div className="profile-avatar-wrap">
              {photoSrc ? (
                <img src={photoSrc} alt="Profile" className="profile-avatar-image" />
              ) : (
                <div className="profile-avatar-fallback">
                  {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <strong className="profile-name">{profile?.username}</strong>
              <div className="profile-role">{profile?.role}</div>
            </div>
          </div>

          <div className="profile-detail-list">
            <div className="profile-detail-item">
              <span>Username</span>
              <strong>{profile?.username}</strong>
            </div>
            <div className="profile-detail-item">
              <span>Email</span>
              <strong>{profile?.email || 'Not set'}</strong>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="label">Profile Photo</label>
            <input type="file" accept="image/*" className="input-field" onChange={handlePhotoUpload} disabled={photoSaving} />
            <div className="profile-helper-text">
              {photoSaving ? 'Uploading photo...' : 'Upload a clear image for your account avatar.'}
            </div>
          </div>
        </section>

        <section className="profile-form-column">
          <form className="glass-panel profile-card" onSubmit={handleProfileSave}>
            <h2>Contact Details</h2>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={profileSaving}>
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <form className="glass-panel profile-card" onSubmit={handlePasswordSave}>
            <h2>Change Password</h2>
            <div className="form-group">
              <label className="label">Current Password</label>
              <input
                type="password"
                className="input-field"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label">New Password</label>
              <input
                type="password"
                className="input-field"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className="input-field"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={passwordSaving}>
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
