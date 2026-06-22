import { useState, useEffect, FormEvent } from 'react';
import {
  getTariffModels, createTariffModel, updateTariffModel, deleteTariffModel,
  TariffModelResponse, CreateTariffModelRequest
} from '../api/tariffModels';

export default function AdminTariffModelsPage() {
  const [models, setModels] = useState<TariffModelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<TariffModelResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [greenHighPrice, setGreenHighPrice] = useState('');
  const [greenLowPrice, setGreenLowPrice] = useState('');
  const [blueHighPrice, setBlueHighPrice] = useState('');
  const [blueLowPrice, setBlueLowPrice] = useState('');
  const [redHighPrice, setRedHighPrice] = useState('');
  const [redLowPrice, setRedLowPrice] = useState('');
  const [greenUpperLimit, setGreenUpperLimit] = useState('');
  const [blueUpperLimit, setBlueUpperLimit] = useState('');
  const [powerBillingRate, setPowerBillingRate] = useState('');
  const [supplierFee, setSupplierFee] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await getTariffModels();
      setModels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tariff models');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setGreenHighPrice('');
    setGreenLowPrice('');
    setBlueHighPrice('');
    setBlueLowPrice('');
    setRedHighPrice('');
    setRedLowPrice('');
    setGreenUpperLimit('');
    setBlueUpperLimit('');
    setPowerBillingRate('');
    setSupplierFee('');
    setEffectiveFrom('');
    setEffectiveTo('');
    setIsActive(true);
  };

  const openCreateForm = () => {
    setEditingModel(null);
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (model: TariffModelResponse) => {
    setEditingModel(model);
    setName(model.name);
    setGreenHighPrice(model.greenHighTariffPrice.toString());
    setGreenLowPrice(model.greenLowTariffPrice.toString());
    setBlueHighPrice(model.blueHighTariffPrice.toString());
    setBlueLowPrice(model.blueLowTariffPrice.toString());
    setRedHighPrice(model.redHighTariffPrice.toString());
    setRedLowPrice(model.redLowTariffPrice.toString());
    setGreenUpperLimit(model.greenZoneUpperLimit.toString());
    setBlueUpperLimit(model.blueZoneUpperLimit.toString());
    setPowerBillingRate(model.powerBillingRate.toString());
    setSupplierFee(model.supplierFee.toString());
    setEffectiveFrom(model.effectiveFrom);
    setEffectiveTo(model.effectiveTo || '');
    setIsActive(model.isActive);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    const data: CreateTariffModelRequest = {
      name,
      greenHighTariffPrice: parseFloat(greenHighPrice),
      greenLowTariffPrice: parseFloat(greenLowPrice),
      blueHighTariffPrice: parseFloat(blueHighPrice),
      blueLowTariffPrice: parseFloat(blueLowPrice),
      redHighTariffPrice: parseFloat(redHighPrice),
      redLowTariffPrice: parseFloat(redLowPrice),
      greenZoneUpperLimit: parseFloat(greenUpperLimit),
      blueZoneUpperLimit: parseFloat(blueUpperLimit),
      powerBillingRate: parseFloat(powerBillingRate),
      supplierFee: parseFloat(supplierFee),
      effectiveFrom,
      effectiveTo: effectiveTo || undefined,
      isActive,
    };

    try {
      if (editingModel) {
        await updateTariffModel(editingModel.id, data);
        setSuccess('Tariff model updated successfully');
      } else {
        await createTariffModel(data);
        setSuccess('Tariff model created successfully');
      }
      setShowForm(false);
      loadModels();
    } catch (err: any) {
      setError(err.message || 'Failed to save tariff model');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tariff model?')) return;
    try {
      await deleteTariffModel(id);
      setSuccess('Tariff model deleted');
      loadModels();
    } catch (err: any) {
      setError(err.message || 'Failed to delete tariff model');
    }
  };

  if (loading) return <div className="loading">Loading tariff models...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Tariff Models</h1>
        <button className="btn btn-primary" onClick={openCreateForm}>
          New Tariff Model
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <h3>{editingModel ? 'Edit Tariff Model' : 'New Tariff Model'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <h4 style={{ color: 'var(--success)', margin: '12px 0 8px', fontSize: 14 }}>Green Zone Prices</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>High Tariff Price</label>
                  <input type="number" step="0.01" className="form-control" value={greenHighPrice} onChange={e => setGreenHighPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Low Tariff Price</label>
                  <input type="number" step="0.01" className="form-control" value={greenLowPrice} onChange={e => setGreenLowPrice(e.target.value)} required />
                </div>
              </div>

              <h4 style={{ color: 'var(--accent)', margin: '12px 0 8px', fontSize: 14 }}>Blue Zone Prices</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>High Tariff Price</label>
                  <input type="number" step="0.01" className="form-control" value={blueHighPrice} onChange={e => setBlueHighPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Low Tariff Price</label>
                  <input type="number" step="0.01" className="form-control" value={blueLowPrice} onChange={e => setBlueLowPrice(e.target.value)} required />
                </div>
              </div>

              <h4 style={{ color: 'var(--danger)', margin: '12px 0 8px', fontSize: 14 }}>Red Zone Prices</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>High Tariff Price</label>
                  <input type="number" step="0.01" className="form-control" value={redHighPrice} onChange={e => setRedHighPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Low Tariff Price</label>
                  <input type="number" step="0.01" className="form-control" value={redLowPrice} onChange={e => setRedLowPrice(e.target.value)} required />
                </div>
              </div>

              <h4 style={{ color: 'var(--text-secondary)', margin: '12px 0 8px', fontSize: 14 }}>Zone Limits &amp; Fees</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Green Zone Upper Limit (kWh)</label>
                  <input type="number" step="0.01" className="form-control" value={greenUpperLimit} onChange={e => setGreenUpperLimit(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Blue Zone Upper Limit (kWh)</label>
                  <input type="number" step="0.01" className="form-control" value={blueUpperLimit} onChange={e => setBlueUpperLimit(e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Power Billing Rate</label>
                  <input type="number" step="0.01" className="form-control" value={powerBillingRate} onChange={e => setPowerBillingRate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Supplier Fee</label>
                  <input type="number" step="0.01" className="form-control" value={supplierFee} onChange={e => setSupplierFee(e.target.value)} required />
                </div>
              </div>

              <h4 style={{ color: 'var(--text-secondary)', margin: '12px 0 8px', fontSize: 14 }}>Effective Period</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Effective From</label>
                  <input type="date" className="form-control" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Effective To (optional)</label>
                  <input type="date" className="form-control" value={effectiveTo} onChange={e => setEffectiveTo(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Models Table */}
      {models.length === 0 ? (
        <div className="empty-state"><p>No tariff models found.</p></div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Green (H/L)</th>
                  <th>Blue (H/L)</th>
                  <th>Red (H/L)</th>
                  <th>Effective</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td>{m.greenHighTariffPrice}/{m.greenLowTariffPrice}</td>
                    <td>{m.blueHighTariffPrice}/{m.blueLowTariffPrice}</td>
                    <td>{m.redHighTariffPrice}/{m.redLowTariffPrice}</td>
                    <td>
                      {m.effectiveFrom}
                      {m.effectiveTo ? ` - ${m.effectiveTo}` : ' - ongoing'}
                    </td>
                    <td>
                      <span className={`badge ${m.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditForm(m)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
                      </div>
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
