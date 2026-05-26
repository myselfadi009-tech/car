import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api.js';
import CarCard from '../../components/cards/CarCard.jsx';
import './dashboard.css';

export default function UserWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/wishlist').then(({ data }) => { setWishlist(data.wishlist); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>My <span className="orange-text">Wishlist</span></h1>
          <p>{wishlist.length} saved cars</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 360, borderRadius: 16 }} />)}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="empty-state glass-card">
          <p style={{ fontSize: 40 }}>❤️</p>
          <h4>No saved cars</h4>
          <p>Browse our fleet and save your favorites</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {wishlist.map((car, i) => <CarCard key={car._id} car={car} index={i} />)}
        </div>
      )}
    </div>
  );
}
