// src/pages/CategoryPage.jsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ChevronLeft, ArrowRight, Loader2, Star, Users, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

const CATEGORY_META = {
  'academic-writing': { icon: '🎓', color: '#3B82F6', perks: ['Expert-level tasks', 'Fast approval', 'Weekly payouts'] },
  'freelancing':      { icon: '💼', color: '#8B5CF6', perks: ['High-paying projects', 'Build your portfolio', 'Flexible hours'] },
  'watching-videos':  { icon: '▶️', color: '#EF4444', perks: ['No skills required', 'Instant access', 'Daily tasks'] },
  'surveys':          { icon: '📋', color: '#F59E0B', perks: ['Quick 5-min surveys', 'Multiple daily', 'Easy approval'] },
  'app-testing':      { icon: '📱', color: '#10B981', perks: ['Test real apps', 'Detailed feedback', 'Premium pay'] },
  'data-entry':       { icon: '⌨️', color: '#6366F1', perks: ['Beginner friendly', 'Consistent work', 'Fast payouts'] },
  'social-media':     { icon: '📣', color: '#EC4899', perks: ['Use your social accounts', 'Brand partnerships', 'Grow influence'] },
  'crypto-tasks':     { icon: '₿',  color: '#F59E0B', perks: ['DeFi opportunities', 'Airdrop tasks', 'High rewards'] },
};

const CSS = `
  .cp-hero { position:relative; min-height:45svh; display:flex; align-items:center; overflow:hidden; background:#0A0A0A; padding-top:80px; }
  .cp-glow { position:absolute; top:-10%; right:-5%; width:500px; height:500px; border-radius:50%; filter:blur(80px); opacity:0.12; pointer-events:none; }
  .cp-stat { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:14px 18px; display:flex; align-items:center; gap:10px; }
  .cp-perk { display:flex; align-items:center; gap:8px; font-size:13px; color:#9A9A9A; }
  .cp-pkg-card { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:28px 24px; transition:all 0.3s; cursor:pointer; position:relative; }
  .cp-pkg-card:hover { border-color:rgba(212,168,67,0.3); transform:translateY(-4px); box-shadow:0 14px 40px rgba(0,0,0,0.5); }
  .cp-pkg-card.selected { border-color:rgba(212,168,67,0.6); background:linear-gradient(135deg,rgba(212,168,67,0.06),#111); box-shadow:0 0 0 1px rgba(212,168,67,0.2), 0 14px 40px rgba(0,0,0,0.5); }
  .cp-feature { display:flex; align-items:center; gap:8px; font-size:13px; color:#7A7A7A; padding:4px 0; }
  .cp-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:14px 5%; background:rgba(10,10,10,0.92); backdrop-filter:blur(20px); border-bottom:1px solid rgba(212,168,67,0.08); }
`;

export default function CategoryPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading } = useQuery(['category', slug], () =>
    api.get(`/categories/${slug}`).then(r => r.data.data.category)
  );

  const meta = CATEGORY_META[slug] || { icon: '📂', color: '#D4A843', perks: [] };

  if (isLoading) return (
    <div style={{ minHeight: '100svh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} style={{ color: '#D4A843', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background: '#0A0A0A', minHeight: '100svh' }}>

        {/* Nav */}
        <nav className="cp-nav">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#D4A843,#A07820)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🐝</div>
            <span style={{ fontFamily: '"Syne",sans-serif', fontSize: 18, fontWeight: 900, color: '#D4A843' }}>TaskHive</span>
          </Link>
          {isAuthenticated
            ? <Link to="/dashboard" style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', color: '#D4A843', padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Dashboard</Link>
            : <Link to="/login" style={{ background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          }
        </nav>

        {/* Hero */}
        <div className="cp-hero">
          <div className="cp-glow" style={{ background: meta.color }} />
          <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', padding: '40px 5%' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#5A5A5A', textDecoration: 'none', marginBottom: 24 }}>
              <ChevronLeft size={13} /> Back to Categories
            </Link>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: `${meta.color}18`, border: `1.5px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>
                  {meta.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Task Category</div>
                  <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-1px' }}>{data?.name}</h1>
                </div>
              </div>

              <p style={{ fontSize: 15, color: '#6B6B6B', lineHeight: 1.7, maxWidth: 520, marginBottom: 28 }}>{data?.description}</p>

              {/* Perks */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                {meta.perks.map(p => (
                  <div key={p} className="cp-perk">
                    <span style={{ color: meta.color, fontSize: 16 }}>✦</span> {p}
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { icon: Star,    label: 'Estimated Earn', value: data?.estimatedEarn || '$5–$100' },
                  { icon: Users,   label: 'Active Workers', value: '2,400+'  },
                  { icon: Clock,   label: 'Avg. Task Time',  value: '5–30 min' },
                  { icon: Shield,  label: 'Approval Rate',   value: '94%'     },
                ].map(s => (
                  <div key={s.label} className="cp-stat">
                    <s.icon size={15} style={{ color: meta.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: '#5A5A5A', marginTop: 2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA section */}
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 5% 80px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ background: 'linear-gradient(135deg,rgba(212,168,67,0.07),rgba(212,168,67,0.02))', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 20, padding: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}
          >
            <div>
              <h2 style={{ fontFamily: '"Syne",sans-serif', fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                Ready to start earning with {data?.name}?
              </h2>
              <p style={{ fontSize: 13, color: '#6B6B6B', maxWidth: 400, lineHeight: 1.6 }}>
                Choose a package below and get instant access to tasks. Start earning today.
              </p>
            </div>
            <Link
              to={`/categories/${slug}/packages`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', borderRadius: 12, padding: '13px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none', flexShrink: 0, boxShadow: '0 6px 24px rgba(212,168,67,0.3)' }}
            >
              View Packages & Pricing <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>

      </div>
    </>
  );
}