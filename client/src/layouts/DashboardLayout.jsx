import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiCalendar, FiHeart, FiStar, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { logoutUser } from '../redux/slices/authSlice.js';
import toast from 'react-hot-toast';
import './layouts.css';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: FiUser, exact: true },
  { to: '/dashboard/bookings', label: 'My Bookings', icon: FiCalendar },
  { to: '/dashboard/wishlist', label: 'Wishlist', icon: FiHeart },
  { to: '/dashboard/reviews', label: 'My Reviews', icon: FiStar },
  { to: '/dashboard/profile', label: 'Profile', icon: FiSettings },
];

export default function DashboardLayout() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      <motion.aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}
        initial={{ x: -300 }} animate={{ x: 0 }} transition={{ duration: 0.3 }}>
        <div className="sidebar-header">
          <div className="sidebar-avatar">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user?.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div>
            <p className="sidebar-name">{user?.name}</p>
            <p className="sidebar-email">{user?.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink key={to} to={to} end={exact} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} />Logout
          </button>
        </nav>
      </motion.aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
