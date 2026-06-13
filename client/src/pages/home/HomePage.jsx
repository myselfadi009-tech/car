import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiStar, FiMapPin, FiPhone, FiMail, FiSend,
  FiShield, FiClock, FiAward, FiHeadphones,
} from 'react-icons/fi';
import { MdLocalGasStation, MdSpeed } from 'react-icons/md';
import { BsPersonFill, BsFillLightningFill } from 'react-icons/bs';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import heroImg from '@assets/hero_1779723381405.png';
import logoImg from '@assets/logo.png';
import './home.css';

const trendingCars = [
  { id: 1, name: 'Huracán EVO', brand: 'Lamborghini', price: 45000, fuel: 'Petrol', transmission: 'Automatic', rating: 4.9, desc: 'Iconic Italian supercar with raw power and breathtaking design.', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80', category: 'Supercar' },
  { id: 2, name: 'SF90 Stradale', brand: 'Ferrari', price: 52000, fuel: 'Hybrid', transmission: 'Automatic', rating: 5.0, desc: 'The most powerful Ferrari ever built — pure exhilaration.', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600&q=80', category: 'Supercar' },
  { id: 3, name: '911 Turbo S', brand: 'Porsche', price: 32000, fuel: 'Petrol', transmission: 'Automatic', rating: 4.8, desc: 'Legendary performance meets everyday elegance in this icon.', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80', category: 'Sports' },
  { id: 4, name: 'M8 Competition', brand: 'BMW', price: 22000, fuel: 'Petrol', transmission: 'Automatic', rating: 4.7, desc: 'Ultimate driving machine — refined power in pure luxury.', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80', category: 'Luxury' },
  { id: 5, name: 'RS7 Sportback', brand: 'Audi', price: 19000, fuel: 'Petrol', transmission: 'Automatic', rating: 4.6, desc: 'Quattro performance meets avant-garde German design.', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80', category: 'Luxury' },
  { id: 6, name: 'AMG GT 63 S', brand: 'Mercedes', price: 28000, fuel: 'Petrol', transmission: 'Automatic', rating: 4.8, desc: 'Where luxury meets ferocious AMG performance.', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80', category: 'Luxury' },
];

const reviews = [
  { name: 'James Carter', role: 'Business Executive', rating: 5, comment: 'RoyalRent elevated my entire trip. The Lamborghini was immaculate and the service was truly world class.', avatar: 'J' },
  { name: 'Sofia Martinez', role: 'Travel Blogger', rating: 5, comment: 'I have used many rental services but nothing compares to RoyalRent. Seamless booking, stunning cars.', avatar: 'S' },
  { name: 'David Kim', role: 'Entrepreneur', rating: 5, comment: 'Drove the Ferrari SF90 for my anniversary weekend. Absolutely unforgettable experience!', avatar: 'D' },
  { name: 'Emily Walsh', role: 'Luxury Traveler', rating: 5, comment: 'Every detail was perfect. The car was spotless and delivery was right on time. 10/10.', avatar: 'E' },
];

const stats = [
  { value: 12500, label: 'Happy Customers', suffix: '+', icon: '😊' },
  { value: 250, label: 'Cars Available', suffix: '+', icon: '🚗' },
  { value: 48000, label: 'Total Trips', suffix: '+', icon: '🗺️' },
  { value: 99, label: 'Positive Reviews', suffix: '%', icon: '⭐' },
];

const features = [
  { icon: FiShield, title: 'Fully Insured', desc: 'Every car comes with comprehensive insurance coverage for your peace of mind.', color: '#7c6ef0' },
  { icon: FiClock, title: '24/7 Support', desc: 'Our team is always available around the clock to assist you on your journey.', color: '#00c864' },
  { icon: FiAward, title: 'Premium Fleet', desc: 'Hand-picked luxury and exotic cars maintained to the highest standards.', color: '#FF8A00' },
  { icon: FiHeadphones, title: 'Concierge Service', desc: 'White-glove delivery and pickup at your location across all cities.', color: '#ff6b9d' },
];

const HOW_STEPS = [
  { step: '01', title: 'Browse Fleet', desc: 'Explore our exclusive collection of 250+ luxury cars across all categories.', icon: '🔍' },
  { step: '02', title: 'Pick Dates', desc: 'Choose your pickup date, return date, and preferred location.', icon: '📅' },
  { step: '03', title: 'Book Instantly', desc: 'Confirm your booking with secure online payment or cash on pickup.', icon: '✅' },
  { step: '04', title: 'Drive Away', desc: 'Your car is delivered to you. Just turn the key and drive your dream.', icon: '🚀' },
];

const BRANDS_MARQUEE = ['Lamborghini', 'Ferrari', 'Porsche', 'BMW', 'Mercedes', 'Audi', 'Rolls-Royce', 'Bentley', 'Maserati', 'Aston Martin'];
const HERO_WORDS = ['Dream Car.', 'Luxury Ride.', 'Royal Journey.', 'Ultimate Drive.'];

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (2000 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function TypewriterText({ words }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[index];
    if (!deleting && displayed.length < word.length) {
      const t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === word.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIndex((index + 1) % words.length);
    }
  }, [displayed, deleting, index, words]);
  return (
    <span className="typewriter-text">
      {displayed}<span className="typewriter-cursor">|</span>
    </span>
  );
}

function ThunderEffect() {
  const [flash, setFlash] = useState(false);
  const [bolt, setBolt] = useState(null);

  useEffect(() => {
    let cancelled = false;
    function scheduleBolt() {
      const delay = 3500 + Math.random() * 6000;
      setTimeout(() => {
        if (cancelled) return;
        const x = 15 + Math.random() * 70;
        const height = 120 + Math.random() * 160;
        setBolt({ x, height, key: Date.now() });
        setFlash(true);
        setTimeout(() => { if (!cancelled) setFlash(false); }, 130);
        setTimeout(() => {
          if (!cancelled) {
            setFlash(true);
            setTimeout(() => { if (!cancelled) { setFlash(false); setBolt(null); } }, 90);
          }
        }, 230);
        setTimeout(scheduleBolt, 200);
      }, delay);
    }
    scheduleBolt();
    return () => { cancelled = true; };
  }, []);

  const midX = 20;
  const zigzag = (h) => {
    const pts = [[midX, 0]];
    let y = 0;
    while (y < h) {
      y += 18 + Math.random() * 16;
      const x = midX + (Math.random() - 0.5) * 28;
      pts.push([x, Math.min(y, h)]);
    }
    return pts.map(p => p.join(',')).join(' ');
  };

  return (
    <>
      {flash && <div className="thunder-flash" />}
      {bolt && (
        <div
          key={bolt.key}
          className="thunder-bolt-wrap"
          style={{ left: `${bolt.x}%` }}
        >
          <svg
            className="thunder-bolt"
            width="40"
            height={bolt.height}
            viewBox={`0 0 40 ${bolt.height}`}
            fill="none"
          >
            <polyline
              points={zigzag(bolt.height)}
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={zigzag(bolt.height)}
              stroke="#FFE066"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
          </svg>
        </div>
      )}
    </>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function HomePage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [activeReview, setActiveReview] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveReview(p => (p + 1) % reviews.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! We will get back to you shortly.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section className="rr-hero">
        <div className="rr-hero-bg">
          <img src={heroImg} alt="Luxury Supercar" className="rr-hero-car-img" />
          <div className="rr-hero-overlay" />
        </div>

        {/* Thunder lightning effect */}
        <ThunderEffect />

        <div className="rr-hero-center">
          <motion.div
            className="rr-hero-pill-card"
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Brand label */}
            <motion.div
              className="hero-pill-brand"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <img src={logoImg} alt="RoyalRent" className="hero-pill-logo" />
              <span>ROYALRENT</span>
            </motion.div>

            <motion.h1
              className="rr-hero-pill-title"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.6 }}
            >
              Next-gen fleet.<br />
              <span className="orange-text">Instant drive.</span>
            </motion.h1>

            <motion.p
              className="rr-hero-pill-sub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.6 }}
            >
              Rent Your Dream Car. Transparent pricing.<br />Book in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
            >
              <Link to="/cars" className="btn-orange rr-hero-pill-btn">
                See Fleet <FiArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="rr-hero-scroll-indicator">
          <div className="rr-scroll-mouse">
            <div className="rr-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ── BRANDS MARQUEE ── */}
      <div className="brands-marquee-wrap">
        <div className="brands-marquee">
          {[...BRANDS_MARQUEE, ...BRANDS_MARQUEE].map((b, i) => (
            <span key={i} className="brands-marquee-item">{b}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES / WHY US ── */}
      <section className="rr-section rr-features-section">
        <div className="container-custom">
          <motion.div className="rr-section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="badge-orange">✦ Why Choose Us</div>
            <h2 className="section-title" style={{ marginTop: 14 }}>
              The <span className="orange-text">Royal</span> Difference
            </h2>
            <p className="section-subtitle">What makes RoyalRent the premier choice for luxury rentals</p>
          </motion.div>

          <motion.div className="rr-features-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {features.map((f, i) => (
              <motion.div key={i} className="rr-feature-card glass-card" variants={fadeUp}
                whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.25 } }}>
                <div className="rr-feature-icon" style={{ background: `${f.color}18`, color: f.color, boxShadow: `0 0 24px ${f.color}22` }}>
                  <f.icon size={26} />
                </div>
                <h3 className="rr-feature-title">{f.title}</h3>
                <p className="rr-feature-desc">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="rr-section rr-how-section">
        <div className="rr-how-glow" />
        <div className="container-custom">
          <motion.div className="rr-section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="badge-orange">🚀 Process</div>
            <h2 className="section-title" style={{ marginTop: 14 }}>
              How It <span className="orange-text">Works</span>
            </h2>
            <p className="section-subtitle">Get behind the wheel of your dream car in 4 simple steps</p>
          </motion.div>

          <div className="rr-how-grid">
            {HOW_STEPS.map((s, i) => (
              <motion.div key={i} className="rr-how-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -8, transition: { duration: 0.22 } }}
              >
                <div className="rr-how-step-num">{s.step}</div>
                <div className="rr-how-icon">{s.icon}</div>
                <h3 className="rr-how-title">{s.title}</h3>
                <p className="rr-how-desc">{s.desc}</p>
                {i < HOW_STEPS.length - 1 && <div className="rr-how-connector" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING CARS ── */}
      <section className="rr-section rr-trending">
        <div className="container-custom">
          <motion.div className="rr-section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="badge-orange">🏎 Hot This Week</div>
            <h2 className="section-title" style={{ marginTop: 14 }}>
              Trending <span className="orange-text">Cars</span>
            </h2>
            <p className="section-subtitle">The most sought-after supercars in our exclusive fleet</p>
          </motion.div>

          <motion.div className="rr-cars-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            {trendingCars.map((car) => (
              <motion.div key={car.id} className="rr-car-card" variants={fadeUp}
                whileHover={{ y: -10, transition: { duration: 0.25 } }}>
                <div className="rr-car-img-wrap">
                  <img src={car.image} alt={car.name} className="rr-car-img" loading="lazy" />
                  <div className="rr-car-img-overlay" />
                  <div className="rr-car-category">{car.category}</div>
                  <div className="rr-car-rating-badge">
                    <FiStar fill="#FFB800" color="#FFB800" size={12} />
                    <span>{car.rating}</span>
                  </div>
                </div>
                <div className="rr-car-body">
                  <div className="rr-car-brand">{car.brand}</div>
                  <h3 className="rr-car-name">{car.name}</h3>
                  <p className="rr-car-desc">{car.desc}</p>
                  <div className="rr-car-specs">
                    <span><MdLocalGasStation size={14} /> {car.fuel}</span>
                    <span><MdSpeed size={14} /> {car.transmission}</span>
                    <span><BsFillLightningFill size={13} /> Sport</span>
                  </div>
                  <div className="rr-car-footer">
                    <div className="rr-car-price">
                      <span className="rr-price-amount">₹{car.price.toLocaleString()}</span>
                      <span className="rr-price-unit">/day</span>
                    </div>
                    <Link to="/cars" className="btn-orange" style={{ padding: '9px 18px', fontSize: '13px' }}>
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="rr-explore-btn-wrap" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Link to="/cars" className="btn-orange rr-explore-btn">
              Explore All Cars <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── STATS COUNTERS ── */}
      <section className="rr-stats-section">
        <div className="rr-stats-glow" />
        <div className="container-custom">
          <div className="rr-stats-grid">
            {stats.map((s) => (
              <motion.div key={s.label} className="rr-stat-item"
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, type: 'spring' }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <div className="rr-stat-emoji">{s.icon}</div>
                <div className="rr-stat-value">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="rr-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ── */}
      <section className="rr-section rr-reviews-section">
        <div className="container-custom">
          <motion.div className="rr-section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="badge-orange">💬 Testimonials</div>
            <h2 className="section-title" style={{ marginTop: 14 }}>
              What Our <span className="orange-text">Customers Say</span>
            </h2>
            <p className="section-subtitle">Real stories from real luxury drivers</p>
          </motion.div>

          <motion.div className="rr-reviews-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
            {reviews.map((r, idx) => (
              <motion.div key={r.name} className="rr-review-card glass-card" variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}>
                <div className="rr-review-stars">
                  {[...Array(r.rating)].map((_, j) => (
                    <FiStar key={j} fill="#FFB800" color="#FFB800" size={14} />
                  ))}
                </div>
                <p className="rr-review-text">"{r.comment}"</p>
                <div className="rr-review-author">
                  <div className="rr-review-avatar">{r.avatar}</div>
                  <div>
                    <p className="rr-review-name">{r.name}</p>
                    <p className="rr-review-role">{r.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="rr-cta-section">
        <div className="rr-cta-glow" />
        <div className="container-custom">
          <motion.div className="rr-cta-card glass-card"
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="rr-cta-icon">🏎</div>
            <h2 className="rr-cta-title">Ready to Drive Your <span className="orange-text">Dream?</span></h2>
            <p className="rr-cta-sub">Join thousands of satisfied customers who trust RoyalRent for their luxury driving experience.</p>
            <div className="rr-cta-btns">
              <Link to="/cars" className="btn-orange" style={{ fontSize: 15, padding: '14px 36px' }}>
                Browse Cars <FiArrowRight />
              </Link>
              <Link to="/register" className="rr-hero-btn-ghost">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="rr-section rr-contact-section">
        <div className="rr-contact-glow" />
        <div className="container-custom">
          <motion.div className="rr-section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="badge-orange">📞 Get In Touch</div>
            <h2 className="section-title" style={{ marginTop: 14 }}>
              Contact <span className="orange-text">Us</span>
            </h2>
            <p className="section-subtitle">We are available 24/7 for your luxury rental needs</p>
          </motion.div>

          <div className="rr-contact-grid">
            <motion.div className="rr-contact-info glass-card"
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h3 className="rr-contact-info-title">Get In Touch</h3>
              <p className="rr-contact-info-sub">Reach out to us and our team will respond within 1 hour.</p>
              <div className="rr-contact-details">
                {[
                  { icon: FiMapPin, label: 'Address', value: '123 Luxury Lane, Mumbai, India 400001' },
                  { icon: FiPhone, label: 'Phone', value: '+91 98765 43210' },
                  { icon: FiMail, label: 'Email', value: 'contact@royalrent.com' },
                ].map(({ icon: Icon, label, value }) => (
                  <motion.div key={label} className="rr-contact-detail-item"
                    whileHover={{ x: 6, transition: { duration: 0.2 } }}>
                    <div className="rr-contact-icon"><Icon /></div>
                    <div>
                      <p className="rr-detail-label">{label}</p>
                      <p className="rr-detail-value">{value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="rr-contact-socials">
                {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                  <motion.a key={i} href="#" className="rr-social-link"
                    whileHover={{ y: -4, scale: 1.12, transition: { duration: 0.18 } }}>
                    <Icon />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div className="rr-contact-form-wrap glass-card"
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h3 className="rr-contact-info-title">Send a Message</h3>
              <form onSubmit={handleSubmit} className="rr-form">
                {[
                  { label: 'Your Name', type: 'text', placeholder: 'John Doe', key: 'name', icon: BsPersonFill },
                  { label: 'Email Address', type: 'email', placeholder: 'john@example.com', key: 'email', icon: FiMail },
                ].map(({ label, type, placeholder, key, icon: Icon }) => (
                  <div className="rr-form-group" key={key}>
                    <label className="form-label-custom"><Icon size={13} /> {label}</label>
                    <input type={type} className="form-control-custom" placeholder={placeholder}
                      value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
                  </div>
                ))}
                <div className="rr-form-group">
                  <label className="form-label-custom">Message</label>
                  <textarea className="form-control-custom" placeholder="Tell us about your rental needs..."
                    rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    required style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn-orange rr-submit-btn">
                  Send Message <FiSend />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
