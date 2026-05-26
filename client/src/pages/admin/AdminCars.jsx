import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUpload } from 'react-icons/fi';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import './admin.css';

const INIT_FORM = { name: '', brand: '', model: '', year: new Date().getFullYear(), pricePerDay: '', fuelType: 'Petrol', transmission: 'Auto', seats: 5, category: 'Luxury', description: '', features: '', availability: 'Available', location: 'Mumbai, India' };

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCars = async () => {
    try {
      const { data } = await api.get('/cars', { params: { limit: 100 } });
      setCars(data.cars);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCars(); }, []);

  const openAdd = () => { setEditCar(null); setForm(INIT_FORM); setImages([]); setImageFiles([]); setShowModal(true); };
  const openEdit = (car) => {
    setEditCar(car);
    setForm({ name: car.name, brand: car.brand, model: car.model, year: car.year || new Date().getFullYear(), pricePerDay: car.pricePerDay, fuelType: car.fuelType, transmission: car.transmission, seats: car.seats, category: car.category, description: car.description || '', features: car.features?.join(', ') || '', availability: car.availability, location: car.location || '' });
    setImages(car.images || []);
    setImageFiles([]);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImages(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      imageFiles.forEach(f => fd.append('images', f));
      if (editCar) {
        const { data } = await api.put(`/cars/${editCar._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setCars(prev => prev.map(c => c._id === editCar._id ? data.car : c));
        toast.success('Car updated!');
      } else {
        const { data } = await api.post('/cars', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setCars(prev => [data.car, ...prev]);
        toast.success('Car added!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this car?')) return;
    try {
      await api.delete(`/cars/${id}`);
      setCars(prev => prev.filter(c => c._id !== id));
      toast.success('Car deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = cars.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Manage <span className="orange-text">Cars</span></h1>
          <p>{cars.length} total cars in fleet</p>
        </div>
        <button className="btn-orange" onClick={openAdd}><FiPlus /> Add New Car</button>
      </div>

      <div className="admin-search-bar">
        <FiSearch size={16} />
        <input placeholder="Search cars..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')}><FiX /></button>}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
      ) : (
        <div className="admin-table glass-card">
          <table>
            <thead>
              <tr>
                <th>Car</th>
                <th>Brand</th>
                <th>Price/Day</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((car, i) => (
                <motion.tr key={car._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={car.images?.[0] || 'https://via.placeholder.com/60x40/121212/FF8A00?text=Car'} alt={car.name} style={{ width: 70, height: 46, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-white)', fontSize: 14 }}>{car.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>{car.model} · {car.year}</p>
                      </div>
                    </div>
                  </td>
                  <td>{car.brand}</td>
                  <td style={{ color: 'var(--orange)', fontWeight: 700 }}>₹{car.pricePerDay?.toLocaleString()}</td>
                  <td><span className="category-badge">{car.category}</span></td>
                  <td><span className={`status-badge ${car.availability === 'Available' ? 'status-confirmed' : 'status-pending'}`}>{car.availability}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="action-btn edit" onClick={() => openEdit(car)}><FiEdit2 size={14} /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(car._id)}><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>No cars found</p>}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="modal-header">
                <h3>{editCar ? 'Edit Car' : 'Add New Car'}</h3>
                <button onClick={() => setShowModal(false)}><FiX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  {[['name','Car Name','text'],['brand','Brand','text'],['model','Model','text'],['year','Year','number']].map(([k,l,t]) => (
                    <div className="form-group" key={k}>
                      <label className="form-label-custom">{l}</label>
                      <input type={t} className="form-control-custom" placeholder={l} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} required={k !== 'year'} />
                    </div>
                  ))}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-custom">Price Per Day (₹)</label>
                    <input type="number" className="form-control-custom" placeholder="e.g. 5000" value={form.pricePerDay} onChange={e => setForm(p => ({ ...p, pricePerDay: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Fuel Type</label>
                    <select className="form-control-custom" value={form.fuelType} onChange={e => setForm(p => ({ ...p, fuelType: e.target.value }))}>
                      {['Petrol','Diesel','Electric','Hybrid'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Transmission</label>
                    <select className="form-control-custom" value={form.transmission} onChange={e => setForm(p => ({ ...p, transmission: e.target.value }))}>
                      {['Auto','Manual'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Seats</label>
                    <select className="form-control-custom" value={form.seats} onChange={e => setForm(p => ({ ...p, seats: e.target.value }))}>
                      {[2,4,5,6,7,8].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-custom">Category</label>
                    <select className="form-control-custom" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {['Luxury','Sports','SUV','Sedan','Electric','Convertible'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Availability</label>
                    <select className="form-control-custom" value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))}>
                      {['Available','Unavailable','Booked'].map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Location</label>
                    <input className="form-control-custom" placeholder="City, State" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label-custom">Features (comma separated)</label>
                  <input className="form-control-custom" placeholder="GPS, Bluetooth, Sunroof, etc." value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label-custom">Description</label>
                  <textarea className="form-control-custom" rows={3} placeholder="Car description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label-custom">Car Images</label>
                  <label className="image-upload-zone">
                    <FiUpload size={24} />
                    <span>Click to upload images</span>
                    <span style={{ fontSize: 12 }}>PNG, JPG, WebP (max 5MB each)</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                  {images.length > 0 && (
                    <div className="image-preview-grid">
                      {images.map((img, i) => <img key={i} src={img} alt="" className="preview-img" />)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-outline-orange" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-orange" disabled={submitting}>
                    {submitting ? 'Saving...' : editCar ? 'Update Car' : 'Add Car'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
