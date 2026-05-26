import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiStar, FiUsers, FiZap, FiHeart, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { MdLocalGasStation, MdSpeed } from 'react-icons/md';
import { fetchCarById } from '../../redux/slices/carSlice.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import './cardetail.css';

export default function CarDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCar: car, loading } = useSelector(s => s.cars);
  const { user } = useSelector(s => s.auth);
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCarById(id));
    fetchReviews();
  }, [id, dispatch]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${id}`);
      setReviews(data.reviews);
    } catch {}
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { carId: id, ...reviewForm });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
    setSubmitting(false);
  };

  if (loading || !car) {
    return (
      <div className="container-custom" style={{ paddingTop: 120 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="car-detail-page">
      <div className="container-custom">
        <Link to="/cars" className="back-link"><FiArrowLeft /> Back to Cars</Link>

        <div className="car-detail-grid">
          <motion.div className="car-gallery" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}>
            <div className="main-image">
              <img src={car.images?.[activeImg] || 'https://via.placeholder.com/800x500/121212/FF8A00?text=RoyalRent'} alt={car.name} />
              <div className="availability-badge">
                <span className={`availability-dot ${car.availability === 'Available' ? 'available' : 'booked'}`} />
                {car.availability}
              </div>
            </div>
            {car.images?.length > 1 && (
              <div className="image-thumbnails">
                {car.images.map((img, i) => (
                  <button key={i} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div className="car-info" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
            <div className="car-info-header">
              <div>
                <p className="car-brand-badge">{car.brand}</p>
                <h1 className="car-detail-name">{car.name}</h1>
                <p className="car-detail-model">{car.model} · {car.year}</p>
              </div>
              <div className="car-rating-box">
                <FiStar fill="#FFB800" color="#FFB800" size={18} />
                <span>{Number(car.rating || 0).toFixed(1)}</span>
                <span className="rating-count">({car.totalReviews} reviews)</span>
              </div>
            </div>

            <div className="car-price-section">
              <div className="car-price-big">
                <span>₹{car.pricePerDay?.toLocaleString()}</span>
                <span className="per-day">/day</span>
              </div>
            </div>

            <div className="car-specs-grid">
              {[
                { icon: MdLocalGasStation, label: 'Fuel', value: car.fuelType },
                { icon: FiZap, label: 'Trans.', value: car.transmission },
                { icon: FiUsers, label: 'Seats', value: `${car.seats} Seats` },
                { icon: MdSpeed, label: 'Category', value: car.category },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="spec-box">
                  <Icon size={20} className="spec-icon" />
                  <p className="spec-label">{label}</p>
                  <p className="spec-value">{value}</p>
                </div>
              ))}
            </div>

            {car.features?.length > 0 && (
              <div className="car-features">
                <h4>Features</h4>
                <div className="features-list">
                  {car.features.map(f => <span key={f} className="feature-tag">✓ {f}</span>)}
                </div>
              </div>
            )}

            {car.description && (
              <div className="car-description">
                <h4>Description</h4>
                <p>{car.description}</p>
              </div>
            )}

            <div className="car-detail-actions">
              {car.availability === 'Available' ? (
                <Link to={user ? `/booking/${car._id}` : '/login'} className="btn-orange" style={{ flex: 1, textAlign: 'center', fontSize: '15px', padding: '14px' }}>
                  <FiCalendar /> Book This Car
                </Link>
              ) : (
                <button className="btn-orange" disabled style={{ flex: 1, opacity: 0.5 }}>
                  Not Available
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <h2>Customer Reviews <span className="orange-text">({reviews.length})</span></h2>

          {user && (
            <form className="review-form glass-card" onSubmit={submitReview}>
              <h4>Write a Review</h4>
              <div className="rating-input">
                <label>Your Rating</label>
                <div className="star-selector">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: n }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24 }}>
                      <FiStar fill={n <= reviewForm.rating ? '#FFB800' : 'none'} color="#FFB800" />
                    </button>
                  ))}
                </div>
              </div>
              <textarea className="form-control-custom" rows={3} placeholder="Share your experience..."
                value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} />
              <button type="submit" className="btn-orange" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review._id} className="review-card glass-card">
                <div className="review-header">
                  <div className="review-author">
                    <div className="review-avatar">
                      {review.user.avatar ? <img src={review.user.avatar} alt="" /> : review.user.name?.[0]}
                    </div>
                    <div>
                      <p className="review-name">{review.user.name}</p>
                      <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="review-stars">
                    {[...Array(review.rating)].map((_, i) => <FiStar key={i} fill="#FFB800" color="#FFB800" size={14} />)}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-secondary-custom" style={{ textAlign: 'center', padding: '40px 0' }}>No reviews yet. Be the first to review!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
