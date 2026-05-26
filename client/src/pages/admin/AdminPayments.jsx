import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api.js';
import './admin.css';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/all').then(({ data }) => { setPayments(data.payments); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Payment <span className="orange-text">Records</span></h1>
          <p>Total Revenue: <strong style={{ color: 'var(--orange)' }}>₹{totalRevenue.toLocaleString()}</strong></p>
        </div>
      </div>

      {loading ? <div className="skeleton" style={{ height: 400, borderRadius: 16 }} /> : (
        <div className="admin-table glass-card">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>{p.razorpayOrderId?.slice(-14)}</td>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-white)', fontSize: 13 }}>{p.user?.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>{p.user?.email}</p>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={p.booking?.car?.images?.[0]} alt="" style={{ width: 50, height: 34, borderRadius: 6, objectFit: 'cover' }} />
                      <span style={{ fontSize: 13 }}>{p.booking?.car?.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 15 }}>₹{p.amount?.toLocaleString()}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.method || 'Razorpay'}</td>
                  <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>No payments yet</p>}
        </div>
      )}
    </div>
  );
}
