import { Link, Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../api/types';
import { useAuth } from './AuthContext';

/** <Route element={<ProtectedRoute roles={['DESK_ASSISTANT']} />}> … </Route>  (UI hint only — backend enforces) */
export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="app-loading"><span className="loading-spinner" />Preparing your workspace…</main>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <main className="access-page"><section className="access-card"><span className="access-icon" aria-hidden="true">!</span><span className="access-eyebrow">ACCESS RESTRICTED</span><h1>You don’t have access to this workspace.</h1><p>Your current role doesn’t have permission to open this area. If you think this is a mistake, contact a workspace manager.</p><Link to="/">Return to overview</Link></section></main>;
  }
  return <Outlet />;
}
