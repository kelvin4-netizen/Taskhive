// src/pages/dashboard/ProfilePage.jsx
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { Loader2, Copy, Check, Shield, Globe, Phone as PhoneIcon } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const COUNTRIES = ['Kenya','Nigeria','Ghana','South Africa','Uganda','Tanzania','United States','United Kingdom','Canada','Australia','India','Philippines','Pakistan','Bangladesh','Indonesia','Other'];

const CSS = `
  .pp-card { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:16px; }
  .pp-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:10px; padding:11px 14px; font-size:13px; font-family:inherit; transition:all 0.2s; outline:none; }
  .pp-input:focus { border-color:rgba(212,168,67,0.5); background:rgba(212,168,67,0.04); box-shadow:0 0 0 3px rgba(212,168,67,0.08); }
  .pp-input::placeholder { color:#3A3A3A; }
  .pp-label { display:block; font-size:11px; font-weight:600; color:#5A5A5A; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:7px; }
  .pp-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:10px; font-weight:700; }
`;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: { fullName: user?.fullName, country: user?.country, phoneNumber: user?.phoneNumber || '' }
  });

  const mutation = useMutation(
    (data) => api.patch('/users/profile', data),
    {
      onSuccess: (res) => { updateUser(res.data.data.user); toast.success('Profile updated!'); },
      onError: () => toast.error('Update failed. Please try again.'),
    }
  );

  const copyReferral = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div>
          <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>My Profile</h1>
          <p style={{ fontSize: 13, color: '#5A5A5A' }}>Manage your account details and preferences.</p>
        </div>

        {/* Avatar card */}
        <motion.div className="pp-card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(212,168,67,0.2),rgba(212,168,67,0.05))', border: '2px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontFamily: '"Syne",sans-serif', fontWeight: 900, color: '#D4A843', flexShrink: 0 }}>
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{user?.fullName}</div>
              <div style={{ fontSize: 12, color: '#5A5A5A', marginBottom: 8 }}>{user?.email}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="pp-badge" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>
                  <Shield size={9} /> Verified
                </span>
                <span className="pp-badge" style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', color: '#D4A843' }}>
                  {user?.role === 'ADMIN' ? '👑 Admin' : '⭐ Member'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Referral code */}
        <motion.div className="pp-card" style={{ padding: '20px 24px' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#D4A843', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>🎁 Your Referral Code</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 10, padding: '11px 14px', fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 800, color: '#D4A843', letterSpacing: '0.1em' }}>
              {user?.referralCode || '—'}
            </div>
            <button
              onClick={copyReferral}
              style={{ width: 42, height: 42, borderRadius: 10, background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(212,168,67,0.08)', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(212,168,67,0.2)'}`, color: copied ? '#22C55E' : '#D4A843', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#4A4A4A', marginTop: 8 }}>Share your code to earn referral bonuses when friends sign up.</p>
        </motion.div>

        {/* Edit form */}
        <motion.div className="pp-card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 14, background: 'linear-gradient(180deg,#D4A843,#A07820)', borderRadius: 2 }} />
            Edit Information
          </div>

          <form onSubmit={handleSubmit(mutation.mutate)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="pp-label">Full Name</label>
              <input className="pp-input" placeholder="John Doe" {...register('fullName', { required: true })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} id="pp-grid">
              <style>{`@media(max-width:480px){#pp-grid{grid-template-columns:1fr!important}}`}</style>
              <div>
                <label className="pp-label"><Globe size={9} style={{ display: 'inline', marginRight: 4 }} />Country</label>
                <select className="pp-input" style={{ cursor: 'pointer' }} {...register('country', { required: true })}>
                  <option value="">Select country...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="pp-label"><PhoneIcon size={9} style={{ display: 'inline', marginRight: 4 }} />Phone (optional)</label>
                <input className="pp-input" placeholder="+254..." {...register('phoneNumber')} />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isLoading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: mutation.isLoading ? 'rgba(212,168,67,0.5)' : 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', border: 'none', borderRadius: 11, padding: '13px', fontSize: 13, fontWeight: 700, cursor: mutation.isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: 4, transition: 'all 0.2s' }}
            >
              {mutation.isLoading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
              {mutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Account info */}
        <motion.div className="pp-card" style={{ padding: '18px 24px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Account Info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
              { label: 'Wallet Balance', value: `$${user?.walletBalance?.toFixed(2) || '0.00'}` },
              { label: 'Total Earned', value: `$${user?.totalEarned?.toFixed(2) || '0.00'}` },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 12, color: '#5A5A5A' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </>
  );
}