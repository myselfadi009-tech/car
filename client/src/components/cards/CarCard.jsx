import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiStar, FiUsers, FiZap } from 'react-icons/fi';
import { MdLocalGasStation } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import { useState } from 'react';
import './carcard.css';

export default function CarCard({ car, index = 0 }) {
  const { user } = useSelector(s => s.auth);
  const [wishlisted, setWishlisted] = useState(user?.wishlist?.includes(car._id));
  const [loading, setLoading] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to save cars'); return; }
    setLoading(true);
    try {
      const { data } = await api.post(`/users/wishlist/${car._id}`);
      setWishlisted(data.wishlist.includes(car._id));
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Something went wrong'); }
    setLoading(false);
  };

  return (
    <motion.div
      className="car-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6 }}>
      <div className="car-card-image">
        <img src={car.images?.[0] || 'https://via.placeholder.com/400x250/121212/FF8A00?text=RoyalRent'} alt={car.name} loading="lazy" />
        <div className="car-card-overlay" />
        <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlist} disabled={loading}>
          <FiHeart size={16} />
        </button>
        <div className="car-availability">
          <span className={`availability-dot ${car.availability === 'Available' ? 'available' : 'booked'}`} />
          {car.availability}
        </div>
        {car.category && <div className="car-category">{car.category}</div>}
      </div>

      <div className="car-card-body">
        <div className="car-card-header">
          <div>
            <p className="car-brand">{car.brand}</p>
            <h3 className="car-name">{car.name}</h3>
          </div>
          <div className="car-rating">
            <FiStar fill="#FFB800" color="#FFB800" size={14} />
            <span>{Number(car.rating || 0).toFixed(1)}</span>
          </div>
        </div>

        <div className="car-specs">
          <div className="spec-item"><MdLocalGasStation size={15} />{car.fuelType}</div>
          <div className="spec-item"><FiUsers size={15} />{car.seats} Seats</div>
          <div className="spec-item"><FiZap size={15} />{car.transmission}</div>
        </div>

        <div className="car-card-footer">
          <div className="car-price">
            <span className="price-amount">₹{car.pricePerDay?.toLocaleString()}</span>
            <span className="price-unit">/day</span>
          </div>
          <Link to={car.availability === 'Available' ? `/cars/${car._id}` : '#'} className="btn-orange" style={{ padding: '10px 20px', fontSize: '13px' }}>
            {car.availability === 'Available' ? 'Book Now' : 'View Details'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
