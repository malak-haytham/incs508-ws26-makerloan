import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Each member adds ONE nav link for their feature here (one-line change).
const NAV = [
  { to: '/availability', label: 'Availability & Reservations' },
  { to: '/desk', label: 'Desk (Check-out/in)' },
  { to: '/tracking', label: 'Item Tracking' },
  { to: '/overdue', label: 'Overdue' },
  { to: '/safety', label: 'Safety' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 1100, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong>MakerLoan</strong>
        {NAV.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}
        <span style={{ marginLeft: 'auto' }}>{user?.fullName} ({user?.role}) <button onClick={logout}>Logout</button></span>
      </header>
      <hr />
      <Outlet />
    </div>
  );
}
