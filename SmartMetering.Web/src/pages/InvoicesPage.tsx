import { useState, useEffect } from 'react';
import {
  getInvoices, getInvoiceDetail, downloadDocument, createCheckout,
  InvoiceResponse, InvoiceDetailResponse, InvoiceListResponse
} from '../api/invoices';

export default function InvoicesPage() {
  const [invoiceList, setInvoiceList] = useState<InvoiceListResponse | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetailResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [page]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices(page, 10);
      setInvoiceList(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const detail = await getInvoiceDetail(id);
      setSelectedInvoice(detail);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice details');
    }
  };

  const handleDownload = async (id: string) => {
    setActionLoading(id);
    try {
      const blob = await downloadDocument(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download document');
    } finally {
      setActionLoading('');
    }
  };

  const handlePay = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    try {
      const result = await createCheckout(invoiceId);
      window.location.href = result.checkoutUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment session');
      setActionLoading('');
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} RSD`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading && !invoiceList) return <div className="loading">Loading invoices...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Invoices</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h3>Invoice Detail</h3>
            <div className="detail-panel" style={{ border: 'none', padding: 0 }}>
              <div className="detail-row">
                <span className="detail-label">Property</span>
                <span className="detail-value">{selectedInvoice.propertyName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address</span>
                <span className="detail-value">{selectedInvoice.propertyAddress}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Meter</span>
                <span className="detail-value">{selectedInvoice.meterLabel} ({selectedInvoice.meterSerialNumber})</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Period</span>
                <span className="detail-value">{selectedInvoice.month}/{selectedInvoice.year}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">High Tariff</span>
                <span className="detail-value">{selectedInvoice.highTariffKwh.toFixed(2)} kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Low Tariff</span>
                <span className="detail-value">{selectedInvoice.lowTariffKwh.toFixed(2)} kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Consumption</span>
                <span className="detail-value">{selectedInvoice.totalKwh.toFixed(2)} kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Green Zone</span>
                <span className="detail-value">{selectedInvoice.greenZoneKwh.toFixed(2)} kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Blue Zone</span>
                <span className="detail-value">{selectedInvoice.blueZoneKwh.toFixed(2)} kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Red Zone</span>
                <span className="detail-value">{selectedInvoice.redZoneKwh.toFixed(2)} kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Energy Charge</span>
                <span className="detail-value">{formatCurrency(selectedInvoice.energyCharge)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Power Charge</span>
                <span className="detail-value">{formatCurrency(selectedInvoice.powerCharge)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Supplier Charge</span>
                <span className="detail-value">{formatCurrency(selectedInvoice.supplierCharge)}</span>
              </div>
              <div className="detail-row" style={{ borderBottom: 'none' }}>
                <span className="detail-label" style={{ fontSize: 15, fontWeight: 600 }}>Total Amount</span>
                <span className="detail-value" style={{ fontSize: 18, color: 'var(--accent)' }}>{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      {invoiceList && invoiceList.items.length > 0 ? (
        <>
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Total kWh</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceList.items.map(inv => (
                    <tr key={inv.id}>
                      <td>{inv.month}/{inv.year}</td>
                      <td>{inv.totalKwh.toFixed(2)}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(inv.totalAmount)}</td>
                      <td>
                        <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>{formatDate(inv.createdAtUtc)}</td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetail(inv.id)}>
                            Detail
                          </button>
                          {inv.hasDocument && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDownload(inv.id)}
                              disabled={actionLoading === inv.id}
                            >
                              Download
                            </button>
                          )}
                          {inv.status !== 'Paid' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handlePay(inv.id)}
                              disabled={actionLoading === inv.id}
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {invoiceList.totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </button>
              <span>Page {page} of {invoiceList.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(invoiceList.totalPages, p + 1))} disabled={page === invoiceList.totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state"><p>No invoices found.</p></div>
      )}
    </div>
  );
}
