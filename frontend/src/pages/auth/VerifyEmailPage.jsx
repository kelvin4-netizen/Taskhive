// src/pages/auth/VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/services/api';

const CSS = `
  .ve-card { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:40px 36px; text-align:center; }
  .ve-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:10px; padding:11px 14px; font-size:14px; font-family:inherit; outline:none; transition:all 0.2s; }
  .ve-input:focus { border-color:rgba(212,168,67,0.5); box-shadow:0 0 0 3px rgba(212,168,67,0.08); }
  .ve-btn-gold { width:100%; background:linear-gradient(135deg,#D4A843,#A07820); color:#0A0A0A; border:none; border-radius:11px; padding:13px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity 0.2s; }
  .ve-btn-gold:disabled { opacity:0.6; cursor:not-allowed; }
  .ve-btn-ghost { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#888; border-radius:11px; padding:12px; font-size:14px; font-weight:500; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; margin-top:10px; }
  .ve-btn-ghost:hover { border-color:rgba(212,168,67,0.3); color:#D4A843; }
`;

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState(token ? 'loading' : 'resend');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  const handleResend = async () => {
    if (!email.trim()) { toast.error('Enter your email address'); return; }
    setSending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setSent(true);
      toast.success('Verification email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100svh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(212,168,67,0.08),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(59,130,246,0.05),transparent 70%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#D4A843,#A07820)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🐝</div>
              <span style={{ fontFamily: '"Syne",sans-serif', fontSize: 20, fontWeight: 900, color: '#D4A843' }}>TaskHive</span>
            </Link>
          </div>

          <div className="ve-card">

            {/* Loading */}
            {status === 'loading' && (
              <>
                <Loader2 size={44} style={{ color: '#D4A843', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                <h2 style={{ fontFamily: '"Syne",sans-serif', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Verifying your email...</h2>
                <p style={{ fontSize: 13, color: '#5A5A5A' }}>Please wait a moment.</p>
              </>
            )}

            {/* Success */}
            {status === 'success' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={30} style={{ color: '#22C55E' }} />
                </div>
                <h2 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Email Verified! 🎉</h2>
                <p style={{ fontSize: 13, color: '#5A5A5A', marginBottom: 28, lineHeight: 1.7 }}>
                  Your account is now active. Welcome to TaskHive — let's start earning!
                </p>
                <Link
                  to="/login"
                  style={{ display: 'block', background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', borderRadius: 11, padding: '13px', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                >
                  Sign In & Start Earning →
                </Link>
              </motion.div>
            )}

            {/* Error + resend form */}
            {status === 'error' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <XCircle size={30} style={{ color: '#EF4444' }} />
                </div>
                <h2 style={{ fontFamily: '"Syne",sans-serif', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Link Expired</h2>
                <p style={{ fontSize: 13, color: '#5A5A5A', marginBottom: 24, lineHeight: 1.7 }}>
                  This verification link is invalid or has expired. Enter your email to get a fresh one.
                </p>
                {!sent ? (
                  <>
                    <input
                      className="ve-input"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleResend()}
                      style={{ marginBottom: 12 }}
                    />
                    <button className="ve-btn-gold" onClick={handleResend} disabled={sending}>
                      {sending ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><RefreshCw size={15} /> Resend Verification Email</>}
                    </button>
                  </>
                ) : (
                  <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: '#22C55E' }}>
                    ✓ Email sent! Check your inbox and spam folder.
                  </div>
                )}
                <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: 18, fontSize: 12, color: '#5A5A5A', textDecoration: 'none' }}>
                  Back to login
                </Link>
              </motion.div>
            )}

            {/* Standalone resend page (no token in URL) */}
            {status === 'resend' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Mail size={28} style={{ color: '#D4A843' }} />
                </div>
                <h2 style={{ fontFamily: '"Syne",sans-serif', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Verify Your Email</h2>
                <p style={{ fontSize: 13, color: '#5A5A5A', marginBottom: 24, lineHeight: 1.7 }}>
                  Didn't receive your verification email? Enter your address and we'll send a new link.
                </p>
                {!sent ? (
                  <>
                    <input
                      className="ve-input"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleResend()}
                      style={{ marginBottom: 12 }}
                    />
                    <button className="ve-btn-gold" onClick={handleResend} disabled={sending}>
                      {sending ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><Mail size={15} /> Send Verification Email</>}
                    </button>
                  </>
                ) : (
                  <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: '#22C55E', lineHeight: 1.6 }}>
                    ✓ Check your inbox! The link expires in 24 hours.<br/>
                    <span style={{ fontSize: 11, color: '#4A4A4A', marginTop: 4, display: 'block' }}>Also check your spam/junk folder.</span>
                  </div>
                )}
                <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: 18, fontSize: 12, color: '#5A5A5A', textDecoration: 'none' }}>
                  Back to login
                </Link>
              </motion.div>
            )}

          </div>
        </motion.div>
      </div>
    </>
  );
}