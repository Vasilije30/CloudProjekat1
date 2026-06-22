import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SetPasswordPage from './pages/SetPasswordPage';
import ConsumerDashboard from './pages/ConsumerDashboard';
import PropertiesPage from './pages/PropertiesPage';
import InvoicesPage from './pages/InvoicesPage';
import ManualReadingsPage from './pages/ManualReadingsPage';
import AdminAccountsPage from './pages/AdminAccountsPage';
import AdminCreateUserPage from './pages/AdminCreateUserPage';
import AdminTariffModelsPage from './pages/AdminTariffModelsPage';
import AdminMeterReviewPage from './pages/AdminMeterReviewPage';
import AdminInvoicesPage from './pages/AdminInvoicesPage';
import AdminAlertsPage from './pages/AdminAlertsPage';
import AdminManualReadingsPage from './pages/AdminManualReadingsPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/payment-cancel" element={<PaymentCancelPage />} />

      {/* Protected routes with layout */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Consumer routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Consumer']}>
            <ConsumerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/properties" element={
          <ProtectedRoute allowedRoles={['Consumer']}>
            <PropertiesPage />
          </ProtectedRoute>
        } />
        <Route path="/invoices" element={
          <ProtectedRoute allowedRoles={['Consumer']}>
            <InvoicesPage />
          </ProtectedRoute>
        } />
        <Route path="/manual-readings" element={
          <ProtectedRoute allowedRoles={['Consumer']}>
            <ManualReadingsPage />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/accounts" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminAccountsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminCreateUserPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/tariff-models" element={
          <ProtectedRoute allowedRoles={['Admin', 'BillingAdmin']}>
            <AdminTariffModelsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/meters" element={
          <ProtectedRoute allowedRoles={['Admin', 'BillingAdmin']}>
            <AdminMeterReviewPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/invoices" element={
          <ProtectedRoute allowedRoles={['Admin', 'BillingAdmin']}>
            <AdminInvoicesPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/alerts" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminAlertsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/manual-readings" element={
          <ProtectedRoute allowedRoles={['BillingAdmin']}>
            <AdminManualReadingsPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
