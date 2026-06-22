import { useState, useEffect } from 'react';
import { getReadings, approveReading, rejectReading, ManualReadingResponse } from '../api/manualReadings';

export default function AdminManualReadingsPage() {
  const [readings, setReadings] = useState<ManualReadingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'Pending' | 'All'>('Pending');

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    try {
      const data = await getReadings();
      setReadings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load readings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    setError('');
    setSuccess('');
    try {
      await approveReading(id, notesMap[id]);
      setSuccess('Reading approved');
      loadReadings();
    } catch (err: any) {
      setError(err.message || 'Failed to approve reading');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    setError('');
    setSuccess('');
    try {
      await rejectReading(id, notesMap[id]);
      setSuccess('Reading rejected');
      loadReadings();
    } catch (err: any) {
      setError(err.message || 'Failed to reject reading');
    } finally {
      setActionLoading('');
    }
  };

  const updateNotes = (id: string, notes: string) => {
    setNotesMap(prev => ({ ...prev, [id]: notes }));
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  const filteredReadings = filter === 'Pending'
    ? readings.filter(r => r.status === 'Pending')
    : readings;

  const pendingCount = readings.filter(r => r.status === 'Pending').length;

  if (loading) return <div className="loading">Loading readings...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Manual Readings Review</h1>
        <div className="btn-group">
          <button
            className={`btn ${filter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('Pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('All')}
          >
            All ({readings.length})
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {filteredReadings.length === 0 ? (
        <div className="empty-state">
          <p>{filter === 'Pending' ? 'No pending readings to review.' : 'No readings found.'}</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Meter ID</th>
                  <th>Reading</th>
                  <th>Photo</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReadings.map(r => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.createdAtUtc)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.meterId.substring(0, 8)}...</td>
                    <td style={{ fontWeight: 600 }}>{r.reading.toFixed(2)} kWh</td>
                    <td>
                      {r.photoUrl ? (
                        <a href={r.photoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                          View Photo
                        </a>
                      ) : '--'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span>
                    </td>
                    <td>
                      {r.status === 'Pending' ? (
                        <input
                          className="form-control"
                          style={{ minWidth: 150, padding: '4px 8px', fontSize: 12 }}
                          placeholder="Add notes..."
                          value={notesMap[r.id] || ''}
                          onChange={e => updateNotes(r.id, e.target.value)}
                        />
                      ) : (
                        <span style={{ fontSize: 12 }}>{r.verificationNotes || '--'}</span>
                      )}
                    </td>
                    <td>
                      {r.status === 'Pending' && (
                        <div className="btn-group">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(r.id)}
                            disabled={actionLoading === r.id}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(r.id)}
                            disabled={actionLoading === r.id}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {r.status !== 'Pending' && r.verifiedAtUtc && (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {formatDate(r.verifiedAtUtc)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
