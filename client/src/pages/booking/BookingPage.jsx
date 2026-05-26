import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiMapPin, FiTag, FiCheck, FiGift, FiClock, FiUser, FiPhone, FiMail, FiHome, FiAlertCircle, FiEdit3, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { MdQrCode2 } from 'react-icons/md';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api.js';
import { fetchCurrentUser } from '../../redux/slices/authSlice.js';
import toast from 'react-hot-toast';
import './booking.css';

const PAYMENT_METHODS = [
  { id: 'upi_qr', label: 'UPI / QR', icon: <MdQrCode2 size={18} />, desc: 'Scan & Pay instantly' },
  { id: 'cod', label: 'Cash on Pickup', icon: <FiTruck size={18} />, desc: 'Pay cash at pickup' },
  { id: 'demo', label: 'Demo Pay', icon: <FiGift size={18} />, desc: 'Simulate payment (test)' },
];

const UPI_APPS = [
  { name: 'PhonePe', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.png/120px-PhonePe_Logo.png' },
  { name: 'Google Pay', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/120px-Google_Pay_Logo.svg.png' },
  { name: 'Paytm', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/120px-Paytm_Logo_%28standalone%29.svg.png' },
  { name: 'BHIM UPI', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/BHIM_logo.svg/120px-BHIM_logo.svg.png' },
];

export default function BookingPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [payMethod, setPayMethod] = useState('upi_qr');
  const [demoStep, setDemoStep] = useState('idle');
  const [demoCount, setDemoCount] = useState(3);
  const [upiTimer, setUpiTimer] = useState(300);
  const timerRef = useRef(null);

  // Phone update state
  const [phoneEdit, setPhoneEdit] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 3);
  const fmtDate = d => d.toISOString().split('T')[0];

  const [form, setForm] = useState({
    pickupLocation: '',
    returnLocation: '',
    pickupDate: fmtDate(tomorrow),
    returnDate: fmtDate(dayAfter),
  });

  useEffect(() => {
    if (user?.address) setForm(p => ({ ...p, pickupLocation: user.address }));
  }, [user]);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { data } = await api.get(`/cars/${carId}`);
        setCar(data.car);
      } catch { toast.error('Car not found'); navigate('/cars'); }
      setLoading(false);
    };
    fetchCar();
  }, [carId]);

  useEffect(() => {
    if (paymentStep && payMethod === 'upi_qr') {
      setUpiTimer(300);
      timerRef.current = setInterval(() => {
        setUpiTimer(t => {
          if (t <= 1) { clearInterval(timerRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [paymentStep, payMethod]);

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const calcDays = () => {
    const d1 = new Date(form.pickupDate), d2 = new Date(form.returnDate);
    return Math.max(1, Math.ceil((d2 - d1) / 86400000));
  };

  const totalDays = calcDays();
  const subtotal = (car?.pricePerDay || 0) * totalDays;
  const tax = Math.round(subtotal * 0.18);
  const discount = couponData?.discount || 0;
  const total = subtotal + tax - discount;

  const upiString = `upi://pay?pa=royalrent@upi&pn=RoyalRent&am=${total}&cu=INR&tn=CarBooking_${bookingData?.bookingId || 'DEMO'}`;

  const handleSavePhone = async () => {
    if (!phoneInput.trim() || phoneInput.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit phone number'); return;
    }
    setPhoneSaving(true);
    try {
      await api.put('/users/profile', { phone: phoneInput.trim() });
      await dispatch(fetchCurrentUser());
      setPhoneEdit(false);
      toast.success('Mobile number saved!');
    } catch { toast.error('Failed to save phone number'); }
    setPhoneSaving(false);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, amount: subtotal });
      setCouponData(data.coupon);
      toast.success(`Coupon applied! Saved ₹${data.coupon.discount}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); setCouponData(null); }
    setCouponLoading(false);
  };

  const handleBooking = async () => {
    if (!user?.phone) {
      toast.error('Please add your mobile number first');
      setPhoneEdit(true);
      document.getElementById('phone-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (new Date(form.returnDate) <= new Date(form.pickupDate)) {
      toast.error('Return date must be after pickup date'); return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        carId,
        pickupLocation: form.pickupLocation || user?.address || 'To be confirmed',
        returnLocation: form.returnLocation || form.pickupLocation || user?.address || 'To be confirmed',
        pickupDate: form.pickupDate,
        returnDate: form.returnDate,
        couponCode: couponData ? couponCode : undefined,
      });
      setBookingData(data.booking);
      setPaymentStep(true);
      toast.success('Booking created! Choose payment method.');
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
    setSubmitting(false);
  };

  const handleDemoPayment = async () => {
    if (!bookingData || demoStep !== 'idle') return;
    setDemoStep('processing');
    setDemoCount(3);
    const countdown = setInterval(() => {
      setDemoCount(c => { if (c <= 1) { clearInterval(countdown); return 0; } return c - 1; });
    }, 1000);
    setTimeout(async () => {
      try {
        await api.post('/payments/demo-pay', { bookingId: bookingData._id, method: 'demo' });
        setDemoStep('success');
        toast.success('Demo payment successful!');
        setTimeout(() => navigate(`/booking/success/${bookingData._id}`), 1800);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Demo payment failed');
        setDemoStep('idle');
      }
    }, 3200);
  };

  const handleUpiPaid = async () => {
    if (!bookingData) return;
    setSubmitting(true);
    try {
      await api.post('/payments/demo-pay', { bookingId: bookingData._id, method: 'upi_qr' });
      toast.success('UPI Payment confirmed!');
      navigate(`/booking/success/${bookingData._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Confirmation failed'); }
    setSubmitting(false);
  };

  const handleCOD = async () => {
    if (!bookingData) return;
    setSubmitting(true);
    try {
      await api.post('/payments/demo-pay', { bookingId: bookingData._id, method: 'cod' });
      toast.success('Booking confirmed! Pay cash at pickup.');
      navigate(`/booking/success/${bookingData._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to confirm'); }
    setSubmitting(false);
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const hasPhone = user?.phone && user.phone.trim() !== '';

  return (
    <div className="booking-page">
      <div className="booking-hero">
        <div className="container-custom">
          <h1 className="section-title">Complete Your <span className="orange-text">Booking</span></h1>
          <div className="booking-steps">
            {['Details', 'Payment'].map((s, i) => (
              <div key={s} className={`booking-step ${i === (paymentStep ? 1 : 0) ? 'active' : i < (paymentStep ? 1 : 0) ? 'done' : ''}`}>
                <span>{i < (paymentStep ? 1 : 0) ? <FiCheck /> : i + 1}</span>{s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom booking-body">
        <div className="booking-grid">
          <AnimatePresence mode="wait">
            {!paymentStep ? (
              <motion.div key="details" className="booking-form-wrap"
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>

                {/* ── Your Contact Details ── */}
                <div className="form-section glass-card" id="phone-section">
                  <h3><FiUser className="orange-text" /> Your Details</h3>

                  <div className="user-details-grid">
                    {/* Email */}
                    <div className="user-detail-row">
                      <div className="user-detail-icon"><FiMail size={14} /></div>
                      <div>
                        <span className="user-detail-label">Email</span>
                        <span className="user-detail-value">{user?.email}</span>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="user-detail-row">
                      <div className="user-detail-icon"><FiPhone size={14} /></div>
                      <div style={{ flex: 1 }}>
                        <span className="user-detail-label">Mobile</span>
                        {!phoneEdit && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {hasPhone ? (
                              <>
                                <span className="user-detail-value">{user.phone}</span>
                                <button className="edit-detail-btn" onClick={() => { setPhoneEdit(true); setPhoneInput(user.phone); }} type="button">
                                  <FiEdit3 size={12} /> Edit
                                </button>
                              </>
                            ) : (
                              <div className="phone-missing-alert">
                                <FiAlertCircle size={14} />
                                <span>Mobile number required to book</span>
                                <button className="edit-detail-btn urgent" onClick={() => { setPhoneEdit(true); setPhoneInput(''); }} type="button">
                                  + Add Now
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {phoneEdit && (
                          <motion.div className="phone-edit-row"
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <input
                              className="form-control-custom phone-input"
                              placeholder="Enter 10-digit mobile number"
                              value={phoneInput}
                              onChange={e => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              autoFocus
                            />
                            <button className="btn-orange" style={{ padding: '10px 16px', fontSize: 13 }} onClick={handleSavePhone} disabled={phoneSaving} type="button">
                              {phoneSaving ? '...' : 'Save'}
                            </button>
                            <button className="btn-outline-orange" style={{ padding: '10px 14px', fontSize: 13 }} onClick={() => setPhoneEdit(false)} type="button">
                              Cancel
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="user-detail-row">
                      <div className="user-detail-icon"><FiHome size={14} /></div>
                      <div>
                        <span className="user-detail-label">Address</span>
                        <span className="user-detail-value">
                          {user?.address ? user.address : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!hasPhone && (
                    <p className="phone-required-note">
                      <FiAlertCircle size={13} /> A valid mobile number is required before you can proceed to payment.
                    </p>
                  )}
                </div>

                {/* ── Pickup Details ── */}
                <div className="form-section glass-card">
                  <h3><FiMapPin className="orange-text" /> Pickup Details</h3>
                  <div className="form-group">
                    <label className="form-label-custom">Pickup Location</label>
                    <input className="form-control-custom" value={form.pickupLocation}
                      onChange={e => setForm(p => ({ ...p, pickupLocation: e.target.value }))} placeholder="Enter pickup location" />
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Return Location (optional)</label>
                    <input className="form-control-custom" value={form.returnLocation}
                      onChange={e => setForm(p => ({ ...p, returnLocation: e.target.value }))} placeholder="Same as pickup if empty" />
                  </div>
                  <div className="date-grid">
                    <div className="form-group">
                      <label className="form-label-custom"><FiCalendar /> Pickup Date</label>
                      <input type="date" className="form-control-custom" value={form.pickupDate} min={fmtDate(new Date())}
                        onChange={e => setForm(p => ({ ...p, pickupDate: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label-custom"><FiCalendar /> Return Date</label>
                      <input type="date" className="form-control-custom" value={form.returnDate} min={form.pickupDate}
                        onChange={e => setForm(p => ({ ...p, returnDate: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* ── Coupon ── */}
                <div className="form-section glass-card">
                  <h3><FiTag className="orange-text" /> Coupon Code</h3>
                  <div className="coupon-input">
                    <input className="form-control-custom" placeholder="Enter coupon (e.g. ROYAL20)" value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())} />
                    <button className="btn-orange" onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponData && (
                    <p style={{ color: '#00c864', fontSize: '13px', marginTop: 8 }}>
                      ✓ Coupon applied! Saved ₹{couponData.discount}
                    </p>
                  )}
                  <div className="available-coupons">
                    <span>Try:</span>
                    <span className="coupon-tag" onClick={() => setCouponCode('ROYAL20')}>ROYAL20</span>
                    <span className="coupon-tag" onClick={() => setCouponCode('FIRST50')}>FIRST50</span>
                  </div>
                </div>

                <button
                  className={`btn-orange ${!hasPhone ? 'btn-disabled-look' : ''}`}
                  style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px' }}
                  onClick={handleBooking}
                  disabled={submitting}
                >
                  {submitting ? 'Creating Booking...' : !hasPhone ? '⚠️ Add Mobile Number to Continue' : 'Continue to Payment →'}
                </button>
              </motion.div>
            ) : (
              <motion.div key="payment" className="booking-form-wrap"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>

                {/* Contact Summary on Payment Step */}
                <div className="pay-contact-bar glass-card">
                  <div className="pay-contact-item"><FiMail size={13} /><span>{user?.email}</span></div>
                  <div className="pay-contact-sep" />
                  <div className="pay-contact-item"><FiPhone size={13} /><span>{user?.phone}</span></div>
                  {user?.address && <>
                    <div className="pay-contact-sep" />
                    <div className="pay-contact-item"><FiHome size={13} /><span>{user.address}</span></div>
                  </>}
                </div>

                {/* Payment Method Tabs */}
                <div className="pay-method-tabs">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.id}
                      className={`pay-tab ${payMethod === m.id ? 'active' : ''}`}
                      onClick={() => { setPayMethod(m.id); setDemoStep('idle'); }}
                      type="button">
                      {m.icon}
                      <div>
                        <p>{m.label}</p>
                        <span>{m.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* ── UPI QR Tab ── */}
                {payMethod === 'upi_qr' && (
                  <motion.div className="form-section glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3><MdQrCode2 className="orange-text" /> Scan & Pay via UPI</h3>

                    <div className="qr-section">
                      <div className="qr-wrapper">
                        <QRCodeSVG
                          value={upiString}
                          size={200}
                          bgColor="#0d0d0d"
                          fgColor="#FF8A00"
                          level="H"
                          includeMargin={true}
                        />
                        <div className="qr-brand-label">RoyalRent</div>
                      </div>

                      <div className="qr-info">
                        <div className="qr-amount-badge">
                          <span>Amount</span>
                          <strong>₹{total.toLocaleString()}</strong>
                        </div>
                        <p className="qr-upi-id">UPI ID: <strong>royalrent@upi</strong></p>

                        {upiTimer > 0 ? (
                          <div className="qr-timer">
                            <FiClock size={13} />
                            QR expires in <strong>{fmtTime(upiTimer)}</strong>
                          </div>
                        ) : (
                          <div className="qr-timer expired">QR expired — refresh page</div>
                        )}

                        <div className="qr-steps">
                          <p>How to pay:</p>
                          <ol>
                            <li>Open any UPI app</li>
                            <li>Scan the QR code</li>
                            <li>Confirm ₹{total.toLocaleString()}</li>
                            <li>Click "I've Paid" below</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div className="upi-apps-row">
                      {UPI_APPS.map(app => (
                        <div key={app.name} className="upi-app-pill">
                          <img src={app.img} alt={app.name} onError={e => { e.target.style.display = 'none'; }} />
                          <span>{app.name}</span>
                        </div>
                      ))}
                    </div>

                    <button className="btn-orange pay-main-btn" onClick={handleUpiPaid} disabled={submitting || upiTimer === 0}>
                      {submitting ? 'Confirming...' : "✅ I've Paid — Confirm Booking"}
                    </button>
                    <p className="payment-note">Click only after completing payment in your UPI app</p>
                  </motion.div>
                )}

                {/* ── COD Tab ── */}
                {payMethod === 'cod' && (
                  <motion.div className="form-section glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3><FiTruck className="orange-text" /> Cash on Pickup</h3>

                    <div className="cod-banner">
                      <div className="cod-banner-icon">💵</div>
                      <div>
                        <p>Pay <strong>₹{total.toLocaleString()}</strong> in cash when you pick up the car.</p>
                        <span>No online payment needed — just bring the exact amount.</span>
                      </div>
                    </div>

                    <div className="cod-checklist">
                      {[
                        { icon: '💵', text: `Keep ₹${total.toLocaleString()} ready in cash` },
                        { icon: '🪪', text: 'Carry a valid Government ID (Aadhaar / Passport)' },
                        { icon: '🚗', text: 'Bring your Driving Licence for verification' },
                        { icon: '📍', text: `Arrive at: ${form.pickupLocation || 'your selected location'}` },
                        { icon: '📅', text: `Pickup Date: ${form.pickupDate}` },
                      ].map((item, i) => (
                        <div key={i} className="cod-check-item">
                          <span className="cod-check-emoji">{item.icon}</span>
                          <span>{item.text}</span>
                          <FiCheckCircle className="cod-check-tick" size={15} />
                        </div>
                      ))}
                    </div>

                    <div className="cod-note">
                      <FiAlertCircle size={13} />
                      <span>Booking will be reserved for <strong>24 hours</strong>. If payment is not made at pickup, the booking will be auto-cancelled.</span>
                    </div>

                    <button className="btn-cod pay-main-btn" onClick={handleCOD} disabled={submitting}>
                      {submitting ? 'Confirming...' : '✅ Confirm Booking — Pay at Pickup'}
                    </button>
                    <p className="payment-note">Your slot is reserved. Pay ₹{total.toLocaleString()} cash at the pickup point.</p>
                  </motion.div>
                )}

                {/* ── Demo Payment Tab ── */}
                {payMethod === 'demo' && (
                  <motion.div className="form-section glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3><FiGift className="orange-text" /> Demo Payment</h3>

                    <div className="demo-info-banner">
                      <span>🧪</span>
                      <p>This is a <strong>test/demo mode</strong>. No real money is charged. Use this to explore the booking flow without actual payment.</p>
                    </div>

                    <div className="demo-breakdown">
                      <div className="demo-row"><span>Car</span><span>{car?.brand} {car?.name}</span></div>
                      <div className="demo-row"><span>Duration</span><span>{totalDays} day{totalDays > 1 ? 's' : ''}</span></div>
                      <div className="demo-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                      <div className="demo-row"><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
                      {discount > 0 && <div className="demo-row" style={{ color: '#00c864' }}><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
                      <div className="demo-row total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
                    </div>

                    <AnimatePresence mode="wait">
                      {demoStep === 'idle' && (
                        <motion.button key="idle" className="btn-orange pay-main-btn demo-btn"
                          onClick={handleDemoPayment}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          🚀 Simulate Payment of ₹{total.toLocaleString()}
                        </motion.button>
                      )}

                      {demoStep === 'processing' && (
                        <motion.div key="processing" className="demo-processing"
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                          <div className="demo-spinner-ring" />
                          <p>Processing payment…</p>
                          <div className="demo-countdown">{demoCount}</div>
                          <div className="demo-progress-bar">
                            <motion.div className="demo-progress-fill"
                              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                              transition={{ duration: 3.2, ease: 'linear' }} />
                          </div>
                          <div className="demo-processing-steps">
                            <span>🔐 Encrypting…</span>
                            <span>🏦 Verifying…</span>
                            <span>✅ Confirming…</span>
                          </div>
                        </motion.div>
                      )}

                      {demoStep === 'success' && (
                        <motion.div key="success" className="demo-success"
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                          <motion.div className="demo-success-icon"
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.1 }}>✅</motion.div>
                          <p>Payment Successful!</p>
                          <span>Redirecting to confirmation…</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className="payment-note" style={{ marginTop: 12 }}>⚠️ Demo only — no real transaction is processed</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Booking Summary */}
          <motion.div className="booking-summary glass-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <h3>Booking Summary</h3>
            <div className="summary-car">
              <img src={car?.images?.[0] || 'https://via.placeholder.com/200x120/121212/FF8A00?text=Car'} alt={car?.name} />
              <div>
                <p className="summary-car-brand">{car?.brand}</p>
                <p className="summary-car-name">{car?.name}</p>
                <p className="summary-car-price">₹{car?.pricePerDay?.toLocaleString()}/day</p>
              </div>
            </div>
            <div className="summary-details">
              <div><span>Pickup</span><span>{form.pickupLocation || '—'}</span></div>
              <div><span>Dates</span><span>{form.pickupDate} → {form.returnDate}</span></div>
              <div><span>Duration</span><span>{totalDays} {totalDays === 1 ? 'day' : 'days'}</span></div>
            </div>
            <div className="summary-pricing">
              <div><span>Subtotal ({totalDays}d × ₹{car?.pricePerDay?.toLocaleString()})</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div><span>Tax (18% GST)</span><span>₹{tax.toLocaleString()}</span></div>
              {discount > 0 && <div style={{ color: '#00c864' }}><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
              <div className="summary-total"><span>Total Amount</span><span>₹{total.toLocaleString()}</span></div>
            </div>

            {paymentStep && bookingData && (
              <div className="booking-id-badge">
                <span>Booking ID</span>
                <strong>{bookingData.bookingId}</strong>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
