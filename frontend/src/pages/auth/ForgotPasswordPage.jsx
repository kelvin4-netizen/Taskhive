// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/services/api';

const CSS = `
  .fp-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:10px; padding:11px 14px 11px 40px; font-size:14px; font-family:inherit; outline:none; transition:all 0.2s; box-sizing:border-box; }
  .fp-input:focus { border-color:rgba(212,168,67,0.5); background:rgba(212,168,67,0.03); box-shadow:0 0 0 3px rgba(212,168,67,0.08); }
  .fp-input::placeholder { color:#3A3A3A; }
  .fp-btn { width:100%; background:linear-gradient(135deg,#D4A843,#A07820); color:#0A0A0A; border:none; border-radius:11px; padding:13px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity 0.2s; }
  .fp-btn:disabled { opacity:0.6; cursor:not-allowed; }
`;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmittedEmail(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100svh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(212,168,67,0.07),transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#D4A843,#A07820)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🐝</div>
              <span style={{ fontFamily: '"Syne",sans-serif', fontSize: 20, fontWeight: 900, color: '#D4A843' }}>TaskHive</span>
            </Link>
          </div>

          <div style={{ background: 'linear-gradient(135deg,#141414,#111)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '36px 32px' }}>

            {!sent ? (
              <>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Mail size={22} style={{ color: '#D4A843' }} />
                </div>
                <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 8 }}>Forgot Password?</h1>
                <p style={{ fontSize: 13, color: '#5A5A5A', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>
                  Enter your email and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#3A3A3A', pointerEvents: 'none' }} />
                      <input
                        className="fp-input"
                        type="email"
                        placeholder="you@example.com"
                        {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                      />
                    </div>
                    {errors.email && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 5 }}>{errors.email.message}</p>}
                  </div>

                  <button type="submit" className="fp-btn" disabled={loading}>
                    {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <CheckCircle size={28} style={{ color: '#22C55E' }} />
                </div>
                <h2 style={{ fontFamily: '"Syne",sans-serif', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Check Your Email</h2>
                <p style={{ fontSize: 13, color: '#5A5A5A', lineHeight: 1.7, marginBottom: 8 }}>
                  We sent a reset link to:
                </p>
                <div style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#D4A843', marginBottom: 20 }}>
                  {submittedEmail}
                </div>
                <p style={{ fontSize: 11, color: '#4A4A4A', marginBottom: 20, lineHeight: 1.6 }}>
                  Don't see it? Check your spam folder.<br/>The link expires in 1 hour.
                </p>
                <button
                  onClick={() => setSent(false)}
                  style={{ fontSize: 12, color: '#5A5A5A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
                >
                  Try a different email
                </button>
              </motion.div>
            )}

            <div style={{ textAlign: 'center', marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#5A5A5A', textDecoration: 'none' }}>
                <ArrowLeft size={12} /> Back to login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}