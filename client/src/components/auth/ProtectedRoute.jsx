import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../constants/index.js';
import { PageLoader } from '../ui/LoadingSpinner.jsx';

export function ProtectedRoute({ children }) {
  const { accessToken, initialized } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!initialized) return <PageLoader />;
  if (!accessToken) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;

  return children;
}
