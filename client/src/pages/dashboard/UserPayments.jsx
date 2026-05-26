import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiCheck, FiX } from 'react-icons/fi';
import api from '../../services/api.js';
import './dashboard.css';

export default function UserPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/my').then(({ data }) => { setPayments(data.payments); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const totalSpent = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Payment <span className="orange-text">History</span></h1>
          <p>All your transaction records</p>
        </div>
        <div className="total-spent-badge">
          <FiCreditCard /> Total Spent: <strong>₹{totalSpent.toLocaleString()}</strong>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="empty-state glass-card">
          <p style={{ fontSize: 40 }}>💳</p>
          <h4>No payment history</h4>
        </div>
      ) : (
        <div className="payments-table glass-card">
          <table>
            <thead>
              <tr>
                <th>Car</th>
                <th>Order ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={p.booking?.car?.images?.[0]} alt="" style={{ width: 50, height: 34, borderRadius: 6, objectFit: 'cover' }} />
                      <span>{p.booking?.car?.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{p.razorpayOrderId?.slice(-12)}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--orange)', fontWeight: 700 }}>₹{p.amount?.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.method || 'Razorpay'}</td>
                  <td>
                    <span className={`status-badge status-${p.status}`}>{p.status}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
