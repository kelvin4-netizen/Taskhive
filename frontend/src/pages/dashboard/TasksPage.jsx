// src/pages/dashboard/TasksPage.jsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Clock, DollarSign, ChevronLeft, ChevronRight,
  CheckCircle, AlertCircle, ExternalLink, X, Loader2,
  Send, ListTodo, Filter, Zap, Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

const CSS = `
  .tp-card { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px; display:flex; flex-direction:column; transition:all 0.3s; }
  .tp-card:hover { border-color:rgba(212,168,67,0.2); transform:translateY(-3px); box-shadow:0 10px 30px rgba(0,0,0,0.5); }
  .tp-input { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:10px; padding:10px 14px; font-size:13px; font-family:inherit; outline:none; transition:all 0.2s; }
  .tp-input:focus { border-color:rgba(212,168,67,0.4); background:rgba(212,168,67,0.03); }
  .tp-input::placeholder { color:#3A3A3A; }
  .tp-select { background:#141414; border:1px solid rgba(255,255,255,0.08); color:#888; border-radius:10px; padding:10px 14px; font-size:13px; font-family:inherit; outline:none; cursor:pointer; }
  .tp-modal-bg { position:fixed; inset:0; z-index:200; display:flex; align-items:center; justify-content:center; padding:16px; background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); }
  .tp-modal { background:linear-gradient(135deg,#161616,#111); border:1px solid rgba(255,255,255,0.08); border-radius:20px; width:100%; max-width:540px; max-height:90svh; overflow-y:auto; }
  .tp-textarea { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:10px; padding:11px 14px; font-size:13px; font-family:inherit; outline:none; resize:vertical; min-height:90px; transition:all 0.2s; box-sizing:border-box; }
  .tp-textarea:focus { border-color:rgba(212,168,67,0.4); }
  .tp-textarea::placeholder { color:#3A3A3A; }
  .tp-btn-gold { background:linear-gradient(135deg,#D4A843,#A07820); color:#0A0A0A; border:none; border-radius:11px; padding:12px 20px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity 0.2s; width:100%; }
  .tp-btn-gold:disabled { opacity:0.55; cursor:not-allowed; }
  .tp-skeleton { background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%); background-size:200% 100%; border-radius:10px; animation:tp-shimmer 1.5s infinite; }
  @keyframes tp-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .tp-diff-easy   { color:#22C55E; background:rgba(34,197,94,0.1);   border:1px solid rgba(34,197,94,0.2);   border-radius:20px; padding:2px 9px; font-size:10px; font-weight:700; }
  .tp-diff-medium { color:#F59E0B; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); border-radius:20px; padding:2px 9px; font-size:10px; font-weight:700; }
  .tp-diff-hard   { color:#EF4444; background:rgba(239,68,68,0.1);   border:1px solid rgba(239,68,68,0.2);   border-radius:20px; padding:2px 9px; font-size:10px; font-weight:700; }
  .tp-status-approved { color:#22C55E; background:rgba(34,197,94,0.08);   border:1px solid rgba(34,197,94,0.2);   border-radius:8px; padding:8px 12px; font-size:11px; font-weight:700; text-align:center; }
  .tp-status-rejected { color:#EF4444; background:rgba(239,68,68,0.08);   border:1px solid rgba(239,68,68,0.2);   border-radius:8px; padding:8px 12px; font-size:11px; font-weight:700; text-align:center; }
  .tp-status-pending  { color:#F59E0B; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); border-radius:8px; padding:8px 12px; font-size:11px; font-weight:700; text-align:center; }
  .tp-view-btn { background:rgba(212,168,67,0.07); border:1px solid rgba(212,168,67,0.15); color:#D4A843; border-radius:9px; padding:8px 12px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s; width:100%; margin-top:auto; }
  .tp-view-btn:hover { background:rgba(212,168,67,0.13); border-color:rgba(212,168,67,0.3); }
  .tp-empty { text-align:center; padding:56px 20px; background:linear-gradient(135deg,#111,#0D0D0D); border:1px dashed rgba(255,255,255,0.07); border-radius:16px; }
`;

function DiffBadge({ level }) {
  const cls = { EASY: 'tp-diff-easy', MEDIUM: 'tp-diff-medium', HARD: 'tp-diff-hard' };
  return <span className={cls[level] || 'tp-diff-easy'}>{level}</span>;
}

