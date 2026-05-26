import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiRefreshCw } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { loginUser, googleLogin } from '../../redux/slices/authSlice.js';
import { signInWithGoogle } from '../../services/firebase.js';
import toast from 'react-hot-toast';
import logoImg from '@assets/logo_1779723381406.png';
import './auth.css';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

const generateCaptcha = () => {
  const ops = ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const a = Math.floor(Math.random() * 9) + 1;
  const b = op === '-' ? Math.floor(Math.random() * a) + 1 : Math.floor(Math.random() * 9) + 1;
  const answer = op === '+' ? a + b : a - b;
  return { question: `${a} ${op} ${b} = ?`, answer };
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector(s => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard');
  }, [user, navigate]);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
  }, []);

  const onSubmit = async (data) => {
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError('Incorrect answer. Please try again.');
      refreshCaptcha();
      return;
    }
    setCaptchaError('');
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back! 🎉');
      navigate(result.payload.user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
      refreshCaptcha();
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const googleData = await signInWithGoogle();
      const result = await dispatch(googleLogin(googleData));
      if (googleLogin.fulfilled.match(result)) {
        toast.success('Welcome! Logged in with Google 🎉');
        navigate(result.payload.user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        toast.error('Google login failed. Please try again.');
      }
    } catch {
      toast.error('Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <motion.div className="auth-card glass-card"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <img src={logoImg} alt="RoyalRent" className="auth-logo-img" />
            Royal<span className="orange-text">Rent</span>
          </Link>
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        <button className="google-btn" onClick={handleGoogleLogin} disabled={googleLoading}>
          <FcGoogle size={20} />
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
        <div className="auth-divider"><span>or sign in with email</span></div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label-custom">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input type="email" className="form-control-custom input-with-icon" placeholder="Enter your email" {...register('email')} />
            </div>
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label-custom">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input type={showPassword ? 'text' : 'password'} className="form-control-custom input-with-icon" placeholder="Enter your password" {...register('password')} />
              <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          {/* CAPTCHA */}
          <div className="form-group">
            <label className="form-label-custom">Security Check</label>
            <div className="captcha-box">
              <div className="captcha-question">
                <FiShield size={14} className="captcha-shield" />
                <span className="captcha-text">{captcha.question}</span>
              </div>
              <button type="button" className="captcha-refresh" onClick={refreshCaptcha} title="New question">
                <FiRefreshCw size={13} />
              </button>
            </div>
            <div className="input-wrapper" style={{ marginTop: 8 }}>
              <input
                type="number"
                className="form-control-custom"
                placeholder="Enter your answer"
                value={captchaInput}
                onChange={e => { setCaptchaInput(e.target.value); setCaptchaError(''); }}
              />
            </div>
            {captchaError && <p className="field-error">{captchaError}</p>}
          </div>

          <button type="submit" className="btn-orange auth-submit-btn" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
