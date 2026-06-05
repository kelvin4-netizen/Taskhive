// src/pages/dashboard/PurchasesPage.jsx
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';

const CATEGORY_ICONS = {
  'Academic Writing':'🎓','Freelancing':'💼','Watching Videos':'▶️',
  'Surveys':'📋','App Testing':'📱','Data Entry':'⌨️',
  'Social Media Promotion':'📣','Crypto Tasks':'₿',
};

const CSS = `
  .pp2-card { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px 20px; transition:all 0.3s; display:flex; align-items:center; gap:14px; }
  .pp2-card:hover { border-color:rgba(212,168,67,0.2); transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.4); }
  .pp2-empty { text-align:center; padding:60px 20px; background:linear-gradient(135deg,#111,#0D0D0D); border:1px dashed rgba(255,255,255,0.07); border-radius:16px; }
  .db-progress { height:4px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden; margin-top:6px; }
  .db-progress-bar { height:100%; background:linear-gradient(90deg,#D4A843,#F0C060); border-radius:99px; }
`;

export default function PurchasesPage() {
  const { data, isLoading } = useQuery('my-purchases', () =>
    api.get('/purchases/my-purchases').then(r => r.data.data.purchases)
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>My Categories</h1>
            <p style={{ fontSize: 13, color: '#5A5A5A' }}>All your purchased task categories.</p>
          </div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', borderRadius: 10, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
            + Browse More
          </Link>
        </div>

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 80, background: 'rgba(255,255,255,0.03)', borderRadius: 14, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {!isLoading && data?.length === 0 && (
          <div className="pp2-empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}><ShoppingBag size={40} style={{ color: '#2A2A2A', margin: '0 auto' }} /></div>
            <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 700, color: '#ccc', marginBottom: 8 }}>No categories yet</div>
            <div style={{ fontSize: 13, color: '#5A5A5A', marginBottom: 20 }}>Purchase a category to start completing tasks and earning.</div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Browse Categories →
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data?.map((p, i) => {
            const pct = p.taskLimit ? Math.min((p.tasksUsed / p.taskLimit) * 100, 100) : 100;
            const icon = CATEGORY_ICONS[p.category.name] || '📂';
            return (
              <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="pp2-card">
                  {/* Icon */}
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{p.category.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>● Active</span>
                        <span style={{ fontSize: 10, background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', color: '#D4A843', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>{p.package.name}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#5A5A5A', marginBottom: 4 }}>
                      {p.isUnlimited ? 'Unlimited tasks available' : `${p.tasksUsed} of ${p.taskLimit} tasks used`}
                    </div>
                    {!p.isUnlimited && (
                      <div className="db-progress">
                        <div className="db-progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/dashboard/tasks/${p.categoryId}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', color: '#D4A843', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(212,168,67,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(212,168,67,0.08)'}
                  >
                    Open <ChevronRight size={12} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}