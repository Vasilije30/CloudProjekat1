import { useState, useEffect } from 'react';
import { getUsers, suspendUser, UserResponse } from '../api/admin';

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    setActionLoading(userId);
    setError('');
    setSuccess('');

    try {
      await suspendUser(userId);
      setSuccess('User suspended successfully');
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to suspend user');
    } finally {
      setActionLoading('');
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  if (loading) return <div className="loading">Loading accounts...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>User Accounts</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="card">
        {users.length === 0 ? (
          <div className="empty-state"><p>No users found.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.phoneNumber}</td>
                    <td>
                      <span className="badge badge-info">{user.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAtUtc)}</td>
                    <td>
                      {user.isActive && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleSuspend(user.id)}
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? 'Suspending...' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
