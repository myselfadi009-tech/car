import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdDirectionsCar, MdBookOnline, MdPeople, MdAttachMoney } from 'react-icons/md';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api.js';
import './admin.css';

const COLORS = ['#FF8A00', '#00c864', '#6495ed', '#ff4444'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="admin-page">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
      </div>
    </div>
  );

  const stats = [
    { icon: MdDirectionsCar, label: 'Total Cars', value: data?.stats?.totalCars || 0, color: '#FF8A00' },
    { icon: MdBookOnline, label: 'Total Bookings', value: data?.stats?.totalBookings || 0, color: '#6495ed' },
    { icon: MdPeople, label: 'Total Customers', value: data?.stats?.totalUsers || 0, color: '#00c864' },
    { icon: MdAttachMoney, label: 'Total Revenue', value: `₹${(data?.stats?.totalRevenue || 0).toLocaleString()}`, color: '#FF8A00' },
  ];

  const bookingStatusData = data?.bookingStats?.map(s => ({ name: s._id, value: s.count })) || [];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Dashboard <span className="orange-text">Overview</span></h1>
          <p>Welcome back, Admin! Here's what's happening</p>
        </div>
        <div className="admin-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="admin-stats-grid">
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} className="admin-stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="admin-stat-icon" style={{ background: `${color}20`, color }}>
              <Icon size={26} />
            </div>
            <div>
              <p className="admin-stat-value">{value}</p>
              <p className="admin-stat-label">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="admin-charts-row">
        <div className="chart-card glass-card">
          <h3>Revenue Analytics (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#A7A7A7" fontSize={12} />
              <YAxis stroke="#A7A7A7" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#121212', border: '1px solid rgba(255,138,0,0.3)', borderRadius: 10, color: '#fff' }}
                formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#FF8A00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass-card">
          <h3>Booking Status</h3>
          {bookingStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {bookingStatusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#121212', border: '1px solid rgba(255,138,0,0.3)', borderRadius: 10, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No booking data</div>
          )}
          <div className="pie-legend">
            {bookingStatusData.map((item, i) => (
              <div key={item.name} className="legend-item">
                <span style={{ background: COLORS[i % COLORS.length] }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-table glass-card">
        <h3>Recent Bookings</h3>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Car</th>
              <th>Dates</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentBookings || []).slice(0, 10).map(b => (
              <tr key={b._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="table-avatar">{b.user?.name?.[0]}</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-white)' }}>{b.user?.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>{b.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={b.car?.images?.[0]} alt="" style={{ width: 50, height: 34, borderRadius: 6, objectFit: 'cover' }} />
                    <span>{b.car?.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {new Date(b.pickupDate).toLocaleDateString()}<br/>→ {new Date(b.returnDate).toLocaleDateString()}
                </td>
                <td style={{ color: 'var(--orange)', fontWeight: 700 }}>₹{b.totalAmount?.toLocaleString()}</td>
                <td><span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.recentBookings?.length && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No bookings yet</p>
        )}
      </div>
    </div>
  );
}
