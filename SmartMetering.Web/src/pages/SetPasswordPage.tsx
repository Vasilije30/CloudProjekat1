import { useState, FormEvent } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { setPassword } from '../api/auth';

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!token) {
      setError('Invalid or missing token. Please use the link from your email.');
      return;
    }

    setLoading(true);

    try {
      await setPassword(token, password, confirmPassword);
      setSuccess('Password set successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to set password. The token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Set Password</h1>
        <p>Enter your new password below.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPasswordValue(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>

        <Link to="/login" className="auth-link">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
