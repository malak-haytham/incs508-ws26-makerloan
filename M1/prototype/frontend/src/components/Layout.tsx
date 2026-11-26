import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './layout.css';

const NAV = [
  { to: '/', label: 'Overview', icon: 'overview', end: true },
  { to: '/availability', label: 'Availability & reservations', icon: 'calendar' },
  { to: '/desk', label: 'Check-out & check-in', icon: 'desk' },
  { to: '/tracking', label: 'Item tracking', icon: 'tracking' },
  { to: '/overdue', label: 'Overdue loans', icon: 'clock' },
  { to: '/safety', label: 'Safety briefings', icon: 'shield' },
];

const PAGE_NAMES: Record<string, string> = {
  '/': 'Overview',
  '/availability': 'Availability & reservations',
  '/desk': 'Check-out & check-in',
  '/tracking': 'Item tracking',
  '/overdue': 'Overdue loans',
  '/safety': 'Safety briefings',
};

function NavIcon({ name }: { name: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 1.8 };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>
      {name === 'overview' && <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>}
      {name === 'calendar' && <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h2M14 13h2M8 16.5h2" /></>}
      {name === 'desk' && <><path d="M4 7h13M14 4l3 3-3 3M20 17H7m3-3-3 3 3 3" /></>}
      {name === 'tracking' && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>}
      {name === 'clock' && <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>}
      {name === 'shield' && <><path d="M12 21s7-3.6 7-9V5l-7-2-7 2v7c0 5.4 7 9 7 9Z" /><path d="m9 12 2 2 4-4" /></>}
    </svg>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageName = PAGE_NAMES[location.pathname] ?? 'MakerLoan';
  const initials = user?.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() ?? 'ML';

  return (
    <div className="app-shell">
      {menuOpen && <button aria-label="Close navigation" className="sidebar-scrim" onClick={() => setMenuOpen(false)} />}
      <aside className={`app-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <Link className="brand-lockup" to="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">M</span>
          <span className="brand-name">maker<span>loan</span><small>MAKERSPACE OPERATIONS</small></span>
        </Link>

        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
              {item.to === '/safety' && <span className="nav-new-dot" aria-label="Safety feature" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="workspace-status"><span className="status-indicator" /><span><strong>Prototype workspace</strong><small>Milestone 1</small></span></div>
          <div className="sidebar-version">MAKERLOAN · GIU</div>
        </div>
      </aside>

      <div className="app-main-column">
        <header className="app-topbar">
          <button className="mobile-menu-button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <span /><span /><span />
          </button>
          <div className="topbar-location"><span>Workspace</span><span className="location-divider">/</span><strong>{pageName}</strong></div>
          <div className="topbar-account">
            <div className="account-copy"><strong>{user?.fullName}</strong><span>{user?.role?.replaceAll('_', ' ')}</span></div>
            <span className="account-avatar" aria-hidden="true">{initials}</span>
            <button className="logout-button" onClick={() => void logout()}>Sign out</button>
          </div>
        </header>

        <div className="app-content"><Outlet /></div>
        <footer className="app-footer"><span>MakerLoan</span><span>Equipment lending, organized.</span></footer>
      </div>
    </div>
  );
}
