import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import './admin.css';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    api.get('/contact').then(({ data }) => { setContacts(data.contacts); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.patch(`/contact/${id}`, { status: 'resolved', adminReply: reply });
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status: 'resolved', adminReply: reply } : c));
      toast.success('Resolved & reply saved');
      setSelected(null);
      setReply('');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Support <span className="orange-text">Tickets</span></h1>
          <p>{contacts.filter(c => c.status === 'open').length} open tickets</p>
        </div>
      </div>

      {loading ? <div className="skeleton" style={{ height: 400, borderRadius: 16 }} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {contacts.map((c, i) => (
            <motion.div key={c._id} className="contact-ticket glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="ticket-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h4>{c.subject}</h4>
                    <span className={`status-badge ${c.status === 'open' ? 'status-pending' : 'status-confirmed'}`}>{c.status}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{c.name} · {c.email} · {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                {c.status === 'open' && (
                  <button className="btn-orange" style={{ fontSize: '12px', padding: '8px 18px' }} onClick={() => { setSelected(c); setReply(c.adminReply || ''); }}>Reply</button>
                )}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '12px 0 0', lineHeight: 1.7 }}>{c.message}</p>
              {c.adminReply && (
                <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(255,138,0,0.08)', borderRadius: 8, borderLeft: '3px solid var(--orange)' }}>
                  <p style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, margin: '0 0 4px' }}>Admin Reply:</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{c.adminReply}</p>
                </div>
              )}
            </motion.div>
          ))}
          {contacts.length === 0 && (
            <div className="empty-state glass-card">
              <p style={{ fontSize: 40 }}>📭</p>
              <h4>No support tickets</h4>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" style={{ maxWidth: 500 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="modal-header">
                <h3>Reply to {selected.name}</h3>
                <button onClick={() => setSelected(null)}><FiX size={20} /></button>
              </div>
              <div style={{ padding: '0 0 16px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.7 }}>{selected.message}</p>
                <label className="form-label-custom">Your Reply</label>
                <textarea className="form-control-custom" rows={5} placeholder="Type your reply..." value={reply}
                  onChange={e => setReply(e.target.value)} style={{ resize: 'vertical', marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="btn-outline-orange" onClick={() => setSelected(null)}>Cancel</button>
                  <button className="btn-orange" onClick={() => handleResolve(selected._id)}>Send & Resolve</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
