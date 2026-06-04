// src/pages/PackagesPage.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, Loader2, CreditCard, Smartphone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function PackagesPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [selectedPkg, setSelectedPkg] = useState(null);

  const { data, isLoading } = useQuery(['category', slug], () =>
    api.get(`/categories/${slug}`).then(r => r.data.data.category)
  );

  const stripeMutation = useMutation(
    (packageId) => api.post('/payments/stripe/create-session', { packageId }),
    {
      onSuccess: (res) => {
        window.location.href = res.data.data.url;
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Payment failed.'),
    }
  );

  const mpesaMutation = useMutation(
    ({ packageId, phone }) => api.post('/payments/mpesa/initiate', { packageId, phone }),
    {
      onSuccess: () => {
        toast.success('STK Push sent! Check your phone to complete payment.');
        setSelectedPkg(null);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'M-Pesa failed.'),
    }
  );

  const handlePurchase = () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    if (!selectedPkg) {
      toast.error('Please select a package.');
      return;
    }
    if (paymentMethod === 'stripe') {
      stripeMutation.mutate(selectedPkg.id);
    } else {
      if (!mpesaPhone) { toast.error('Enter your M-Pesa phone number.'); return; }
      mpesaMutation.mutate({ packageId: selectedPkg.id, phone: mpesaPhone });
    }
  };

  const isProcessing = stripeMutation.isLoading || mpesaMutation.isLoading;

  if (isLoading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark">
      {/* Nav */}
      <nav className="nav-glass">
        <Link to="/" className="flex items-center gap-2 text-gold font-display text-xl font-extrabold">
          <div className="w-7 h-7 bg-gold-gradient" style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }} />
          TaskHive
        </Link>
        {isAuthenticated
          ? <Link to="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
          : <Link to="/login" className="btn-gold text-sm px-5 py-2">Sign In</Link>
        }
      </nav>

      <div className="pt-24 pb-16 px-5 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <Link to="/" className="flex items-center gap-1 text-muted text-sm hover:text-text mb-8">
          <ChevronLeft size={15} /> Back to Categories
        </Link>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="section-tag">Select Your Package</div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            {data?.name}
          </h1>
          <p className="text-muted max-w-md mx-auto">{data?.description}</p>
        </div>

        {/* Package cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {data?.packages?.map((pkg, i) => {
            const isSelected = selectedPkg?.id === pkg.id;
            const isPopular = i === 1;
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedPkg(pkg)}
                className={`relative card cursor-pointer p-6 transition-all duration-300 ${
                  isSelected
                    ? 'border-gold/60 bg-gold/5 glow-gold'
                    : isPopular
                    ? 'border-gold/25 bg-gold/[0.03]'
                    : 'hover:border-subtle/80'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold-gradient text-dark text-xs font-bold px-4 py-1 rounded-full font-display whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                    <Check size={13} className="text-dark font-bold" />
                  </div>
                )}
                <div className="text-xs font-bold uppercase tracking-widest text-gold mb-3">{pkg.name}</div>
                <div className="font-display text-4xl font-extrabold tracking-tight mb-1">
                  <sup className="text-xl">$</sup>{pkg.price}
                </div>
                <div className="text-xs text-muted mb-5">
                  {pkg.isMonthly ? 'per month' : 'one-time'}
                </div>
                <ul className="space-y-2.5">
                  {pkg.features?.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted">
                      <span className="text-gold font-bold text-xs">✦</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Payment method + checkout */}
        {selectedPkg && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto card p-6"
          >
            <h3 className="font-display font-bold mb-4">Payment Method</h3>
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-gold/50 bg-gold/10 text-gold'
                    : 'border-subtle text-muted hover:border-subtle/80'
                }`}
              >
                <CreditCard size={15} /> Card / PayPal
              </button>
              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                  paymentMethod === 'mpesa'
                    ? 'border-gold/50 bg-gold/10 text-gold'
                    : 'border-subtle text-muted hover:border-subtle/80'
                }`}
              >
                <Smartphone size={15} /> M-Pesa
              </button>
            </div>

            {paymentMethod === 'mpesa' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted mb-1.5">M-Pesa Phone Number</label>
                <input
                  className="input-field"
                  placeholder="254712345678"
                  value={mpesaPhone}
                  onChange={e => setMpesaPhone(e.target.value)}
                />
                <p className="text-xs text-muted mt-1">Format: 254XXXXXXXXX (no + sign)</p>
              </div>
            )}

            <div className="flex items-center justify-between py-3 border-t border-b border-subtle mb-4 text-sm">
              <span className="text-muted">{selectedPkg.name} — {data?.name}</span>
              <span className="font-bold text-gold">${selectedPkg.price}</span>
            </div>

            {!isAuthenticated && (
              <p className="text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-2.5 mb-4 text-center">
                You'll be redirected to create an account first.
              </p>
            )}

            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3.5"
            >
              {isProcessing
                ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                : <><Lock size={15} /> Secure Checkout — ${selectedPkg.price}</>
              }
            </button>
            <p className="text-xs text-center text-muted mt-3">Secured by Stripe · 256-bit SSL</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
