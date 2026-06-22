import { useState, useEffect } from 'react';
import { getMeterOverview, MeterOverviewResponse } from '../api/admin';

export default function AdminMeterReviewPage() {
  const [meters, setMeters] = useState<MeterOverviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadMeters();
  }, []);

  const loadMeters = async () => {
    try {
      const data = await getMeterOverview();
      setMeters(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load meters');
    } finally {
      setLoading(false);
    }
  };

  const filteredMeters = filterStatus
    ? meters.filter(m => m.status === filterStatus)
    : meters;

  const statusCounts = meters.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusDotClass = (status: string) => {
    switch (status) {
      case 'Active': return 'active';
      case 'Inactive': return 'inactive';
      case 'Registered': return 'registered';
      default: return 'unregistered';
    }
  };

  if (loading) return <div className="loading">Loading meters...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Meter Review</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Status Summary Cards */}
      <div className="status-cards">
        <div className="status-card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('')}>
          <div className="label">Total</div>
          <div className="value">{meters.length}</div>
        </div>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="status-card"
            style={{ cursor: 'pointer', border: filterStatus === status ? '1px solid var(--accent)' : undefined }}
            onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
          >
            <div className="label">{status}</div>
            <div className={`value ${status === 'Active' ? 'success' : status === 'Inactive' ? 'danger' : ''}`}>
              {count}
            </div>
          </div>
        ))}
      </div>

      {/* Meters Table */}
      <div className="card">
        {filteredMeters.length === 0 ? (
          <div className="empty-state"><p>No meters found.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Label</th>
                  <th>Serial Number</th>
                  <th>Connection</th>
                  <th>Power (kW)</th>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Owner</th>
                  <th>Device ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeters.map(meter => (
                  <tr key={meter.id}>
                    <td>
                      <span className={`status-dot ${getStatusDotClass(meter.status)}`} />
                      {meter.status}
                    </td>
                    <td style={{ fontWeight: 500 }}>{meter.label}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{meter.serialNumber}</td>
                    <td>{meter.connectionType}</td>
                    <td>{meter.approvedPowerKw}</td>
                    <td>{meter.propertyName}</td>
                    <td>{meter.propertyCity}, {meter.propertyAddress}</td>
                    <td>
                      <div>{meter.ownerName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{meter.ownerEmail}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                      {meter.deviceId ? meter.deviceId.substring(0, 12) + '...' : '--'}
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
