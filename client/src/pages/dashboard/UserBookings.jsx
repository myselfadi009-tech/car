import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiX } from 'react-icons/fi';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import './dashboard.css';

const TABS = ['All', 'Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => { setBookings(data.bookings); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'Cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  const filtered = activeTab === 'All' ? bookings : bookings.filter(b => b.status === activeTab);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>My <span className="orange-text">Bookings</span></h1>
          <p>Manage all your car rental bookings</p>
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab} {tab !== 'All' && <span className="tab-count">{bookings.filter(b => tab === 'All' || b.status === tab).length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass-card">
          <p style={{ fontSize: 40 }}>📋</p>
          <h4>No {activeTab.toLowerCase()} bookings</h4>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((b, i) => (
            <motion.div key={b._id} className="booking-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="booking-card-inner">
                <img src={b.car?.images?.[0] || 'https://via.placeholder.com/120x80/121212/FF8A00?text=Car'} alt={b.car?.name} className="booking-card-img" />
                <div className="booking-card-info">
                  <div className="booking-card-header">
                    <div>
                      <p className="booking-id">#{b.bookingId}</p>
                      <h4>{b.car?.name}</h4>
                      <p className="booking-brand">{b.car?.brand}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
                      <p className="booking-amount">₹{b.totalAmount?.toLocaleString()}</p>
                      <span className={`status-badge status-${b.paymentStatus.toLowerCase()}`} style={{ fontSize: '10px', marginTop: 4 }}>{b.paymentStatus}</span>
                    </div>
                  </div>
                  <div className="booking-card-details">
                    <div><FiMapPin size={13} />{b.pickupLocation}</div>
                    <div><FiCalendar size={13} />{new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()} ({b.totalDays} days)</div>
                  </div>
                  {['Pending', 'Confirmed'].includes(b.status) && (
                    <button className="cancel-btn" onClick={() => handleCancel(b._id)}>
                      <FiX size={13} /> Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
