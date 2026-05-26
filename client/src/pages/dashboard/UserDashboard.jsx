import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiCreditCard, FiHeart, FiStar } from 'react-icons/fi';
import api from '../../services/api.js';
import './dashboard.css';

export default function UserDashboard() {
  const { user } = useSelector(s => s.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => { setBookings(data.bookings); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const stats = [
    { icon: FiCalendar, label: 'Total Bookings', value: bookings.length, color: '#FF8A00' },
    { icon: FiCalendar, label: 'Active', value: bookings.filter(b => b.status === 'Active').length, color: '#00c864' },
    { icon: FiCalendar, label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, color: '#6495ed' },
    { icon: FiCreditCard, label: 'Total Spent', value: '₹' + bookings.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + b.totalAmount, 0).toLocaleString(), color: '#FF8A00' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, <span className="orange-text">{user?.name?.split(' ')[0]}!</span> 👋</h1>
          <p>Here's an overview of your rental activity</p>
        </div>
        <Link to="/cars" className="btn-orange">Book a Car</Link>
      </div>

      <div className="stats-grid-4">
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="stat-card-icon" style={{ background: `${color}20`, color }}>
              <Icon size={22} />
            </div>
            <div>
              <p className="stat-card-value">{value}</p>
              <p className="stat-card-label">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="recent-bookings glass-card">
        <div className="section-row">
          <h3>Recent Bookings</h3>
          <Link to="/dashboard/bookings" className="btn-outline-orange" style={{ padding: '8px 16px', fontSize: '12px' }}>View All</Link>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 10 }} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: 40 }}>🚗</p>
            <h4>No bookings yet</h4>
            <p>Start your luxury journey today!</p>
            <Link to="/cars" className="btn-orange" style={{ fontSize: '13px', padding: '10px 24px' }}>Browse Cars</Link>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.slice(0, 5).map(b => (
              <div key={b._id} className="booking-row">
                <img src={b.car?.images?.[0] || 'https://via.placeholder.com/60x40/121212/FF8A00?text=Car'} alt={b.car?.name} className="booking-car-img" />
                <div className="booking-row-info">
                  <p className="booking-car-name">{b.car?.name}</p>
                  <p className="booking-car-dates">{new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}</p>
                </div>
                <div className="booking-row-amount">₹{b.totalAmount?.toLocaleString()}</div>
                <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
