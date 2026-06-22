import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { getCurrentUser } from '../api/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);

      // Fetch current user to get email
      try {
        const user = await getCurrentUser();
        localStorage.setItem('email', user.email);
      } catch {
        localStorage.setItem('email', email);
      }

      // Redirect based on role
      if (response.role === 'Consumer') {
        navigate('/dashboard');
      } else if (response.role === 'Admin') {
        navigate('/admin/accounts');
      } else if (response.role === 'BillingAdmin') {
        navigate('/admin/tariff-models');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>SmartMetering</h1>
        <p>Sign in to your account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <Link to="/forgot-password" className="auth-link">
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}
