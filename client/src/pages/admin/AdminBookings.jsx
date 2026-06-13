import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiX, FiPhone, FiHome, FiChevronDown, FiChevronUp,
  FiMapPin, FiCalendar, FiMail, FiUser, FiClock, FiCreditCard,
  FiTruck, FiArrowRight
} from 'react-icons/fi';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import './admin.css';

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function diffDays(a, b) {
  if (!a || !b) return null;
  return Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

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
      || b.user?.email?.toLowerCase().includes(search.toLowerCase())
      || b.user?.phone?.includes(search);
    return matchTab && matchSearch;
  });

  const statusCounts = STATUS_OPTIONS.slice(1).reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length;
    return acc;
  }, {});

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Booking <span className="orange-text">Management</span></h1>
          <p>{bookings.length} total bookings across all statuses</p>
        </div>
      </div>

      {/* Status Summary Chips */}
      <div className="bm-status-chips">
        {STATUS_OPTIONS.slice(1).map(s => (
          <div key={s} className={`bm-chip bm-chip-${s.toLowerCase()}`}>
            <span className="bm-chip-label">{s}</span>
            <span className="bm-chip-count">{statusCounts[s] || 0}</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {STATUS_OPTIONS.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab !== 'All' && statusCounts[tab] > 0 && (
              <span className="tab-count">{statusCounts[tab]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="admin-search-bar">
        <FiSearch size={16} />
        <input
          placeholder="Search by name, email, car, booking ID, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch('')}><FiX /></button>}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
      ) : (
        <div className="admin-table glass-card">
          <table>
            <thead>
              <tr>
                <th style={{ width: 130 }}>Booking ID</th>
                <th style={{ width: 200 }}>Customer</th>
                <th style={{ width: 180 }}>Car</th>
                <th style={{ width: 160 }}>Pickup</th>
                <th style={{ width: 160 }}>Return</th>
                <th style={{ width: 100 }}>Amount</th>
                <th style={{ width: 100 }}>Status</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const days = diffDays(b.pickupDate, b.returnDate);
                const isExpanded = expandedRow === b._id;
                return (
                  <>
                    <motion.tr
                      key={b._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpandedRow(isExpanded ? null : b._id)}
                    >
                      {/* Booking ID */}
                      <td>
                        <div>
                          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 12, color: 'var(--orange)', fontWeight: 700 }}>#{b.bookingId}</p>
                          <span className={`status-badge status-${b.paymentStatus?.toLowerCase()}`} style={{ fontSize: 9, marginTop: 4, display: 'inline-block' }}>{b.paymentStatus}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="table-avatar" style={{ width: 34, height: 34, fontSize: 13, flexShrink: 0 }}>
                            {b.user?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-white)', fontSize: 13 }}>{b.user?.name || '—'}</p>
                            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <FiMail size={9} /> {b.user?.email || '—'}
                            </p>
                            {b.user?.phone && (
                              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <FiPhone size={9} /> {b.user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Car */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={b.car?.images?.[0]} alt="" style={{ width: 48, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--text-white)', fontWeight: 500 }}>{b.car?.name}</span>
                        </div>
                      </td>

                      {/* Pickup */}
                      <td>
                        <p style={{ margin: 0, fontSize: 12, color: '#00c864', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiCalendar size={10} /> {fmt(b.pickupDate)}
                        </p>
                        {(b.pickupLocation || b.pickupAddress) && (
                          <p style={{ margin: '3px 0 0', fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <FiMapPin size={9} /> {b.pickupLocation || b.pickupAddress}
                          </p>
                        )}
                      </td>

                      {/* Return */}
                      <td>
                        <p style={{ margin: 0, fontSize: 12, color: '#ff8a00', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiCalendar size={10} /> {fmt(b.returnDate)}
                        </p>
                        {days && (
                          <p style={{ margin: '3px 0 0', fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <FiClock size={9} /> {days} day{days !== 1 ? 's' : ''}
                          </p>
                        )}
                      </td>

                      {/* Amount */}
                      <td style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 13 }}>
                        ₹{b.totalAmount?.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
                      </td>

                      {/* Actions */}
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {b.status === 'Pending' && (
                            <>
                              <button className="action-btn edit" onClick={() => updateStatus(b._id, 'Confirmed')} title="Confirm">✓</button>
                              <button className="action-btn delete" onClick={() => updateStatus(b._id, 'Cancelled')} title="Cancel">✗</button>
                            </>
                          )}
                          {b.status === 'Confirmed' && (
                            <button className="action-btn edit" onClick={() => updateStatus(b._id, 'Completed')} title="Complete" style={{ fontSize: 10, width: 'auto', padding: '4px 8px' }}>Done</button>
                          )}
                          <button
                            style={{ background: isExpanded ? 'rgba(255,138,0,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isExpanded ? 'rgba(255,138,0,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: isExpanded ? 'var(--orange)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                            onClick={() => setExpandedRow(isExpanded ? null : b._id)}
                            title={isExpanded ? 'Hide details' : 'View full details'}
                          >
                            {isExpanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded Detail Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          key={`${b._id}-detail`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td colSpan={8} style={{ padding: 0, borderBottom: '2px solid rgba(255,138,0,0.15)' }}>
                            <div className="bm-detail-panel">

                              {/* Section: Customer Info */}
                              <div className="bm-detail-section">
                                <div className="bm-section-title">
                                  <FiUser size={12} /> Customer Information
                                </div>
                                <div className="bm-detail-grid">
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Full Name</span>
                                    <span className="bm-detail-val">{b.user?.name || '—'}</span>
                                  </div>
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Email Address</span>
                                    <span className="bm-detail-val">
                                      <FiMail size={11} style={{ marginRight: 4, color: 'var(--orange)' }} />
                                      {b.user?.email || '—'}
                                    </span>
                                  </div>
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Phone Number</span>
                                    <span className="bm-detail-val">
                                      <FiPhone size={11} style={{ marginRight: 4, color: 'var(--orange)' }} />
                                      {b.user?.phone || 'Not provided'}
                                    </span>
                                  </div>
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Home Address</span>
                                    <span className="bm-detail-val">
                                      <FiHome size={11} style={{ marginRight: 4, color: 'var(--orange)' }} />
                                      {b.user?.address || 'Not provided'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bm-detail-divider" />

                              {/* Section: Booking Info */}
                              <div className="bm-detail-section">
                                <div className="bm-section-title">
                                  <FiTruck size={12} /> Booking Information
                                </div>
                                <div className="bm-detail-grid">
                                  <div className="bm-detail-item bm-highlight-green">
                                    <span className="bm-detail-label">Pickup Date</span>
                                    <span className="bm-detail-val" style={{ color: '#00c864' }}>
                                      <FiCalendar size={11} style={{ marginRight: 4 }} />
                                      {fmt(b.pickupDate)}
                                    </span>
                                  </div>
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Pickup Address</span>
                                    <span className="bm-detail-val">
                                      <FiMapPin size={11} style={{ marginRight: 4, color: '#00c864' }} />
                                      {b.pickupLocation || b.pickupAddress || 'Not specified'}
                                    </span>
                                  </div>
                                  <div className="bm-detail-item bm-highlight-orange">
                                    <span className="bm-detail-label">Return Date</span>
                                    <span className="bm-detail-val" style={{ color: '#ff8a00' }}>
                                      <FiCalendar size={11} style={{ marginRight: 4 }} />
                                      {fmt(b.returnDate)}
                                    </span>
                                  </div>
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Return Address</span>
                                    <span className="bm-detail-val">
                                      <FiMapPin size={11} style={{ marginRight: 4, color: '#ff8a00' }} />
                                      {b.returnLocation || b.dropoffLocation || b.dropoffAddress || b.pickupLocation || 'Same as pickup'}
                                    </span>
                                  </div>
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Trip Duration</span>
                                    <span className="bm-detail-val">
                                      <FiClock size={11} style={{ marginRight: 4, color: 'var(--orange)' }} />
                                      {days ? `${days} day${days !== 1 ? 's' : ''}` : '—'}
                                    </span>
                                  </div>
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Booking ID</span>
                                    <span className="bm-detail-val" style={{ fontFamily: 'monospace', color: 'var(--orange)', fontSize: 12 }}>
                                      #{b.bookingId}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bm-detail-divider" />

                              {/* Section: Payment Info */}
                              <div className="bm-detail-section">
                                <div className="bm-section-title">
                                  <FiCreditCard size={12} /> Payment Information
                                </div>
                                <div className="bm-detail-grid">
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Total Amount</span>
                                    <span className="bm-detail-val" style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 15 }}>
                                      ₹{b.totalAmount?.toLocaleString() || '—'}
                                    </span>
                                  </div>
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Payment Method</span>
                                    <span className="bm-detail-val" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                      {b.paymentMethod || '—'}
                                    </span>
                                  </div>
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Payment Status</span>
                                    <span className={`status-badge status-${b.paymentStatus?.toLowerCase()}`} style={{ display: 'inline-block', marginTop: 2 }}>
                                      {b.paymentStatus}
                                    </span>
                                  </div>
                                  <div className="bm-detail-item">
                                    <span className="bm-detail-label">Booking Status</span>
                                    <span className={`status-badge status-${b.status.toLowerCase()}`} style={{ display: 'inline-block', marginTop: 2 }}>
                                      {b.status}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions inside panel */}
                              {(b.status === 'Pending' || b.status === 'Confirmed') && (
                                <div className="bm-panel-actions">
                                  {b.status === 'Pending' && (
                                    <>
                                      <button className="bm-action-confirm" onClick={() => updateStatus(b._id, 'Confirmed')}>
                                        ✓ Confirm Booking
                                      </button>
                                      <button className="bm-action-cancel" onClick={() => updateStatus(b._id, 'Cancelled')}>
                                        ✗ Cancel Booking
                                      </button>
                                    </>
                                  )}
                                  {b.status === 'Confirmed' && (
                                    <button className="bm-action-complete" onClick={() => updateStatus(b._id, 'Completed')}>
                                      ✓ Mark as Completed
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-secondary)' }}>
              No bookings found
            </p>
          )}
        </div>
      )}
    </div>
  );
}
