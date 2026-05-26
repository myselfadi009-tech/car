import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute() {
  const { user, initialized } = useSelector(state => state.auth);
  if (!initialized) return <div className="page-loader"><div className="spinner"></div></div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
