import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiPhone, FiHome, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import './admin.css';

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    api.get('/bookings/all', { params: { limit: 200 } })
      .then(({ data }) => { setBookings(data.bookings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: data.booking.status } : b));
      toast.success(`Booking ${status.toLowerCase()}`);
    } catch { toast.error('Failed to update'); }
  };

  const filtered = bookings.filter(b => {
    const matchTab = activeTab === 'All' || b.status === activeTab;
    const matchSearch = !search
      || b.user?.name?.toLowerCase().includes(search.toLowerCase())
      || b.car?.name?.toLowerCase().includes(search.toLowerCase())
      || b.bookingId?.includes(search)
      || b.user?.phone?.includes(search);
    return matchTab && matchSearch;
  });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Booking <span className="orange-text">Management</span></h1>
          <p>{bookings.length} total bookings</p>
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {STATUS_OPTIONS.map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      <div className="admin-search-bar">
        <FiSearch size={16} />
        <input placeholder="Search by customer, car, booking ID, or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')}><FiX /></button>}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
      ) : (
        <div className="admin-table glass-card">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <>
                  <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--orange)' }}>#{b.bookingId}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-white)', fontSize: 13 }}>{b.user?.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>{b.user?.email}</p>
                          {b.user?.phone && (
                            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <FiPhone size={9} /> {b.user.phone}
                            </p>
                          )}
                        </div>
                        {(b.user?.phone || b.user?.address) && (
                          <button
                            onClick={() => setExpandedRow(expandedRow === b._id ? null : b._id)}
                            style={{ background: 'rgba(255,138,0,0.1)', border: '1px solid rgba(255,138,0,0.2)', borderRadius: 6, padding: '3px 6px', cursor: 'pointer', color: 'var(--orange)', display: 'flex', alignItems: 'center' }}
                            title="View full details"
                          >
                            {expandedRow === b._id ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={b.car?.images?.[0]} alt="" style={{ width: 50, height: 34, borderRadius: 6, objectFit: 'cover' }} />
                        <span style={{ fontSize: 13 }}>{b.car?.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {new Date(b.pickupDate).toLocaleDateString()}<br />→ {new Date(b.returnDate).toLocaleDateString()}
                    </td>
                    <td style={{ color: 'var(--orange)', fontWeight: 700 }}>₹{b.totalAmount?.toLocaleString()}</td>
                    <td><span className={`status-badge status-${b.paymentStatus?.toLowerCase()}`}>{b.paymentStatus}</span></td>
                    <td><span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
                    <td>
                      {b.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="action-btn edit" onClick={() => updateStatus(b._id, 'Confirmed')} title="Confirm">✓</button>
                          <button className="action-btn delete" onClick={() => updateStatus(b._id, 'Cancelled')} title="Cancel">✗</button>
                        </div>
                      )}
                      {b.status === 'Confirmed' && (
                        <button className="action-btn edit" onClick={() => updateStatus(b._id, 'Completed')} title="Mark Complete" style={{ fontSize: 11, padding: '4px 10px', width: 'auto' }}>Complete</button>
                      )}
                    </td>
                  </motion.tr>

                  {expandedRow === b._id && (
                    <motion.tr key={`${b._id}-detail`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <div className="booking-detail-panel">
                          <div className="bdp-grid">
                            <div className="bdp-item">
                              <span className="bdp-label">Full Name</span>
                              <span className="bdp-val">{b.user?.name || '—'}</span>
                            </div>
                            <div className="bdp-item">
                              <span className="bdp-label">Email</span>
                              <span className="bdp-val">{b.user?.email || '—'}</span>
                            </div>
                            <div className="bdp-item">
                              <span className="bdp-label"><FiPhone size={11} /> Phone</span>
                              <span className="bdp-val">{b.user?.phone || 'Not provided'}</span>
                            </div>
                            <div className="bdp-item">
                              <span className="bdp-label"><FiHome size={11} /> Address</span>
                              <span className="bdp-val">{b.user?.address || 'Not provided'}</span>
                            </div>
                            <div className="bdp-item">
                              <span className="bdp-label">Pickup Location</span>
                              <span className="bdp-val">{b.pickupLocation || '—'}</span>
                            </div>
                            <div className="bdp-item">
                              <span className="bdp-label">Payment Method</span>
                              <span className="bdp-val" style={{ textTransform: 'uppercase' }}>{b.paymentMethod || '—'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>No bookings found</p>}
        </div>
      )}
    </div>
  );
}
