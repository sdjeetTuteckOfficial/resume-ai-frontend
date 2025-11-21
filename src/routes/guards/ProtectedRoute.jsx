import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMockAuth } from '../../services/authService';

export default function ProtectedRoute() {
  const { isAuthenticated } = useMockAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return <Outlet />;
}
