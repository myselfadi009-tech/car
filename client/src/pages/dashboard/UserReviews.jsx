import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import api from '../../services/api.js';
import './dashboard.css';

export default function UserReviews() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => {
      setBookings(data.bookings.filter(b => b.status === 'Completed'));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>My <span className="orange-text">Reviews</span></h1>
          <p>Review your completed rentals</p>
        </div>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state glass-card">
          <p style={{ fontSize: 40 }}>⭐</p>
          <h4>No completed rentals to review</h4>
          <p>Complete a booking to leave a review</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map((b, i) => (
            <motion.div key={b._id} className="glass-card" style={{ padding: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={b.car?.images?.[0]} alt={b.car?.name} style={{ width: 70, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'var(--text-white)', margin: 0 }}>{b.car?.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '4px 0' }}>
                    {new Date(b.pickupDate).toLocaleDateString()} - {new Date(b.returnDate).toLocaleDateString()}
                  </p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(n => <FiStar key={n} size={14} fill="#FFB800" color="#FFB800" />)}
                  </div>
                </div>
                <a href={`/cars/${b.car?._id}`} className="btn-orange" style={{ fontSize: '12px', padding: '8px 16px' }}>Review</a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
