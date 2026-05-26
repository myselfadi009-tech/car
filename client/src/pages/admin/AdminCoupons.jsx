import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import './admin.css';

const INIT = { code: '', discountType: 'percentage', discountValue: '', minBookingAmount: 0, maxDiscount: '', usageLimit: 100, expiryDate: '' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INIT);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/coupons').then(({ data }) => { setCoupons(data.coupons); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/coupons', form);
      setCoupons(prev => [data.coupon, ...prev]);
      toast.success('Coupon created!');
      setShowModal(false);
      setForm(INIT);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(prev => prev.filter(c => c._id !== id));
      toast.success('Coupon deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Coupon <span className="orange-text">Management</span></h1>
          <p>{coupons.length} active coupons</p>
        </div>
        <button className="btn-orange" onClick={() => setShowModal(true)}><FiPlus /> Create Coupon</button>
      </div>

      {loading ? <div className="skeleton" style={{ height: 300, borderRadius: 16 }} /> : (
        <div className="admin-table glass-card">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Discount</th>
                <th>Min Amount</th>
                <th>Used</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <td style={{ fontWeight: 700, color: 'var(--orange)', letterSpacing: 1 }}>{c.code}</td>
                  <td style={{ fontSize: 13 }}>{c.discountType}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                  <td>₹{c.minBookingAmount?.toLocaleString()}</td>
                  <td>{c.usedCount}/{c.usageLimit}</td>
                  <td style={{ fontSize: 12, color: new Date(c.expiryDate) < new Date() ? '#ff4444' : 'var(--text-secondary)' }}>{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td><span className={`status-badge ${c.isActive && new Date(c.expiryDate) > new Date() ? 'status-confirmed' : 'status-cancelled'}`}>{c.isActive && new Date(c.expiryDate) > new Date() ? 'Active' : 'Expired'}</span></td>
                  <td><button className="action-btn delete" onClick={() => handleDelete(c._id)}><FiTrash2 size={14} /></button></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>No coupons created</p>}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" style={{ maxWidth: 480 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="modal-header">
                <h3>Create Coupon</h3>
                <button onClick={() => setShowModal(false)}><FiX size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="modal-form">
                <div className="form-group">
                  <label className="form-label-custom">Coupon Code</label>
                  <input className="form-control-custom" placeholder="e.g. ROYAL20" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-custom">Discount Type</label>
                    <select className="form-control-custom" value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Discount Value</label>
                    <input type="number" className="form-control-custom" placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'} value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-custom">Min Booking (₹)</label>
                    <input type="number" className="form-control-custom" placeholder="0" value={form.minBookingAmount} onChange={e => setForm(p => ({ ...p, minBookingAmount: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Max Discount (₹)</label>
                    <input type="number" className="form-control-custom" placeholder="No limit" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-custom">Usage Limit</label>
                    <input type="number" className="form-control-custom" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Expiry Date</label>
                    <input type="date" className="form-control-custom" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-outline-orange" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-orange" disabled={submitting}>{submitting ? 'Creating...' : 'Create Coupon'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
