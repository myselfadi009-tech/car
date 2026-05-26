import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute() {
  const { user, initialized } = useSelector(state => state.auth);
  if (!initialized) return <div className="page-loader"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
