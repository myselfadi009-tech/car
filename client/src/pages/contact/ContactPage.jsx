import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdPhone, MdEmail, MdLocationOn, MdAccessTime } from 'react-icons/md';
import { FiSend } from 'react-icons/fi';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import './contact.css';

const contactInfo = [
  { icon: MdPhone, label: 'Phone', value: '+1 234 567 8900', sub: 'Mon-Sun 9AM-10PM' },
  { icon: MdEmail, label: 'Email', value: 'info@royalrent.com', sub: 'We reply within 24hrs' },
  { icon: MdLocationOn, label: 'Address', value: '123 Street, New York, NY', sub: 'USA 10028' },
  { icon: MdAccessTime, label: 'Working Hours', value: 'Mon-Sun', sub: '9:00 AM - 10:00 PM' },
];

const faqs = [
  { q: 'How do I book a car?', a: 'Browse our fleet, select your car, choose dates, and pay securely via Razorpay.' },
  { q: 'What is your cancellation policy?', a: 'Free cancellation up to 24 hours before pickup. Partial refund otherwise.' },
  { q: 'Do you offer airport pickup?', a: 'Yes! We offer pickup and drop at all major airports.' },
  { q: 'What documents are needed?', a: 'Valid driver\'s license and government-issued ID are required.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent! We\'ll get back to you soon. 📧');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch { toast.error('Failed to send message. Try again.'); }
    setLoading(false);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-glow" />
        <div className="container-custom" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="badge-orange">📞 Get In Touch</div>
            <h1 className="section-title" style={{ marginTop: 16 }}>Contact <span className="orange-text">Our Team</span></h1>
            <p className="section-subtitle" style={{ marginTop: 12 }}>Have questions? We're here to help you 24/7</p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom contact-body">
        <div className="contact-grid">
          <motion.div className="contact-info-col" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}>
            <h2>Our Information</h2>
            <div className="contact-info-cards">
              {contactInfo.map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="contact-info-card glass-card">
                  <div className="contact-info-icon"><Icon size={22} /></div>
                  <div>
                    <p className="info-label">{label}</p>
                    <p className="info-value">{value}</p>
                    <p className="info-sub">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="contact-form-col" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
            <div className="contact-form-card glass-card">
              <h2>Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="contact-form-grid">
                  <div className="form-group">
                    <label className="form-label-custom">Full Name</label>
                    <input className="form-control-custom" placeholder="Your name" value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Email Address</label>
                    <input type="email" className="form-control-custom" placeholder="Your email" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label-custom">Subject</label>
                  <input className="form-control-custom" placeholder="How can we help?" value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label-custom">Your Message</label>
                  <textarea className="form-control-custom" rows={5} placeholder="Write your message here..." value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn-orange" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
                  {loading ? 'Sending...' : <><FiSend /> Send Message</>}
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        <section className="section-padding">
          <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-title">Frequently Asked <span className="orange-text">Questions</span></h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} className="faq-card glass-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <h4>{faq.q}</h4>
                <p>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
