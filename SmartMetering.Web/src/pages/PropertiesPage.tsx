import { useState, useEffect, FormEvent } from 'react';
import {
  getProperties, getPropertyDetail, createProperty, updateProperty, deleteProperty,
  PropertyResponse, PropertyDetailResponse, CreatePropertyRequest
} from '../api/properties';
import { createMeter, deleteMeter, CreateMeterRequest } from '../api/meters';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Property form state
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyResponse | null>(null);
  const [propName, setPropName] = useState('');
  const [propCity, setPropCity] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propDescription, setPropDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Meter form state
  const [showMeterForm, setShowMeterForm] = useState(false);
  const [meterLabel, setMeterLabel] = useState('');
  const [meterSerial, setMeterSerial] = useState('');
  const [meterConnectionType, setMeterConnectionType] = useState('SinglePhase');
  const [meterNotes, setMeterNotes] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyDetail = async (id: string) => {
    try {
      const detail = await getPropertyDetail(id);
      setSelectedProperty(detail);
    } catch (err: any) {
      setError(err.message || 'Failed to load property details');
    }
  };

  const openCreateForm = () => {
    setEditingProperty(null);
    setPropName('');
    setPropCity('');
    setPropAddress('');
    setPropDescription('');
    setShowPropertyForm(true);
  };

  const openEditForm = (prop: PropertyResponse) => {
    setEditingProperty(prop);
    setPropName(prop.name);
    setPropCity(prop.city);
    setPropAddress(prop.address);
    setPropDescription(prop.description || '');
    setShowPropertyForm(true);
  };

  const handlePropertySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    const data: CreatePropertyRequest = {
      name: propName,
      city: propCity,
      address: propAddress,
      description: propDescription || undefined,
    };

    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, data);
        setSuccess('Property updated successfully');
      } else {
        await createProperty(data);
        setSuccess('Property created successfully');
      }
      setShowPropertyForm(false);
      loadProperties();
      if (selectedProperty && editingProperty) {
        loadPropertyDetail(editingProperty.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save property');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    setError('');
    try {
      await deleteProperty(id);
      setSuccess('Property deleted');
      setProperties(prev => prev.filter(p => p.id !== id));
      if (selectedProperty?.id === id) setSelectedProperty(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete property');
    }
  };

  const handleMeterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setFormLoading(true);
    setError('');

    const data: CreateMeterRequest = {
      propertyId: selectedProperty.id,
      label: meterLabel,
      serialNumber: meterSerial,
      connectionType: meterConnectionType,
      notes: meterNotes || undefined,
    };

    try {
      await createMeter(data);
      setSuccess('Meter added successfully');
      setShowMeterForm(false);
      setMeterLabel('');
      setMeterSerial('');
      setMeterNotes('');
      loadPropertyDetail(selectedProperty.id);
    } catch (err: any) {
      setError(err.message || 'Failed to add meter');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMeter = async (meterId: string) => {
    if (!confirm('Are you sure you want to delete this meter?')) return;
    try {
      await deleteMeter(meterId);
      setSuccess('Meter deleted');
      if (selectedProperty) loadPropertyDetail(selectedProperty.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete meter');
    }
  };

  if (loading) return <div className="loading">Loading properties...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Properties</h1>
        <button className="btn btn-primary" onClick={openCreateForm}>
          Add Property
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Property Form Modal */}
      {showPropertyForm && (
        <div className="modal-overlay" onClick={() => setShowPropertyForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingProperty ? 'Edit Property' : 'New Property'}</h3>
            <form onSubmit={handlePropertySubmit}>
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={propName} onChange={e => setPropName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>City</label>
                <input className="form-control" value={propCity} onChange={e => setPropCity(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="form-control" value={propAddress} onChange={e => setPropAddress(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={propDescription} onChange={e => setPropDescription(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPropertyForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meter Form Modal */}
      {showMeterForm && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowMeterForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Meter to {selectedProperty.name}</h3>
            <form onSubmit={handleMeterSubmit}>
              <div className="form-group">
                <label>Label</label>
                <input className="form-control" value={meterLabel} onChange={e => setMeterLabel(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Serial Number</label>
                <input className="form-control" value={meterSerial} onChange={e => setMeterSerial(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Connection Type</label>
                <select className="form-control" value={meterConnectionType} onChange={e => setMeterConnectionType(e.target.value)}>
                  <option value="SinglePhase">Single Phase</option>
                  <option value="ThreePhase">Three Phase</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-control" value={meterNotes} onChange={e => setMeterNotes(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMeterForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Adding...' : 'Add Meter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Properties List */}
        <div style={{ flex: '1' }}>
          {properties.length === 0 ? (
            <div className="empty-state"><p>No properties yet. Click "Add Property" to get started.</p></div>
          ) : (
            <div className="card-grid">
              {properties.map(prop => (
                <div
                  key={prop.id}
                  className="card"
                  style={{ cursor: 'pointer', border: selectedProperty?.id === prop.id ? '1px solid var(--accent)' : undefined }}
                  onClick={() => loadPropertyDetail(prop.id)}
                >
                  <h3 style={{ marginBottom: 8 }}>{prop.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>{prop.city}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>{prop.address}</p>
                  {prop.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>{prop.description}</p>
                  )}
                  <div className="btn-group">
                    <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); openEditForm(prop); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDeleteProperty(prop.id); }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Property Detail */}
        {selectedProperty && (
          <div style={{ width: '400px' }}>
            <div className="card">
              <div className="card-header">
                <h3>Meters</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowMeterForm(true)}>
                  Add Meter
                </button>
              </div>
              {selectedProperty.meters.length === 0 ? (
                <div className="empty-state"><p>No meters for this property.</p></div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Label</th>
                        <th>Serial</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProperty.meters.map(meter => (
                        <tr key={meter.id}>
                          <td>{meter.label}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{meter.serialNumber}</td>
                          <td>
                            <span className={`status-dot ${meter.status.toLowerCase()}`} />
                            {meter.status}
                          </td>
                          <td>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMeter(meter.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
