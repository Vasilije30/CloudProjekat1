import { useState, useEffect, FormEvent } from 'react';
import { createReading, getReadings, ManualReadingResponse } from '../api/manualReadings';
import { getProperties, getPropertyDetail, PropertyResponse, PropertyDetailResponse } from '../api/properties';

export default function ManualReadingsPage() {
  const [readings, setReadings] = useState<ManualReadingResponse[]>([]);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedMeterId, setSelectedMeterId] = useState('');
  const [readingValue, setReadingValue] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [readingsData, propsData] = await Promise.all([
        getReadings(),
        getProperties(),
      ]);
      setReadings(readingsData);
      setProperties(propsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load meters when property changes
  useEffect(() => {
    if (!selectedPropertyId) {
      setPropertyDetails(null);
      setSelectedMeterId('');
      return;
    }
    getPropertyDetail(selectedPropertyId).then(setPropertyDetails).catch(console.error);
  }, [selectedPropertyId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMeterId || !photoFile) {
      setError('Please select a meter and upload a photo.');
      return;
    }

    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      await createReading(selectedMeterId, parseFloat(readingValue), photoFile);
      setSuccess('Manual reading submitted successfully');
      setReadingValue('');
      setPhotoFile(null);
      setSelectedMeterId('');
      // Reset file input
      const fileInput = document.getElementById('photo-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      // Reload readings
      const updated = await getReadings();
      setReadings(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to submit reading');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Manual Readings</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Submit Reading Form */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Submit New Reading</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Property</label>
              <select
                className="form-control"
                value={selectedPropertyId}
                onChange={e => setSelectedPropertyId(e.target.value)}
                required
              >
                <option value="">Select property...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Meter</label>
              <select
                className="form-control"
                value={selectedMeterId}
                onChange={e => setSelectedMeterId(e.target.value)}
                required
                disabled={!propertyDetails}
              >
                <option value="">Select meter...</option>
                {propertyDetails?.meters.map(m => (
                  <option key={m.id} value={m.id}>{m.label} ({m.serialNumber})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Reading Value (kWh)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={readingValue}
                onChange={e => setReadingValue(e.target.value)}
                placeholder="e.g., 1234.56"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Photo of Meter Display</label>
            <input
              id="photo-input"
              type="file"
              className="form-control"
              accept="image/*"
              onChange={e => setPhotoFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={formLoading}>
            {formLoading ? 'Submitting...' : 'Submit Reading'}
          </button>
        </form>
      </div>

      {/* Readings List */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>My Readings</h3>
        {readings.length === 0 ? (
          <div className="empty-state"><p>No manual readings yet.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Meter ID</th>
                  <th>Reading</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {readings.map(r => (
                  <tr key={r.id}>
                    <td>{formatDate(r.createdAtUtc)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.meterId.substring(0, 8)}...</td>
                    <td style={{ fontWeight: 600 }}>{r.reading.toFixed(2)} kWh</td>
                    <td>
                      <span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span>
                    </td>
                    <td>{r.verifiedAtUtc ? formatDate(r.verifiedAtUtc) : '--'}</td>
                    <td>{r.verificationNotes || '--'}</td>
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
