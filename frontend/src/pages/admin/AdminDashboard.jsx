// src/pages/admin/AdminDashboard.jsx
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Users, DollarSign, ShoppingBag, Phone, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import api from '@/services/api';

const CSS = `
  .ad-stat { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:20px; position:relative; overflow:hidden; transition:all 0.3s; }
  .ad-stat:hover { border-color:rgba(212,168,67,0.2); transform:translateY(-2px); }
  .ad-stat-glow { position:absolute; top:-30px; right:-30px; width:90px; height:90px; border-radius:50%; filter:blur(25px); opacity:0.15; pointer-events:none; }
  .ad-card { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:16px; }
  .ad-tr:hover { background:rgba(212,168,67,0.03); }
  .ad-bar { background:rgba(212,168,67,0.15); border-radius:3px; transition:height 0.3s; cursor:pointer; position:relative; }
  .ad-bar:hover { background:rgba(212,168,67,0.35); }
  .ad-skeleton { background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%); background-size:200% 100%; border-radius:12px; animation:ad-shimmer 1.5s infinite; }
  @keyframes ad-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

const STATS = [
  { key: 'totalUsers',         label: 'Total Users',    icon: Users,      color: '#3B82F6' },
  { key: 'activeUsers',        label: 'Active Users',   icon: Activity,   color: '#22C55E' },
  { key: 'totalRevenue',       label: 'Total Revenue',  icon: DollarSign, color: '#D4A843', prefix: '$' },
  { key: 'totalPurchases',     label: 'Purchases',      icon: ShoppingBag,color: '#8B5CF6' },
  { key: 'totalTasks',         label: 'Active Tasks',   icon: TrendingUp, color: '#F59E0B' },
  { key: 'totalSubscriptions', label: 'Phone Subs',     icon: Phone,      color: '#EC4899' },
];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery('admin-analytics',
    () => api.get('/admin/analytics').then(r => r.data.data),
    { staleTime: 60000 }
  );

  const { overview, recentPayments, recentUsers, revenueChart } = data || {};
  const maxRevenue = Math.max(...(revenueChart?.map(d => d.revenue) || [1]), 1);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div>
          <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Platform Overview</h1>
          <p style={{ fontSize: 13, color: '#5A5A5A' }}>Live metrics and activity across TaskHive.</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }} id="ad-stats">
          <style>{`@media(min-width:768px){#ad-stats{grid-template-columns:repeat(3,1fr)!important}} @media(min-width:1024px){#ad-stats{grid-template-columns:repeat(6,1fr)!important}}`}</style>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 110 }} className="ad-skeleton" />)
            : STATS.map((s, i) => {
                const raw = overview?.[s.key] ?? 0;
                const val = s.prefix ? `${s.prefix}${typeof raw === 'number' ? raw.toFixed(0) : raw}` : raw?.toLocaleString();
                return (
                  <motion.div key={s.key} className="ad-stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="ad-stat-glow" style={{ background: s.color }} />
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <s.icon size={15} style={{ color: s.color }} />
                    </div>
                    <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{val}</div>
                    <div style={{ fontSize: 10, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</div>
                  </motion.div>
                );
              })
          }
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} id="ad-mid">
          <style>{`@media(min-width:1024px){#ad-mid{grid-template-columns:2fr 1fr!important}}`}</style>

          {/* Revenue chart */}
          <div className="ad-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>Revenue — Last 30 Days</div>
              <div style={{ fontSize: 11, color: '#5A5A5A' }}>Daily breakdown</div>
            </div>
            {isLoading ? (
              <div style={{ height: 128 }} className="ad-skeleton" />
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 128 }}>
                  {revenueChart?.map((day, i) => (
                    <div
                      key={i}
                      className="ad-bar"
                      title={`${day.date}: $${day.revenue?.toFixed(2)}`}
                      style={{ flex: 1, height: `${Math.max((day.revenue / maxRevenue) * 100, 4)}%` }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4A4A4A', marginTop: 8 }}>
                  <span>30 days ago</span><span>Today</span>
                </div>
              </>
            )}
          </div>

          {/* Recent users */}
          <div className="ad-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Recent Users
              <ArrowUpRight size={14} style={{ color: '#5A5A5A' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: 40 }} className="ad-skeleton" />)
                : recentUsers?.map(user => (
                    <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                        {user.fullName?.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName}</div>
                        <div style={{ fontSize: 10, color: '#5A5A5A' }}>{user.country}</div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, ...(user.status === 'ACTIVE' ? { color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' } : { color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }) }}>
                        {user.status === 'PENDING_VERIFICATION' ? 'PENDING' : user.status}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="ad-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: '"Syne",sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>Recent Transactions</span>
            <span style={{ fontSize: 11, color: '#5A5A5A' }}>{recentPayments?.length || 0} shown</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['User','Amount','Method','Status','Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, background: 'rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} style={{ padding: '12px 16px' }}><div style={{ height: 16 }} className="ad-skeleton" /></td></tr>
                    ))
                  : recentPayments?.map(p => (
                      <tr key={p.id} className="ad-tr" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{p.user.fullName}</div>
                          <div style={{ fontSize: 11, color: '#5A5A5A' }}>{p.user.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: '"Syne",sans-serif', fontSize: 14, fontWeight: 900, color: '#D4A843' }}>${p.amount?.toFixed(2)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2px 8px', color: '#6B6B6B', fontWeight: 600 }}>{p.method}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 8px', ...(p.status === 'COMPLETED' ? { color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' } : p.status === 'PENDING' ? { color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' } : { color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }) }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 11, color: '#4A4A4A', whiteSpace: 'nowrap' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}