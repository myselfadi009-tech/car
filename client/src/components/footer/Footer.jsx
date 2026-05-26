import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { MdPhone, MdEmail, MdLocationOn } from 'react-icons/md';
import './footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container-custom">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span>👑</span>
              <span>Royal<span className="orange-text">Rent</span></span>
            </Link>
            <p className="footer-desc">Luxury car rental platform delivering premium vehicles and exceptional driving experiences across the nation.</p>
            <div className="footer-socials">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="social-icon"><Icon /></a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              {[['/', 'Home'], ['/cars', 'Browse Cars'], ['/contact', 'Contact'], ['/login', 'Login']].map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Our Services</h4>
            <ul>
              {['Luxury Cars', 'Sports Cars', 'Affordable Cars', 'Long Term Rental', 'Corporate Rent'].map(s => (
                <li key={s}><a href="#">{s}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Info</h4>
            <div className="footer-contact">
              <div><MdPhone /> +1 234 567 8900</div>
              <div><MdEmail /> info@royalrent.com</div>
              <div><MdLocationOn /> 123 Street, New York, USA 10028</div>
            </div>
            <div className="footer-newsletter">
              <h5>Newsletter</h5>
              <div className="newsletter-input">
                <input type="email" placeholder="Enter your email" />
                <button className="btn-orange" style={{ padding: '10px 16px', fontSize: '13px' }}>Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 RoyalRent. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
