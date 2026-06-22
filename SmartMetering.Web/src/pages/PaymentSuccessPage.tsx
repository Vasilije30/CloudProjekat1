import { Link } from 'react-router-dom';

export default function PaymentSuccessPage() {
  return (
    <div className="result-page">
      <div className="result-card">
        <h1 style={{ color: 'var(--success)' }}>Payment Successful</h1>
        <p>Your payment has been processed successfully. Your invoice status will be updated shortly.</p>
        <Link to="/invoices" className="btn btn-primary">
          Back to Invoices
        </Link>
      </div>
    </div>
  );
}
