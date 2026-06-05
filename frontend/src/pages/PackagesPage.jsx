// src/pages/PackagesPage.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronLeft, Loader2, CreditCard,
  Smartphone, Lock, Shield, Zap, X, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const CATEGORY_ICONS = {
  'academic-writing':'🎓','freelancing':'💼','watching-videos':'▶️',
  'surveys':'📋','app-testing':'📱','data-entry':'⌨️',
  'social-media':'📣','crypto-tasks':'₿',
};

const CSS = `
  .pp-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:14px 5%; background:rgba(10,10,10,0.92); backdrop-filter:blur(20px); border-bottom:1px solid rgba(212,168,67,0.08); }
  .pp-pkg { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.07); border-radius:18px; padding:28px 24px; cursor:pointer; position:relative; transition:all 0.3s; }
  .pp-pkg:hover { border-color:rgba(212,168,67,0.25); transform:translateY(-4px); box-shadow:0 14px 40px rgba(0,0,0,0.5); }
  .pp-pkg.selected { border-color:rgba(212,168,67,0.6)!important; background:linear-gradient(135deg,rgba(212,168,67,0.07),#111)!important; box-shadow:0 0 0 1px rgba(212,168,67,0.25),0 16px 48px rgba(0,0,0,0.5)!important; }
  .pp-pkg.popular { border-color:rgba(212,168,67,0.2); }
  .pp-feature { display:flex; align-items:center; gap:9px; font-size:13px; color:#6B6B6B; padding:5px 0; }
  .pp-method { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; background:transparent; font-family:inherit; color:#6B6B6B; }
  .pp-method.active { border-color:rgba(212,168,67,0.5); background:rgba(212,168,67,0.08); color:#D4A843; }
  .pp-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:10px; padding:11px 14px; font-size:13px; font-family:inherit; outline:none; transition:all 0.2s; box-sizing:border-box; }
  .pp-input:focus { border-color:rgba(212,168,67,0.4); background:rgba(212,168,67,0.03); }
  .pp-input::placeholder { color:#3A3A3A; }
  .pp-checkout-modal { position:fixed; inset:0; z-index:200; display:flex; align-items:flex-end; justify-content:center; padding:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); }
  @media(min-width:640px){ .pp-checkout-modal { align-items:center; padding:16px; } }
  .pp-checkout-card { background:linear-gradient(135deg,#161616,#111); border:1px solid rgba(255,255,255,0.08); border-radius:20px 20px 0 0; width:100%; max-width:460px; padding:28px 24px 32px; }
  @media(min-width:640px){ .pp-checkout-card { border-radius:20px; } }
  .pp-trust { display:flex; align-items:center; gap:6px; font-size:11px; color:#4A4A4A; justify-content:center; margin-top:12px; }
  .pp-skeleton { background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%); background-size:200% 100%; border-radius:16px; animation:pp-shimmer 1.5s infinite; }
  @keyframes pp-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

export default function PackagesPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { data, isLoading } = useQuery(['category', slug], () =>
    api.get(`/categories/${slug}`).then(r => r.data.data.category)
  );

  const stripeMutation = useMutation(
    (packageId) => api.post('/payments/stripe/create-session', { packageId }),
    {
      onSuccess: (res) => { window.location.href = res.data.data.url; },
      onError: (err) => toast.error(err.response?.data?.message || 'Payment failed.'),
    }
  );

  const mpesaMutation = useMutation(
    ({ packageId, phone }) => api.post('/payments/mpesa/initiate', { packageId, phone }),
    {
      onSuccess: () => {
        toast.success('STK Push sent! Check your phone.');
        setCheckoutOpen(false);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'M-Pesa failed.'),
    }
  );

  const handleSelectPkg = (pkg) => {
    if (!isAuthenticated) { navigate('/register'); return; }
    setSelectedPkg(pkg);
    setCheckoutOpen(true);
  };

  const handlePurchase = () => {
    if (!selectedPkg) return;
    if (paymentMethod === 'stripe') {
      stripeMutation.mutate(selectedPkg.id);
    } else {
      if (!mpesaPhone) { toast.error('Enter your M-Pesa number'); return; }
      mpesaMutation.mutate({ packageId: selectedPkg.id, phone: mpesaPhone });
    }
  };

  const isProcessing = stripeMutation.isLoading || mpesaMutation.isLoading;
  const icon = CATEGORY_ICONS[slug] || '📂';

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background: '#0A0A0A', minHeight: '100svh' }}>

        {/* Nav */}
        <nav className="pp-nav">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#D4A843,#A07820)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🐝</div>
            <span style={{ fontFamily: '"Syne",sans-serif', fontSize: 18, fontWeight: 900, color: '#D4A843' }}>TaskHive</span>
          </Link>
          {isAuthenticated
            ? <Link to="/dashboard" style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', color: '#D4A843', padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Dashboard</Link>
            : <Link to="/login" style={{ background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          }
        </nav>

        <div style={{ maxWidth: 980, margin: '0 auto', padding: '100px 5% 80px' }}>

          {/* Back */}
          <Link to={`/categories/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#5A5A5A', textDecoration: 'none', marginBottom: 28 }}>
            <ChevronLeft size={13} /> Back to {data?.name || 'Category'}
          </Link>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#D4A843', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>Select Your Package</div>
            <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 'clamp(28px,5vw,46px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 12 }}>
              {data?.name}
            </h1>
            <p style={{ fontSize: 14, color: '#6B6B6B', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>{data?.description}</p>
          </motion.div>

          {/* Package cards */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 320 }} className="pp-skeleton" />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginBottom: 48 }}>
              {data?.packages?.map((pkg, i) => {
                const isPopular = i === 1;
                return (
                  <motion.div
                    key={pkg.id}
                    className={`pp-pkg ${isPopular ? 'popular' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    {isPopular && (
                      <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap', fontFamily: '"Syne",sans-serif', letterSpacing: '0.05em' }}>
                        ⭐ MOST POPULAR
                      </div>
                    )}

                    <div style={{ fontSize: 11, fontWeight: 700, color: '#D4A843', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{pkg.name}</div>

                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontFamily: '"Syne",sans-serif', fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>${pkg.price}</span>
                      <span style={{ fontSize: 12, color: '#5A5A5A', marginLeft: 4 }}>{pkg.isMonthly ? '/month' : 'one-time'}</span>
                    </div>

                    <div style={{ fontSize: 12, color: '#5A5A5A', marginBottom: 20 }}>
                      {pkg.isUnlimited ? 'Unlimited tasks' : `${pkg.taskLimit} tasks included`}
                    </div>

                    <div style={{ marginBottom: 22 }}>
                      {pkg.features?.map(f => (
                        <div key={f} className="pp-feature">
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check size={9} style={{ color: '#D4A843' }} />
                          </div>
                          {f}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSelectPkg(pkg)}
                      style={{
                        width: '100%', borderRadius: 11, padding: '12px', fontSize: 13,
                        fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        background: isPopular ? 'linear-gradient(135deg,#D4A843,#A07820)' : 'rgba(212,168,67,0.08)',
                        color: isPopular ? '#0A0A0A' : '#D4A843',
                        border: isPopular ? 'none' : '1px solid rgba(212,168,67,0.2)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isAuthenticated ? <><Zap size={13} /> Get Started — ${pkg.price}</> : <><ArrowRight size={13} /> Sign Up to Purchase</>}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {[
              { icon: Shield, text: 'Secure Payments' },
              { icon: Zap,    text: 'Instant Access'  },
              { icon: Lock,   text: '256-bit SSL'      },
            ].map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4A4A4A' }}>
                <b.icon size={13} style={{ color: '#D4A843' }} /> {b.text}
              </div>
            ))}
          </motion.div>

        </div>

        {/* Checkout modal */}
        <AnimatePresence>
          {checkoutOpen && selectedPkg && (
            <div className="pp-checkout-modal" onClick={e => e.target === e.currentTarget && setCheckoutOpen(false)}>
              <motion.div
                className="pp-checkout-card"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              >
                {/* Modal header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                  <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 800, color: '#fff' }}>Complete Purchase</div>
                  <button onClick={() => setCheckoutOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>

                {/* Order summary */}
                <div style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{selectedPkg.name} — {data?.name}</div>
                    <div style={{ fontSize: 11, color: '#6B6B6B' }}>{selectedPkg.isUnlimited ? 'Unlimited tasks' : `${selectedPkg.taskLimit} tasks`} · {selectedPkg.isMonthly ? 'Monthly' : 'One-time'}</div>
                  </div>
                  <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 900, color: '#D4A843' }}>${selectedPkg.price}</div>
                </div>

                {/* Payment method */}
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Payment Method</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                  <button className={`pp-method ${paymentMethod === 'mpesa' ? 'active' : ''}`} onClick={() => setPaymentMethod('mpesa')}>
                    <Smartphone size={14} /> M-Pesa
                  </button>
                  <button className={`pp-method ${paymentMethod === 'stripe' ? 'active' : ''}`} onClick={() => setPaymentMethod('stripe')}>
                    <CreditCard size={14} /> Card
                  </button>
                </div>

                {paymentMethod === 'mpesa' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>M-Pesa Phone Number</label>
                    <input
                      className="pp-input"
                      placeholder="254712345678"
                      value={mpesaPhone}
                      onChange={e => setMpesaPhone(e.target.value)}
                    />
                    <p style={{ fontSize: 11, color: '#4A4A4A', marginTop: 5 }}>Format: 254XXXXXXXXX · An STK push will be sent to your phone</p>
                  </motion.div>
                )}

                <button
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  style={{ width: '100%', background: isProcessing ? 'rgba(212,168,67,0.5)' : 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                >
                  {isProcessing
                    ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                    : <><Lock size={14} /> Pay ${selectedPkg.price} Securely</>
                  }
                </button>

                <div className="pp-trust">
                  <Shield size={11} style={{ color: '#D4A843' }} /> Secured · 256-bit SSL · Your data is safe
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}