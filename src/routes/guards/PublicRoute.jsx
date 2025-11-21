import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMockAuth } from '../../services/authService';

export default function PublicRoute() {
  const { isAuthenticated } = useMockAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  return isAuthenticated ? <Navigate to={from} replace /> : <Outlet />;
}
