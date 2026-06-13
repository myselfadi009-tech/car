import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '@assets/logo.png';
import './IntroScreen.css';

export default function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('exit'), 1600);
    const t2 = setTimeout(() => onComplete(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="intro-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'exit' ? 0 : 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="intro-particles">
            {[...Array(20)].map((_, i) => (
              <motion.span
                key={i}
                className="intro-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                }}
              />
            ))}
          </div>

          <div className="intro-glow-left" />
          <div className="intro-glow-right" />

          <div className="intro-center">
            <motion.div
              className="intro-crown-wrap"
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
            >
              <img src={logoImg} alt="RoyalRent" className="intro-crown" />
              <motion.div
                className="intro-crown-ring"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.0, delay: 0.4, repeat: Infinity, repeatDelay: 0.8 }}
              />
            </motion.div>

            <motion.div
              className="intro-brand"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <span className="intro-royal">Royal</span>
              <span className="intro-rent">Rent</span>
            </motion.div>

            <motion.div
              className="intro-divider-wrap"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
            >
              <div className="intro-divider-line" />
              <div className="intro-divider-diamond" />
              <div className="intro-divider-line" />
            </motion.div>

            <motion.p
              className="intro-tagline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
            >
              Drive Your <span>Dream Car</span>
            </motion.p>

            <motion.div
              className="intro-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                className="intro-loader-bar"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.95, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
