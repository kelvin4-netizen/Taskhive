// src/pages/dashboard/DashboardHome.jsx
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, ListTodo, TrendingUp, ArrowRight, Lock, Zap, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

const CATEGORY_ICONS = {
  'Academic Writing': '🎓', 'Freelancing': '💼', 'Watching Videos': '▶️',
  'Surveys': '📋', 'App Testing': '📱', 'Data Entry': '⌨️',
  'Social Media Promotion': '📣', 'Crypto Tasks': '₿',
};

const CSS = `
  .dh-stat { position:relative; overflow:hidden; background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:20px; transition:all 0.3s; }
  .dh-stat:hover { border-color:rgba(212,168,67,0.2); transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,0.5); }
  .dh-stat-glow { position:absolute; top:-30px; right:-30px; width:100px; height:100px; border-radius:50%; filter:blur(30px); opacity:0.12; }
  .dh-cat-card { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px; transition:all 0.3s; cursor:pointer; text-decoration:none; display:block; }
  .dh-cat-card:hover { border-color:rgba(212,168,67,0.25); transform:translateY(-3px); box-shadow:0 10px 30px rgba(0,0,0,0.4); }
  .dh-browse-card { background:linear-gradient(135deg,#111,#0D0D0D); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:14px; transition:all 0.25s; text-decoration:none; display:block; }
  .dh-browse-card:hover { border-color:rgba(212,168,67,0.2); background:linear-gradient(135deg,#161616,#111); }
  .dh-section-title { font-family:"Syne",sans-serif; font-size:15px; font-weight:700; color:#fff; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
  .dh-empty { text-align:center; padding:48px 20px; background:linear-gradient(135deg,#111,#0D0D0D); border:1px dashed rgba(255,255,255,0.08); border-radius:16px; }
`;

