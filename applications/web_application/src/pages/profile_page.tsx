import { useState } from 'react';
import { useAuth } from '../shared/auth_context';
import apiClient from '../shared/api_client';
import FeedbackCard from '../shared/feedback_card';
import { getApiErrorMessage } from '../shared/api_error_message';

export default function ProfilePage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setFeedback('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setFeedback('New password must be at least 8 characters.');
      return;
    }
    try {
      await apiClient.patch('/user-authentication/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setFeedback('Password updated successfully.');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'Password could not be changed.'));
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="topbar">
        <h2 className="topbar-title">Profile</h2>
      </div>
      <div className="page-content">
        <FeedbackCard message={feedback} onDismiss={() => setFeedback('')} />

        <div className="card mb-6">
          <h3 className="card-title mb-4">Account Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={user.full_name} readOnly disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user.email} readOnly disabled />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" value={user.role.replace(/_/g, ' ')} readOnly disabled style={{ textTransform: 'capitalize' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={passwordForm.current_password}
                  onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" minLength={8} value={passwordForm.new_password}
                  onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" minLength={8} value={passwordForm.confirm_password}
                  onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} required />
              </div>
            </div>
            <button className="button button-primary" type="submit">Update Password</button>
          </form>
        </div>
      </div>
    </>
  );
}