function TaskModal({ task, onClose, onSubmit, isSubmitting }) {
  const [proof, setProof] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="tp-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="tp-modal"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Modal header */}
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <DiffBadge level={task.difficulty} />
              {task.timeLimit && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5A5A5A' }}>
                  <Clock size={10} /> {task.timeLimit} min
                </span>
              )}
            </div>
            <h2 style={{ fontFamily: '"Syne",sans-serif', fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>{task.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* Reward */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(212,168,67,0.07)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,168,67,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} style={{ color: '#D4A843' }} />
            </div>
            <div>
              <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 900, color: '#D4A843', lineHeight: 1 }}>${task.reward}</div>
              <div style={{ fontSize: 10, color: '#7A6020', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reward on approval</div>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={10} /> Instructions
            </div>
            <pre style={{ fontFamily: 'inherit', fontSize: 13, color: '#9A9A9A', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{task.instructions}</pre>
          </div>

          {/* External link */}
          {task.externalUrl && (
            <a
              href={task.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#60A5FA', textDecoration: 'none', marginBottom: 16 }}
            >
              <ExternalLink size={13} /> Open Task Link
            </a>
          )}

          {/* Submission status or form */}
          {task.userSubmission ? (
            <div className={
              task.userSubmission.approved === true ? 'tp-status-approved' :
              task.userSubmission.approved === false ? 'tp-status-rejected' :
              'tp-status-pending'
            }>
              {task.userSubmission.approved === true  && <><CheckCircle size={14} style={{ display: 'inline', marginRight: 6 }} />Approved — you earned ${task.reward}</>}
              {task.userSubmission.approved === false && <><AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />Submission was rejected</>}
              {task.userSubmission.approved === null  && <><Clock size={14} style={{ display: 'inline', marginRight: 6 }} />Under review — results in 24–48h</>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                  Proof of Completion *
                </label>
                <textarea
                  className="tp-textarea"
                  placeholder="Paste screenshot URL, transaction ID, username, or describe what you completed..."
                  value={proof}
                  onChange={e => setProof(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                  Additional Notes (optional)
                </label>
                <input
                  className="tp-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="Any extra info for the reviewer..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              <button
                className="tp-btn-gold"
                onClick={() => onSubmit({ taskId: task.id, proof, notes })}
                disabled={isSubmitting || !proof.trim()}
                style={{ marginTop: 4 }}
              >
                {isSubmitting
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                  : <><Send size={14} /> Submit for Review</>
                }
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function TasksPage() {
  const { categoryId } = useParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  const { data, isLoading, isError } = useQuery(
    ['tasks', categoryId, page, search, difficulty],
    () => api.get(`/tasks/category/${categoryId}`, {
      params: { page, limit: 12, search: search || undefined, difficulty: difficulty || undefined },
    }).then(r => r.data.data),
    { keepPreviousData: true }
  );

  const submitMutation = useMutation(
    ({ taskId, proof, notes }) => api.post(`/tasks/${taskId}/submit`, { proof, notes }),
    {
      onSuccess: () => {
        toast.success('Submitted! Awaiting review.');
        setSelectedTask(null);
        queryClient.invalidateQueries(['tasks', categoryId]);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Submission failed.');
      },
    }
  );

  // Stats
  const total    = data?.tasks?.length || 0;
  const done     = data?.tasks?.filter(t => t.userSubmission?.approved === true).length || 0;
  const pending  = data?.tasks?.filter(t => t.userSubmission?.approved === null).length || 0;
  const available= data?.tasks?.filter(t => !t.userSubmission).length || 0;

  if (isError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, textAlign: 'center', gap: 12 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle size={24} style={{ color: '#EF4444' }} />
      </div>
      <h2 style={{ fontFamily: '"Syne",sans-serif', fontSize: 18, fontWeight: 800, color: '#fff' }}>Access Denied</h2>
      <p style={{ fontSize: 13, color: '#5A5A5A', maxWidth: 280 }}>You need an active purchase for this category to view its tasks.</p>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginTop: 8 }}>
        Browse Packages →
      </Link>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#5A5A5A', textDecoration: 'none', marginBottom: 8 }}>
              <ChevronLeft size={13} /> Dashboard
            </Link>
            <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 3 }}>Task Dashboard</h1>
            {data?.purchase && (
              <p style={{ fontSize: 12, color: '#5A5A5A' }}>
                {data.purchase.isUnlimited
                  ? '∞ Unlimited access'
                  : `${data.purchase.tasksUsed} / ${data.purchase.taskLimit} tasks used`
                }
              </p>
            )}
          </div>

          {/* Progress bar (desktop) */}
          {data?.purchase?.taskLimit && !data?.purchase?.isUnlimited && (
            <div style={{ minWidth: 160 }} id="tp-progress-bar">
              <style>{`@media(max-width:640px){#tp-progress-bar{display:none!important}}`}</style>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5A5A5A', marginBottom: 5 }}>
                <span>Tasks Used</span>
                <span style={{ color: '#D4A843', fontWeight: 700 }}>{data.purchase.tasksUsed}/{data.purchase.taskLimit}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg,#D4A843,#F0C060)', borderRadius: 99, width: `${Math.min((data.purchase.tasksUsed / data.purchase.taskLimit) * 100, 100)}%`, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        {!isLoading && total > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }} id="tp-stats">
            <style>{`@media(max-width:480px){#tp-stats{grid-template-columns:repeat(2,1fr)!important}}`}</style>
            {[
              { label: 'Total Tasks',  value: total,     color: '#D4A843', bg: 'rgba(212,168,67,0.08)' },
              { label: 'Available',    value: available, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
              { label: 'Approved',     value: done,      color: '#22C55E', bg: 'rgba(34,197,94,0.08)'  },
              { label: 'In Review',    value: pending,   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 9.5, color: '#5A5A5A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#3A3A3A', pointerEvents: 'none' }} />
            <input
              className="tp-input"
              style={{ width: '100%', paddingLeft: 36, boxSizing: 'border-box' }}
              placeholder="Search tasks..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="tp-select"
            value={difficulty}
            onChange={e => { setDifficulty(e.target.value); setPage(1); }}
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Task grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ height: 180, borderRadius: 14 }} className="tp-skeleton" />
            ))}
          </div>
        ) : data?.tasks?.length === 0 ? (
          <div className="tp-empty">
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 700, color: '#ccc', marginBottom: 6 }}>No tasks found</div>
            <div style={{ fontSize: 13, color: '#5A5A5A' }}>Try adjusting your search or difficulty filter.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
            {data.tasks.map((task, i) => (
              <motion.div
                key={task.id}
                className="tp-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Card top */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <DiffBadge level={task.difficulty} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 900, color: '#D4A843', flexShrink: 0 }}>
                    <DollarSign size={13} />{task.reward}
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#ddd', lineHeight: 1.4, marginBottom: 8, flex: 1 }}>
                  {task.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: 11.5, color: '#5A5A5A', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {task.description}
                </p>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  {task.timeLimit && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5A5A5A' }}>
                      <Clock size={11} /> {task.timeLimit}m
                    </span>
                  )}
                  {task.userSubmission?.approved === true && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#22C55E' }}>
                      <Trophy size={11} /> Earned
                    </span>
                  )}
                </div>

                {/* Action */}
                {task.userSubmission ? (
                  <div className={
                    task.userSubmission.approved === true  ? 'tp-status-approved' :
                    task.userSubmission.approved === false ? 'tp-status-rejected' :
                    'tp-status-pending'
                  } style={{ marginTop: 'auto', fontSize: 11 }}>
                    {task.userSubmission.approved === true  && '✦ Approved'}
                    {task.userSubmission.approved === false && '✗ Rejected'}
                    {task.userSubmission.approved === null  && '⏳ Pending Review'}
                  </div>
                ) : (
                  <button className="tp-view-btn" onClick={() => setSelectedTask(task)}>
                    <Zap size={12} /> View & Submit
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination?.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: page === 1 ? '#2A2A2A' : '#888', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 12, color: '#5A5A5A' }}>Page <span style={{ color: '#D4A843', fontWeight: 700 }}>{page}</span> of {data.pagination.pages}</span>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: page === data.pagination.pages ? '#2A2A2A' : '#888', cursor: page === data.pagination.pages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Task modal */}
        <AnimatePresence>
          {selectedTask && (
            <TaskModal
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onSubmit={submitMutation.mutate}
              isSubmitting={submitMutation.isLoading}
            />
          )}
        </AnimatePresence>

      </div>
    </>
  );
}