// src/pages/admin/AdminSubmissions.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, Clock, CheckCircle, XCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

const CSS = `
  .as-card { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden; }
  .as-tr:hover { background:rgba(212,168,67,0.03); }
  .as-select { background:#141414; border:1px solid rgba(255,255,255,0.08); color:#888; border-radius:10px; padding:9px 14px; font-size:13px; font-family:inherit; outline:none; cursor:pointer; }
  .as-modal-bg { position:fixed; inset:0; z-index:200; display:flex; align-items:center; justify-content:center; padding:16px; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); }
  .as-modal { background:linear-gradient(135deg,#161616,#111); border:1px solid rgba(255,255,255,0.08); border-radius:20px; width:100%; max-width:520px; max-height:90svh; overflow-y:auto; }
  .as-proof { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:12px 14px; font-size:13px; color:#9A9A9A; line-height:1.65; white-space:pre-wrap; word-break:break-all; }
  .as-skeleton { background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%); background-size:200% 100%; border-radius:6px; animation:as-shimmer 1.5s infinite; }
  @keyframes as-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

const STATUS_STYLES = {
  pending:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  label: 'Pending',  Icon: Clock         },
  approved: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)',   label: 'Approved', Icon: CheckCircle   },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   label: 'Rejected', Icon: XCircle       },
};

function getStatus(sub) {
  if (sub.approved === true)  return 'approved';
  if (sub.approved === false) return 'rejected';
  return 'pending';
}

export default function AdminSubmissions() {
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['admin-submissions', filter, page],
    () => api.get('/admin/submissions', { params: { status: filter || undefined, page, limit: 20 } }).then(r => r.data.data),
    { keepPreviousData: true }
  );

  const reviewMutation = useMutation(
    ({ id, approved }) => api.patch(`/admin/submissions/${id}/review`, { approved }),
    {
      onSuccess: (_, { approved }) => {
        toast.success(approved ? '✓ Submission approved & reward paid!' : '✗ Submission rejected.');
        queryClient.invalidateQueries('admin-submissions');
        setSelected(null);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Action failed.'),
    }
  );

  const tabs = [
    { key: 'pending',  label: 'Pending',  count: data?.counts?.pending  },
    { key: 'approved', label: 'Approved', count: data?.counts?.approved },
    { key: 'rejected', label: 'Rejected', count: data?.counts?.rejected },
    { key: '',         label: 'All'                                       },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div>
          <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Task Submissions</h1>
          <p style={{ fontSize: 13, color: '#5A5A5A' }}>Review and approve user task submissions to release rewards.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setFilter(tab.key); setPage(1); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid',
                transition: 'all 0.2s',
                ...(filter === tab.key
                  ? { background: 'rgba(212,168,67,0.1)', borderColor: 'rgba(212,168,67,0.3)', color: '#D4A843' }
                  : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', color: '#5A5A5A' })
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span style={{ background: filter === tab.key ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="as-card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['User','Task','Reward','Status','Submitted','Actions'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '11px 16px', fontSize: 10, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, background: 'rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        {[120, 160, 50, 70, 80, 80].map((w, j) => (
                          <td key={j} style={{ padding: '14px 16px' }}><div style={{ height: 14, width: w }} className="as-skeleton" /></td>
                        ))}
                      </tr>
                    ))
                  : data?.submissions?.length === 0
                    ? (
                        <tr><td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#5A5A5A', fontSize: 13 }}>
                          No {filter || ''} submissions found.
                        </td></tr>
                      )
                    : data?.submissions?.map((sub, i) => {
                        const st = STATUS_STYLES[getStatus(sub)];
                        return (
                          <motion.tr key={sub.id} className="as-tr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '13px 16px' }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{sub.user?.fullName}</div>
                              <div style={{ fontSize: 10, color: '#5A5A5A', marginTop: 1 }}>{sub.user?.email}</div>
                            </td>
                            <td style={{ padding: '13px 16px', fontSize: 12, color: '#9A9A9A', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.task?.title}</td>
                            <td style={{ padding: '13px 16px', fontFamily: '"Syne",sans-serif', fontSize: 14, fontWeight: 900, color: '#D4A843' }}>${sub.reward}</td>
                            <td style={{ padding: '13px 16px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: st.color, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 20, padding: '3px 9px' }}>
                                <st.Icon size={10} /> {st.label}
                              </span>
                            </td>
                            <td style={{ padding: '13px 16px', fontSize: 11, color: '#5A5A5A', whiteSpace: 'nowrap' }}>{new Date(sub.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '13px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setSelected(sub)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                >
                                  <Eye size={12} /> Review
                                </button>
                                {getStatus(sub) === 'pending' && (
                                  <>
                                    <button onClick={() => reviewMutation.mutate({ id: sub.id, approved: true })} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.08)', color: '#22C55E', fontFamily: 'inherit' }}>
                                      <Check size={12} /> Approve
                                    </button>
                                    <button onClick={() => reviewMutation.mutate({ id: sub.id, approved: false })} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontFamily: 'inherit' }}>
                                      <X size={12} /> Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {data?.pagination?.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: page === 1 ? '#2A2A2A' : '#888', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={15} />
            </button>
            <span style={{ fontSize: 12, color: '#5A5A5A' }}>Page <span style={{ color: '#D4A843', fontWeight: 700 }}>{page}</span> of {data.pagination.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: page === data.pagination.pages ? '#2A2A2A' : '#888', cursor: page === data.pagination.pages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Review modal */}
      <AnimatePresence>
        {selected && (
          <div className="as-modal-bg" onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <motion.div className="as-modal" initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}>
              <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 800, color: '#fff' }}>Review Submission</div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
              </div>
              <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Meta */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'User',    value: selected.user?.fullName },
                    { label: 'Task',    value: selected.task?.title    },
                    { label: 'Reward',  value: `$${selected.reward}`   },
                    { label: 'Date',    value: new Date(selected.createdAt).toLocaleDateString() },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 13px' }}>
                      <div style={{ fontSize: 10, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Proof */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Proof of Completion</div>
                  <div className="as-proof">{selected.proof || 'No proof provided.'}</div>
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Additional Notes</div>
                    <div className="as-proof">{selected.notes}</div>
                  </div>
                )}

                {/* Actions */}
                {getStatus(selected) === 'pending' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                    <button
                      onClick={() => reviewMutation.mutate({ id: selected.id, approved: false })}
                      disabled={reviewMutation.isLoading}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', transition: 'all 0.2s' }}
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      onClick={() => reviewMutation.mutate({ id: selected.id, approved: true })}
                      disabled={reviewMutation.isLoading}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: 'linear-gradient(135deg,#D4A843,#A07820)', border: 'none', color: '#0A0A0A', transition: 'all 0.2s' }}
                    >
                      <Check size={14} /> Approve & Pay
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px', fontSize: 12, color: STATUS_STYLES[getStatus(selected)].color, background: STATUS_STYLES[getStatus(selected)].bg, border: `1px solid ${STATUS_STYLES[getStatus(selected)].border}`, borderRadius: 10 }}>
                    This submission has been {getStatus(selected)}.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}