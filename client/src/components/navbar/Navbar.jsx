import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiUser, FiLogOut, FiLayout, FiShield,
  FiChevronDown, FiClock, FiSettings, FiStar, FiHeart,
} from 'react-icons/fi';
import { logoutUser } from '../../redux/slices/authSlice.js';
import toast from 'react-hot-toast';
import logoImg from '@assets/logo_1779723381406.png';
import './navbar.css';

const NAV_LINKS = [
  { path: '/', label: 'Home', end: true },
  { path: '/cars', label: 'Book Car', end: false },
  { path: '/dashboard/bookings', label: 'History', end: false },
  { path: '/contact', label: 'Contact', end: false },
];

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.2 } }),
};

export default function Navbar() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const adminLinks = user?.role === 'admin'
    ? [{ to: '/admin', icon: FiShield, label: 'Admin Panel', color: '#ff8a00' }]
    : [{ to: '/dashboard', icon: FiLayout, label: 'Dashboard', color: '#7c6ef0' }];

  const userLinks = [
    { to: '/dashboard/profile', icon: FiUser, label: 'My Profile', color: '#4ecdc4' },
    { to: '/dashboard/bookings', icon: FiClock, label: 'Booking History', color: '#00c864' },
    { to: '/dashboard/wishlist', icon: FiHeart, label: 'Wishlist', color: '#ff6b6b' },
  ];

  return (
    <motion.nav
      className={`navbar-custom ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <img src={logoImg} alt="RoyalRent Logo" className="navbar-logo-img" />
          <span className="brand-text">Royal<span className="orange-text">Rent</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          {NAV_LINKS.map(({ path, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right Side Auth */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className={`user-avatar-btn ${dropdownOpen ? 'active' : ''}`}
                onClick={() => setDropdownOpen(prev => !prev)}
                type="button"
              >
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="nav-avatar" />
                  : <div className="nav-avatar-initials">{user.name?.[0]?.toUpperCase()}</div>}
                <div className="nav-user-info">
                  <span className="nav-username">{user.name?.split(' ')[0]}</span>
                  <span className={`nav-role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                    {user.role === 'admin' ? '⚡ Admin' : '✦ Member'}
                  </span>
                </div>
                <FiChevronDown size={13} className={`nav-chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="user-dropdown"
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    {/* User Info Header */}
                    <div className="dropdown-user-header">
                      <div className="duh-glow" />
                      <div className="dropdown-avatar-wrap">
                        <div className="dropdown-avatar-lg">
                          {user.avatar
                            ? <img src={user.avatar} alt={user.name} />
                            : user.name?.[0]?.toUpperCase()}
                        </div>
                        <span className={`duh-role-dot ${user.role === 'admin' ? 'admin' : 'user'}`} />
                      </div>
                      <div className="duh-info">
                        <p className="dropdown-user-name">{user.name}</p>
                        <p className="dropdown-user-email">{user.email}</p>
                        <span className={`duh-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                          {user.role === 'admin' ? '⚡ Administrator' : '✦ Premium Member'}
                        </span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    {/* Admin / Dashboard */}
                    <div className="dropdown-section-label">Navigation</div>
                    {[...adminLinks, ...userLinks].map(({ to, icon: Icon, label, color }, i) => (
                      <motion.div key={to} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                        <Link
                          to={to}
                          className="dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="di-icon-wrap" style={{ background: `${color}18`, color }}>
                            <Icon size={13} />
                          </span>
                          {label}
                        </Link>
                      </motion.div>
                    ))}

                    <div className="dropdown-divider" />

                    {/* Logout */}
                    <motion.div custom={5} variants={itemVariants} initial="hidden" animate="visible">
                      <button className="dropdown-item logout" onClick={handleLogout} type="button">
                        <span className="di-icon-wrap" style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b' }}>
                          <FiLogOut size={13} />
                        </span>
                        Sign Out
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="navbar-login-btn">
                <FiUser size={14} /> Login
              </Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" type="button">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {NAV_LINKS.map(({ path, label, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            {user ? (
              <>
                <div className="mobile-divider" />
                <Link to="/dashboard/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>
                  <FiUser size={14} /> Profile
                </Link>
                <Link to="/dashboard/bookings" className="mobile-link" onClick={() => setMenuOpen(false)}>
                  <FiClock size={14} /> Booking History
                </Link>
                <button className="mobile-link mobile-logout" onClick={handleLogout} type="button">
                  <FiLogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <div style={{ padding: '12px 0 4px' }}>
                <Link
                  to="/login"
                  className="btn-orange"
                  style={{ width: '100%', textAlign: 'center', justifyContent: 'center', fontSize: '14px' }}
                  onClick={() => setMenuOpen(false)}
                >
                  <FiUser size={14} /> Login
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
