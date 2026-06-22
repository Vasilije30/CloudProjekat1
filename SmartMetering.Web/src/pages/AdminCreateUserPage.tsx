import { useState, FormEvent } from 'react';
import { createUser, CreateUserRequest } from '../api/admin';

export default function AdminCreateUserPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('Consumer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const data: CreateUserRequest = {
      email,
      firstName,
      lastName,
      phoneNumber,
      role,
    };

    try {
      const user = await createUser(data);
      setSuccess(`User created successfully: ${user.email}. A password setup email will be sent.`);
      // Reset form
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
      setRole('Consumer');
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Create User</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                className="form-control"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                className="form-control"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              className="form-control"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="+381641234567"
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
              <option value="Consumer">Consumer</option>
              <option value="Admin">Admin</option>
              <option value="BillingAdmin">BillingAdmin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}
