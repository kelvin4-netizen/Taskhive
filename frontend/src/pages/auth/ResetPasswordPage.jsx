// src/pages/auth/ResetPasswordPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/services/api';

const CSS = `
  .rp-input-wrap { position:relative; }
  .rp-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:10px; padding:11px 40px 11px 40px; font-size:14px; font-family:inherit; outline:none; transition:all 0.2s; box-sizing:border-box; }
  .rp-input:focus { border-color:rgba(212,168,67,0.5); background:rgba(212,168,67,0.03); box-shadow:0 0 0 3px rgba(212,168,67,0.08); }
  .rp-input.error { border-color:rgba(239,68,68,0.5); }
  .rp-input::placeholder { color:#3A3A3A; }
  .rp-btn { width:100%; background:linear-gradient(135deg,#D4A843,#A07820); color:#0A0A0A; border:none; border-radius:11px; padding:13px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity 0.2s; }
  .rp-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .rp-rule { display:flex; align-items:center; gap:7px; font-size:12px; }
`;

function PasswordStrength({ password }) {
  const rules = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter',  ok: /[A-Z]/.test(password) },
    { label: 'One number',            ok: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
      {rules.map(r => (
        <div key={r.label} className="rp-rule" style={{ color: r.ok ? '#22C55E' : '#5A5A5A' }}>
          {r.ok ? <CheckCircle size={11} /> : <XCircle size={11} />}
          {r.label}
        </div>
      ))}
    </div>
  );
}

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100svh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(212,168,67,0.07),transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#D4A843,#A07820)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🐝</div>
              <span style={{ fontFamily: '"Syne",sans-serif', fontSize: 20, fontWeight: 900, color: '#D4A843' }}>TaskHive</span>
            </Link>
          </div>

          <div style={{ background: 'linear-gradient(135deg,#141414,#111)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '36px 32px' }}>

            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={22} style={{ color: '#D4A843' }} />
            </div>

            <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 8 }}>Set New Password</h1>
            <p style={{ fontSize: 13, color: '#5A5A5A', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>
              Choose a strong password for your account.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* New password */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>New Password</label>
                <div className="rp-input-wrap">
                  <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#3A3A3A', pointerEvents: 'none' }} />
                  <input
                    className={`rp-input ${errors.password ? 'error' : ''}`}
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'At least 8 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5A5A5A', cursor: 'pointer', padding: 2 }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 5 }}>{errors.password.message}</p>}
                <PasswordStrength password={password} />
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Confirm Password</label>
                <div className="rp-input-wrap">
                  <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#3A3A3A', pointerEvents: 'none' }} />
                  <input
                    className={`rp-input ${errors.confirmPassword ? 'error' : ''}`}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    {...register('confirmPassword', {
                      validate: v => v === password || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5A5A5A', cursor: 'pointer', padding: 2 }}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 5 }}>{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" className="rp-btn" disabled={loading} style={{ marginTop: 4 }}>
                {loading
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Resetting...</>
                  : <><Lock size={14} /> Reset Password</>
                }
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Link to="/login" style={{ fontSize: 12, color: '#5A5A5A', textDecoration: 'none' }}>Back to login</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}