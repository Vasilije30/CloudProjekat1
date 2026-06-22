import { useState, useEffect } from 'react';
import { getAlerts, resolveAlert, AlertResponse } from '../api/alerts';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    setActionLoading(id);
    setError('');
    setSuccess('');

    try {
      await resolveAlert(id);
      setSuccess('Alert resolved');
      loadAlerts();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve alert');
    } finally {
      setActionLoading('');
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'badge-danger';
      case 'Warning': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'LowVoltage': return 'Low Voltage';
      case 'DeviceOffline': return 'Device Offline';
      case 'ConsumptionLimitExceeded': return 'Consumption Limit Exceeded';
      default: return type;
    }
  };

  const filteredAlerts = showResolved
    ? alerts
    : alerts.filter(a => !a.resolvedAtUtc);

  const unresolvedCount = alerts.filter(a => !a.resolvedAtUtc).length;

  if (loading) return <div className="loading">Loading alerts...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Alerts</h1>
        <div className="btn-group">
          <button
            className={`btn ${!showResolved ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowResolved(false)}
          >
            Active ({unresolvedCount})
          </button>
          <button
            className={`btn ${showResolved ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowResolved(true)}
          >
            All ({alerts.length})
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {filteredAlerts.length === 0 ? (
        <div className="empty-state">
          <p>{showResolved ? 'No alerts found.' : 'No active alerts. All clear!'}</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Occurred</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(alert => (
                  <tr key={alert.id}>
                    <td>
                      <span className={`badge ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{getAlertTypeLabel(alert.alertType)}</td>
                    <td style={{ maxWidth: 300 }}>{alert.description}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(alert.occurredAtUtc)}</td>
                    <td>
                      {alert.resolvedAtUtc ? (
                        <span className="badge badge-success">Resolved</span>
                      ) : (
                        <span className="badge badge-danger">Active</span>
                      )}
                    </td>
                    <td>
                      {!alert.resolvedAtUtc && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleResolve(alert.id)}
                          disabled={actionLoading === alert.id}
                        >
                          {actionLoading === alert.id ? 'Resolving...' : 'Resolve'}
                        </button>
                      )}
                      {alert.resolvedAtUtc && (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {formatDate(alert.resolvedAtUtc)}
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
