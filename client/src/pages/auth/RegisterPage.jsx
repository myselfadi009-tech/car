import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiShield, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { registerUser, googleLogin } from '../../redux/slices/authSlice.js';
import { signInWithGoogle } from '../../services/firebase.js';
import toast from 'react-hot-toast';
import logoImg from '@assets/logo_1779723381406.png';
import './auth.css';

const schema = yup.object({
  name: yup.string().min(2, 'Min 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Min 8 characters')
    .matches(/[A-Z]/, 'Must contain at least 1 uppercase letter')
    .matches(/[0-9]/, 'Must contain at least 1 number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least 1 special character')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const generateCaptcha = () => {
  const ops = ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const a = Math.floor(Math.random() * 9) + 1;
  const b = op === '-' ? Math.floor(Math.random() * a) + 1 : Math.floor(Math.random() * 9) + 1;
  const answer = op === '+' ? a + b : a - b;
  return { question: `${a} ${op} ${b} = ?`, answer };
};

const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score++;
  const map = [
    { label: 'Very Weak', color: '#ff4444' },
    { label: 'Weak', color: '#ff8c00' },
    { label: 'Fair', color: '#ffc107' },
    { label: 'Strong', color: '#00c864' },
    { label: 'Very Strong', color: '#00e676' },
  ];
  return { score, ...map[score] };
};

const RULES = [
  { label: 'Min 8 characters', test: pw => pw.length >= 8 },
  { label: '1 Uppercase letter', test: pw => /[A-Z]/.test(pw) },
  { label: '1 Number', test: pw => /[0-9]/.test(pw) },
  { label: '1 Special character (!@#$...)', test: pw => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector(s => s.auth);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const strength = getStrength(password);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

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
    const { confirmPassword, ...userData } = data;
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created successfully! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
      refreshCaptcha();
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const googleData = await signInWithGoogle();
      const result = await dispatch(googleLogin(googleData));
      if (googleLogin.fulfilled.match(result)) {
        toast.success('Account created with Google! 🎉');
        navigate('/dashboard');
      } else {
        toast.error('Google sign up failed. Please try again.');
      }
    } catch {
      toast.error('Google sign up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <motion.div className="auth-card auth-card-wide glass-card"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <img src={logoImg} alt="RoyalRent" className="auth-logo-img" />
            Royal<span className="orange-text">Rent</span>
          </Link>
          <h2>Create Account</h2>
          <p>Join RoyalRent for the ultimate luxury experience</p>
        </div>

        <button className="google-btn" onClick={handleGoogleLogin} disabled={googleLoading}>
          <FcGoogle size={20} />
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
        <div className="auth-divider"><span>or register with email</span></div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {[
            { name: 'name', label: 'Full Name', type: 'text', icon: FiUser, placeholder: 'Enter your full name' },
            { name: 'email', label: 'Email Address', type: 'email', icon: FiMail, placeholder: 'Enter your email' },
          ].map(({ name, label, type, icon: Icon, placeholder }) => (
            <div className="form-group" key={name}>
              <label className="form-label-custom">{label}</label>
              <div className="input-wrapper">
                <Icon className="input-icon" />
                <input type={type} className="form-control-custom input-with-icon" placeholder={placeholder} {...register(name)} />
              </div>
              {errors[name] && <p className="field-error">{errors[name].message}</p>}
            </div>
          ))}

          {/* Password with strength */}
          <div className="form-group">
            <label className="form-label-custom">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control-custom input-with-icon"
                placeholder="Create a strong password"
                {...register('password', {
                  onChange: e => setPassword(e.target.value)
                })}
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}

            {/* Strength bar */}
            {password && (
              <div className="pw-strength-wrap">
                <div className="pw-strength-bars">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="pw-strength-bar"
                      style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }}
                    />
                  ))}
                </div>
                <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}

            {/* Rules checklist */}
            {password && (
              <div className="pw-rules">
                {RULES.map((rule, i) => {
                  const passed = rule.test(password);
                  return (
                    <div key={i} className={`pw-rule ${passed ? 'pass' : 'fail'}`}>
                      {passed ? <FiCheck size={11} /> : <FiX size={11} />}
                      <span>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label-custom">Confirm Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                className="form-control-custom input-with-icon"
                placeholder="Re-enter password"
                {...register('confirmPassword')}
              />
              <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
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
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
