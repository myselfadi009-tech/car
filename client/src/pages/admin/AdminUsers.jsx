import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiShield, FiShieldOff } from 'react-icons/fi';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import './admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => { setUsers(data.users); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggleBlock = async (id) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/block`);
      setUsers(prev => prev.map(u => u._id === id ? data.user : u));
      toast.success(data.message);
    } catch { toast.error('Action failed'); }
  };

  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Customer <span className="orange-text">Management</span></h1>
          <p>{users.length} registered customers</p>
        </div>
      </div>

      <div className="admin-search-bar">
        <FiSearch size={16} />
        <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')}><FiX /></button>}
      </div>

      {loading ? <div className="skeleton" style={{ height: 400, borderRadius: 16 }} /> : (
        <div className="admin-table glass-card">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Auth Type</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="table-avatar">
                        {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.name?.[0]}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-white)', fontSize: 14 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                  <td>
                    <span className={`status-badge ${u.isGoogleAuth ? 'status-confirmed' : 'status-active'}`}>
                      {u.isGoogleAuth ? '🔵 Google' : '📧 Email'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><span className={`status-badge ${u.isBlocked ? 'status-cancelled' : 'status-confirmed'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</span></td>
                  <td>
                    <button className={`action-btn ${u.isBlocked ? 'edit' : 'delete'}`} onClick={() => toggleBlock(u._id)} title={u.isBlocked ? 'Unblock' : 'Block'}>
                      {u.isBlocked ? <FiShield size={14} /> : <FiShieldOff size={14} />}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>No users found</p>}
        </div>
      )}
    </div>
  );
}
