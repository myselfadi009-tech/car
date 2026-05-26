import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiCalendar, FiMapPin } from 'react-icons/fi';
import api from '../../services/api.js';
import './booking.css';

export default function BookingSuccessPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`).then(({ data }) => setBooking(data.booking)).catch(() => {});
  }, [bookingId]);

  return (
    <div className="booking-success-page">
      <motion.div className="success-card glass-card" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
        <div className="success-icon">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
            <FiCheck size={40} />
          </motion.div>
        </div>
        <h1>Booking Confirmed! 🎉</h1>
        <p>Your luxury car rental has been confirmed. Get ready for an amazing experience!</p>

        {booking && (
          <div className="success-details">
            <div className="success-detail-item">
              <span>Booking ID</span>
              <span>{booking.bookingId}</span>
            </div>
            <div className="success-detail-item">
              <FiMapPin size={14} /><span>Pickup</span>
              <span>{booking.pickupLocation}</span>
            </div>
            <div className="success-detail-item">
              <FiCalendar size={14} /><span>Dates</span>
              <span>{new Date(booking.pickupDate).toLocaleDateString()} → {new Date(booking.returnDate).toLocaleDateString()}</span>
            </div>
            <div className="success-detail-item">
              <span>Amount Paid</span>
              <span style={{ color: 'var(--orange)', fontWeight: 700 }}>₹{booking.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="success-actions">
          <Link to="/dashboard/bookings" className="btn-orange">View My Bookings</Link>
          <Link to="/cars" className="btn-outline-orange">Browse More Cars</Link>
        </div>
      </motion.div>
    </div>
  );
}
