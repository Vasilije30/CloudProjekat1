import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>SmartMetering</h2>
        </div>
        <nav className="sidebar-nav">
          {role === 'Consumer' && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Dashboard
              </NavLink>
              <NavLink to="/properties" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Properties
              </NavLink>
              <NavLink to="/invoices" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Invoices
              </NavLink>
              <NavLink to="/manual-readings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Manual Readings
              </NavLink>
            </>
          )}
          {role === 'Admin' && (
            <>
              <NavLink to="/admin/accounts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Accounts
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Create User
              </NavLink>
              <NavLink to="/admin/meters" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Meter Review
              </NavLink>
              <NavLink to="/admin/invoices" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Invoices
              </NavLink>
              <NavLink to="/admin/alerts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Alerts
              </NavLink>
              <NavLink to="/admin/tariff-models" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Tariff Models
              </NavLink>
            </>
          )}
          {role === 'BillingAdmin' && (
            <>
              <NavLink to="/admin/tariff-models" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Tariff Models
              </NavLink>
              <NavLink to="/admin/meters" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Meter Review
              </NavLink>
              <NavLink to="/admin/manual-readings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Manual Readings
              </NavLink>
            </>
          )}
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-spacer" />
          <div className="topbar-right">
            <span className="topbar-email">{email}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
