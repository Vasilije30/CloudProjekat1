import { useState, useEffect, FormEvent } from 'react';
import { getInvoiceSummary, generateInvoices, AdminInvoiceSummaryResponse, GenerateInvoicesResponse } from '../api/admin';

export default function AdminInvoicesPage() {
  const [summary, setSummary] = useState<AdminInvoiceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generateResult, setGenerateResult] = useState<GenerateInvoicesResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Generate form
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await getInvoiceSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice summary');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');
    setGenerateResult(null);

    try {
      const result = await generateInvoices({ month, year });
      setGenerateResult(result);
      setSuccess(result.message);
      loadSummary();
    } catch (err: any) {
      setError(err.message || 'Failed to generate invoices');
    } finally {
      setFormLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} RSD`;

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Invoice Management</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Summary Cards */}
      {summary && (
        <div className="status-cards">
          <div className="status-card">
            <div className="label">Total Invoices</div>
            <div className="value">{summary.totalInvoices}</div>
          </div>
          <div className="status-card">
            <div className="label">Paid</div>
            <div className="value success">{summary.paidCount}</div>
          </div>
          <div className="status-card">
            <div className="label">Unpaid</div>
            <div className="value danger">{summary.unpaidCount}</div>
          </div>
          <div className="status-card">
            <div className="label">Total Billed</div>
            <div className="value">{formatCurrency(summary.totalBilled)}</div>
          </div>
          <div className="status-card">
            <div className="label">Total Collected</div>
            <div className="value accent">{formatCurrency(summary.totalCollected)}</div>
          </div>
        </div>
      )}

      {/* Generate Invoices Form */}
      <div className="card" style={{ maxWidth: 500 }}>
        <h3 style={{ marginBottom: 16 }}>Generate Invoices</h3>
        <form onSubmit={handleGenerate}>
          <div className="form-row">
            <div className="form-group">
              <label>Month</label>
              <select className="form-control" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                className="form-control"
                value={year}
                onChange={e => setYear(parseInt(e.target.value))}
                min={2020}
                max={2030}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={formLoading}>
            {formLoading ? 'Generating...' : 'Generate Invoices'}
          </button>
        </form>

        {/* Generation Result */}
        {generateResult && (
          <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <div className="detail-row">
              <span className="detail-label">Generated</span>
              <span className="detail-value" style={{ color: 'var(--success)' }}>{generateResult.generatedCount}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Skipped</span>
              <span className="detail-value" style={{ color: 'var(--warning)' }}>{generateResult.skippedCount}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Failed</span>
              <span className="detail-value" style={{ color: 'var(--danger)' }}>{generateResult.failedCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
