import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MdDashboard, MdDirectionsCar, MdBookOnline, MdPeople, MdPayment, MdMail, MdLocalOffer, MdLogout } from 'react-icons/md';
import { useState } from 'react';
import { logoutUser } from '../redux/slices/authSlice.js';
import toast from 'react-hot-toast';
import './layouts.css';

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: MdDashboard, exact: true },
  { to: '/admin/cars', label: 'Manage Cars', icon: MdDirectionsCar },
  { to: '/admin/bookings', label: 'Bookings', icon: MdBookOnline },
  { to: '/admin/users', label: 'Customers', icon: MdPeople },
  { to: '/admin/payments', label: 'Payments', icon: MdPayment },
  { to: '/admin/contacts', label: 'Support', icon: MdMail },
  { to: '/admin/coupons', label: 'Coupons', icon: MdLocalOffer },
];

export default function AdminLayout() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="dashboard-layout admin-layout">
      <motion.aside className={`dashboard-sidebar admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        initial={{ x: -300 }} animate={{ x: 0 }} transition={{ duration: 0.3 }}>
        <div className="sidebar-brand">
          <span className="brand-icon">👑</span>
          <div>
            <p className="brand-name">RoyalRent</p>
            <p className="brand-role">Admin Panel</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {adminNavItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink key={to} to={to} end={exact} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <Icon size={20} />{label}
            </NavLink>
          ))}
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <MdLogout size={20} />Logout
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user?.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div>
            <p className="sidebar-name">{user?.name}</p>
            <p style={{ color: '#FF8A00', fontSize: '11px', fontWeight: 600 }}>Administrator</p>
          </div>
        </div>
      </motion.aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="dashboard-main admin-main">
        <Outlet />
      </main>
    </div>
  );
}
