// src/pages/dashboard/EarningsPage.jsx
import { useQuery } from 'react-query';
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';

const CSS = `
  .ep-stat { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:20px; transition:all 0.3s; }
  .ep-stat:hover { border-color:rgba(212,168,67,0.2); transform:translateY(-2px); }
  .ep-table-wrap { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden; }
  .ep-tr:hover { background:rgba(212,168,67,0.03); }
  .ep-empty { text-align:center; padding:56px 20px; background:linear-gradient(135deg,#111,#0D0D0D); border:1px dashed rgba(255,255,255,0.07); border-radius:16px; }
`;

const STATUS_STYLES = {
  approved: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',  label: 'Approved', Icon: CheckCircle },
  rejected:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  label: 'Rejected', Icon: XCircle    },
  pending:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', label: 'Pending',  Icon: Clock      },
};

export default function EarningsPage() {
  const { data, isLoading } = useQuery('earnings', () =>
    api.get('/users/earnings').then(r => r.data.data)
  );

  const approved = data?.submissions?.filter(s => s.approved === true) || [];
  const pending  = data?.submissions?.filter(s => s.approved === null) || [];
  const rejected = data?.submissions?.filter(s => s.approved === false) || [];

  const stats = [
    { label: 'Total Earned',    value: `$${data?.totalEarned?.toFixed(2) || '0.00'}`, icon: DollarSign,  color: '#D4A843', glow: 'rgba(212,168,67,0.12)' },
    { label: 'Approved Tasks',  value: approved.length,                                icon: CheckCircle, color: '#22C55E', glow: 'rgba(34,197,94,0.12)'  },
    { label: 'Pending Review',  value: pending.length,                                 icon: Clock,       color: '#F59E0B', glow: 'rgba(245,158,11,0.12)' },
    { label: 'Total Submitted', value: data?.submissions?.length || 0,                 icon: TrendingUp,  color: '#3B82F6', glow: 'rgba(59,130,246,0.12)' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div>
          <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>My Earnings</h1>
          <p style={{ fontSize: 13, color: '#5A5A5A' }}>Track your task submissions and payouts.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }} id="ep-stats">
          <style>{`@media(min-width:768px){#ep-stats{grid-template-columns:repeat(4,1fr)!important}}`}</style>
          {stats.map((s, i) => (
            <motion.div key={s.label} className="ep-stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.glow, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        {data?.submissions?.length > 0 ? (
          <motion.div className="ep-table-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: '"Syne",sans-serif', fontSize: 13, fontWeight: 700, color: '#fff' }}>Submission History</span>
              <span style={{ fontSize: 11, color: '#5A5A5A' }}>{data.submissions.length} total</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Task', 'Reward', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, background: 'rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.submissions.map(sub => {
                    const st = sub.approved === true ? STATUS_STYLES.approved : sub.approved === false ? STATUS_STYLES.rejected : STATUS_STYLES.pending;
                    return (
                      <tr key={sub.id} className="ep-tr" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px 16px', color: '#ccc', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.task.title}</td>
                        <td style={{ padding: '12px 16px', color: '#D4A843', fontWeight: 800, fontFamily: '"Syne",sans-serif' }}>${sub.reward}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: st.color, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 20, padding: '3px 10px' }}>
                            <st.Icon size={10} />
                            {st.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#4A4A4A', fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : !isLoading && (
          <div className="ep-empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
            <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 700, color: '#ccc', marginBottom: 8 }}>No earnings yet</div>
            <div style={{ fontSize: 13, color: '#5A5A5A', marginBottom: 20 }}>Complete tasks to start earning money.</div>
            <a href="/dashboard/purchases" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', borderRadius: 10, padding: '10px 20px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
              View My Categories →
            </a>
          </div>
        )}
      </div>
    </>
  );
}