import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../api/types';
import { useAuth } from './AuthContext';

/** <Route element={<ProtectedRoute roles={['DESK_ASSISTANT']} />}> … </Route>  (UI hint only — backend enforces) */
export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <p>You do not have access to this page.</p>;
  return <Outlet />;
}
