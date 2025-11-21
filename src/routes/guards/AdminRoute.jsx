import { Navigate, Outlet } from 'react-router-dom';
import { useMockAuth } from '../../services/authService';

export default function AdminRoute() {
  const { role } = useMockAuth();

  return role === 'admin' ? (
    <Outlet />
  ) : (
    <Navigate to='/unauthorized' replace />
  );
}
