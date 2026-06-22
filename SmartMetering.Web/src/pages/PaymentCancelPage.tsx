import { Link } from 'react-router-dom';

export default function PaymentCancelPage() {
  return (
    <div className="result-page">
      <div className="result-card">
        <h1 style={{ color: 'var(--danger)' }}>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges were made. You can try again at any time.</p>
        <Link to="/invoices" className="btn btn-primary">
          Back to Invoices
        </Link>
      </div>
    </div>
  );
}
