import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave } from 'react-icons/fi';
import api from '../../services/api.js';
import { setUser } from '../../redux/slices/authSlice.js';
import toast from 'react-hot-toast';
import './dashboard.css';

export default function UserProfile() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('address', form.address);
      if (avatarFile) formData.append('avatar', avatarFile);
      const { data } = await api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch(setUser(data.user));
      toast.success('Profile updated successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    setLoading(false);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>My <span className="orange-text">Profile</span></h1>
          <p>Manage your personal information</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        <motion.div className="profile-avatar-card glass-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="avatar-container">
            <div className="profile-avatar-img">
              {(avatarPreview || user?.avatar) ? (
                <img src={avatarPreview || user.avatar} alt={user?.name} />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <label className="avatar-upload-btn">
              <FiCamera />
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </label>
          </div>
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <div className="profile-badge">
            {user?.role === 'admin' ? '👑 Administrator' : '👤 Member'}
          </div>
          {user?.isGoogleAuth && <div className="google-badge">🔵 Google Account</div>}
        </motion.div>

        <motion.div className="glass-card" style={{ padding: 28 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3 style={{ color: 'var(--text-white)', marginBottom: 24, fontSize: 18, fontWeight: 600 }}>Personal Information</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { name: 'name', label: 'Full Name', icon: FiUser, placeholder: 'Your full name' },
                { name: 'phone', label: 'Phone Number', icon: FiPhone, placeholder: '+91 9876543210' },
              ].map(({ name, label, icon: Icon, placeholder }) => (
                <div className="form-group" key={name}>
                  <label className="form-label-custom"><Icon size={12} style={{ marginRight: 4 }} />{label}</label>
                  <input className="form-control-custom" placeholder={placeholder} value={form[name]}
                    onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label-custom"><FiMail size={12} style={{ marginRight: 4 }} />Email Address</label>
              <input className="form-control-custom" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Email cannot be changed</p>
            </div>
            <div className="form-group">
              <label className="form-label-custom"><FiMapPin size={12} style={{ marginRight: 4 }} />Address</label>
              <textarea className="form-control-custom" rows={3} placeholder="Your address" value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn-orange" disabled={loading}>
              {loading ? 'Saving...' : <><FiSave /> Save Changes</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
