import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';
import F1Page from './features/f1-availability-reservations/F1Page';
import F2Page from './features/f2-checkout-checkin/F2Page';
import F3Page from './features/f3-status-tracking/F3Page';
import F4Page from './features/f4-overdue/F4Page';
import F5Page from './features/f5-safety/F5Page';
import Home from './pages/Home';
import Login from './pages/Login';

// One route per feature. Restrict by role with <ProtectedRoute roles={[...]} /> if needed.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="availability" element={<F1Page />} />
          <Route path="desk" element={<F2Page />} />
          <Route path="tracking" element={<F3Page />} />
          <Route path="overdue" element={<F4Page />} />
          <Route path="safety" element={<F5Page />} />
        </Route>
      </Route>
    </Routes>
  );
}
