// src/pages/dashboard/NotificationsPage.jsx
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Bell, CheckCheck, Info, AlertCircle, Gift, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/services/api';

const CSS = `
  .np-card { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:13px; padding:16px 18px; transition:all 0.25s; display:flex; align-items:flex-start; gap:13px; }
  .np-card:hover { border-color:rgba(255,255,255,0.1); }
  .np-card.unread { border-color:rgba(212,168,67,0.15); background:linear-gradient(135deg,rgba(212,168,67,0.04),#111); }
  .np-empty { text-align:center; padding:60px 20px; background:linear-gradient(135deg,#111,#0D0D0D); border:1px dashed rgba(255,255,255,0.07); border-radius:16px; }
  .np-dot { width:6px; height:6px; border-radius:50%; background:#D4A843; flex-shrink:0; margin-top:5px; animation: np-pulse 2s ease-in-out infinite; }
  @keyframes np-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
`;

const NOTIF_ICONS = {
  info:    { icon: Info,         color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)'  },
  warning: { icon: AlertCircle,  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  success: { icon: Gift,         color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)'  },
  default: { icon: Zap,          color: '#D4A843', bg: 'rgba(212,168,67,0.1)', border: 'rgba(212,168,67,0.2)' },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hrs  < 24)  return `${hrs}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery('notifications', () =>
    api.get('/notifications').then(r => r.data.data.notifications)
  );

  const markAllRead = useMutation(
    () => api.patch('/notifications/read-all'),
    {
      onSuccess: () => {
        toast.success('All marked as read');
        queryClient.invalidateQueries('notifications');
      }
    }
  );

  const unread = data?.filter(n => !n.isRead) || [];
  const read   = data?.filter(n =>  n.isRead) || [];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Notifications</h1>
            <p style={{ fontSize: 13, color: '#5A5A5A' }}>
              {unread.length > 0
                ? <span><span style={{ color: '#D4A843', fontWeight: 600 }}>{unread.length} unread</span> notification{unread.length > 1 ? 's' : ''}</span>
                : 'You\'re all caught up!'
              }
            </p>
          </div>
          {unread.length > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', color: '#D4A843', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,168,67,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,168,67,0.08)'}
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 72, background: 'rgba(255,255,255,0.03)', borderRadius: 13, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !data?.length && (
          <div className="np-empty">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Bell size={22} style={{ color: '#3A3A3A' }} />
            </div>
            <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 700, color: '#ccc', marginBottom: 6 }}>No notifications yet</div>
            <div style={{ fontSize: 13, color: '#5A5A5A' }}>We'll notify you about earnings, tasks, and updates.</div>
          </div>
        )}

        {/* Unread */}
        {unread.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="np-dot" style={{ animation: 'none', opacity: 1 }} />
              New · {unread.length}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {unread.map((notif, i) => {
                const style = NOTIF_ICONS[notif.type] || NOTIF_ICONS.default;
                const IconComp = style.icon;
                return (
                  <motion.div key={notif.id} className="np-card unread" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: style.bg, border: `1px solid ${style.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconComp size={16} style={{ color: style.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{notif.title}</div>
                        <div style={{ fontSize: 10, color: '#4A4A4A', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(notif.createdAt)}</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5 }}>{notif.message}</div>
                    </div>
                    <div className="np-dot" style={{ marginTop: 8 }} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Read */}
        {read.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#3A3A3A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
              Earlier · {read.length}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {read.map((notif, i) => {
                const style = NOTIF_ICONS[notif.type] || NOTIF_ICONS.default;
                const IconComp = style.icon;
                return (
                  <motion.div key={notif.id} className="np-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.5 }}>
                      <IconComp size={16} style={{ color: '#5A5A5A' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B', lineHeight: 1.3 }}>{notif.title}</div>
                        <div style={{ fontSize: 10, color: '#3A3A3A', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(notif.createdAt)}</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#4A4A4A', lineHeight: 1.5 }}>{notif.message}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </>
  );
}