const StatCard = ({ label, value, icon: Icon, glowColor, sub, delay }) => (
  <motion.div
    className="dh-stat"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <div className="dh-stat-glow" style={{ background: glowColor }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: `${glowColor}20`, border: `1px solid ${glowColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={17} style={{ color: glowColor }} />
      </div>
      {sub && <span style={{ fontSize: 10, color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>{sub}</span>}
    </div>
    <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 11, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
  </motion.div>
);

export default function DashboardHome() {
  const { user } = useAuthStore();

  const { data: purchases } = useQuery('my-purchases', () =>
    api.get('/purchases/my-purchases').then(r => r.data.data.purchases)
  );
  const { data: categories } = useQuery('categories', () =>
    api.get('/categories').then(r => r.data.data.categories)
  );
  const { data: earnings } = useQuery('earnings', () =>
    api.get('/users/earnings').then(r => r.data.data)
  );

  const purchasedCategoryIds = new Set(purchases?.map(p => p.categoryId) || []);
  const firstName = user?.fullName?.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.08) 0%, rgba(212,168,67,0.03) 50%, transparent 100%)', border: '1px solid rgba(212,168,67,0.12)', borderRadius: 18, padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ fontSize: 20, fontFamily: '"Syne",sans-serif', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              {greeting}, {firstName} 👋
            </div>
            <div style={{ fontSize: 13, color: '#6B6B6B' }}>
              Ready to earn today? You have <span style={{ color: '#D4A843', fontWeight: 600 }}>{purchases?.length || 0} active {purchases?.length === 1 ? 'category' : 'categories'}</span>.
            </div>
          </div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', borderRadius: 11, padding: '10px 18px', fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
            <Zap size={13} /> Explore More Tasks
          </Link>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }} id="dh-stats-grid">
          <style>{`@media(min-width:768px){#dh-stats-grid{grid-template-columns:repeat(4,1fr)!important}}`}</style>
          <StatCard label="Wallet Balance"    value={`$${user?.walletBalance?.toFixed(2) || '0.00'}`}     icon={DollarSign}  glowColor="#D4A843" sub="+0%"  delay={0}    />
          <StatCard label="Total Earned"      value={`$${earnings?.totalEarned?.toFixed(2) || '0.00'}`}   icon={TrendingUp}  glowColor="#10B981"            delay={0.06} />
          <StatCard label="Active Categories" value={purchases?.length || 0}                              icon={ShoppingBag} glowColor="#3B82F6"            delay={0.12} />
          <StatCard label="Tasks Completed"   value={earnings?.submissions?.length || 0}                  icon={ListTodo}    glowColor="#8B5CF6"            delay={0.18} />
        </div>

        {/* Active categories */}
        {purchases && purchases.length > 0 && (
          <div>
            <div className="dh-section-title">
              <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg,#D4A843,#A07820)', borderRadius: 2 }} />
              My Active Categories
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#5A5A5A', fontWeight: 500 }}>{purchases.length} active</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }} id="dh-purchases-grid">
              <style>{`@media(min-width:640px){#dh-purchases-grid{grid-template-columns:repeat(2,1fr)!important}} @media(min-width:1024px){#dh-purchases-grid{grid-template-columns:repeat(3,1fr)!important}}`}</style>
              {purchases.map((purchase, i) => {
                const pct = purchase.taskLimit ? Math.min((purchase.tasksUsed / purchase.taskLimit) * 100, 100) : 100;
                const icon = CATEGORY_ICONS[purchase.category.name] || '📂';
                return (
                  <motion.div key={purchase.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/dashboard/tasks/${purchase.categoryId}`} className="dh-cat-card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{purchase.category.name}</div>
                            <div style={{ fontSize: 11, color: '#5A5A5A', marginTop: 2 }}>{purchase.package.name} Plan</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '3px 8px', fontSize: 10, color: '#22C55E', fontWeight: 700, flexShrink: 0 }}>
                          ● Active
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: '#5A5A5A' }}>
                          {purchase.isUnlimited ? 'Unlimited tasks' : `${purchase.tasksUsed} / ${purchase.taskLimit} tasks used`}
                        </span>
                        <span style={{ fontSize: 11, color: '#D4A843', fontWeight: 600 }}>{purchase.isUnlimited ? '∞' : `${Math.round(pct)}%`}</span>
                      </div>
                      <div className="db-progress">
                        <div className="db-progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, color: '#D4A843', fontSize: 12, fontWeight: 600 }}>
                        <span>Start Tasks</span>
                        <ArrowRight size={12} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Browse categories */}
        <div>
          <div className="dh-section-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg,#3B82F6,#6366F1)', borderRadius: 2 }} />
              Browse Categories
            </div>
            <Link to="/" style={{ fontSize: 11, color: '#5A5A5A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {!categories?.length && (
            <div className="dh-empty">
              <div style={{ fontSize: 32, marginBottom: 10 }}>🗂️</div>
              <div style={{ color: '#5A5A5A', fontSize: 13 }}>No categories available yet.</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }} id="dh-cat-grid">
            <style>{`@media(min-width:640px){#dh-cat-grid{grid-template-columns:repeat(3,1fr)!important}} @media(min-width:1024px){#dh-cat-grid{grid-template-columns:repeat(4,1fr)!important}}`}</style>
            {categories?.map((cat, i) => {
              const isPurchased = purchasedCategoryIds.has(cat.id);
              const icon = CATEGORY_ICONS[cat.name] || '📂';
              return (
                <motion.div key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <Link
                    to={isPurchased ? `/dashboard/tasks/${cat.id}` : `/categories/${cat.slug}/packages`}
                    className="dh-browse-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{icon}</span>
                      {isPurchased
                        ? <span style={{ fontSize: 9, background: 'rgba(212,168,67,0.12)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 20, padding: '2px 6px', fontWeight: 700 }}>OWNED</span>
                        : <Lock size={11} style={{ color: '#3A3A3A' }} />
                      }
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', marginBottom: 3, lineHeight: 1.3 }}>{cat.name}</div>
                    <div style={{ fontSize: 10, color: '#D4A843', fontWeight: 600 }}>{cat.estimatedEarn}</div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
}