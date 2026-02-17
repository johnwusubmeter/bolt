import { useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/SetupPage.css';

export default function SetupPage() {
  const [email, setEmail] = useState('admin@premiumnameventures.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Add user to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{
          id: authData.user.id,
          email,
        }]);

      if (adminError) throw adminError;

      setSuccess(true);
      setMessage('Admin user created successfully! You can now log in at /admin');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="setup-page">
        <div className="setup-container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Success!</h2>
            <p>{message}</p>
            <p className="redirect-text">Redirecting to admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-page">
      <div className="setup-container">
        <h1>Create Admin Account</h1>
        <p className="setup-description">
          Set up your first admin account to manage domains
        </p>

        <form onSubmit={handleSubmit} className="setup-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@premiumnameventures.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin Account'}
          </button>

          <p className="setup-note">
            After creating this account, you'll be able to log in at <strong>/admin</strong> to manage domains.
          </p>
        </form>
      </div>
    </div>
  );
}
