// src/pages/admin/AdminTasks.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Loader2, DollarSign, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

const CSS = `
  .at-card { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden; }
  .at-select { background:#141414; border:1px solid rgba(255,255,255,0.08); color:#888; border-radius:10px; padding:9px 14px; font-size:13px; font-family:inherit; outline:none; cursor:pointer; }
  .at-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:10px; padding:10px 14px; font-size:13px; font-family:inherit; outline:none; transition:all 0.2s; box-sizing:border-box; }
  .at-input:focus { border-color:rgba(212,168,67,0.4); background:rgba(212,168,67,0.03); }
  .at-input::placeholder { color:#3A3A3A; }
  .at-textarea { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:10px; padding:10px 14px; font-size:13px; font-family:inherit; outline:none; resize:vertical; box-sizing:border-box; transition:all 0.2s; }
  .at-textarea:focus { border-color:rgba(212,168,67,0.4); }
  .at-textarea::placeholder { color:#3A3A3A; }
  .at-label { display:block; font-size:10px; font-weight:700; color:#5A5A5A; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:7px; }
  .at-modal-bg { position:fixed; inset:0; z-index:200; display:flex; align-items:center; justify-content:center; padding:16px; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); }
  .at-modal { background:linear-gradient(135deg,#161616,#111); border:1px solid rgba(255,255,255,0.08); border-radius:20px; width:100%; max-width:600px; max-height:90svh; overflow-y:auto; }
  .at-tr:hover { background:rgba(212,168,67,0.03); }
  .at-skeleton { background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%); background-size:200% 100%; border-radius:6px; animation:at-shimmer 1.5s infinite; }
  @keyframes at-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

function TaskForm({ task, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    categoryId: task?.categoryId || '',
    title: task?.title || '',
    description: task?.description || '',
    instructions: task?.instructions || '',
    reward: task?.reward || '',
    difficulty: task?.difficulty || 'EASY',
    timeLimit: task?.timeLimit || '',
    externalUrl: task?.externalUrl || '',
    tags: task?.tags?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children }) => (
    <div><label className="at-label">{label}</label>{children}</div>
  );

  return (
    <div className="at-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="at-modal" initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}>
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 800, color: '#fff' }}>{task ? 'Edit Task' : 'Create New Task'}</div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Category *">
              <select className="at-input" style={{ cursor: 'pointer' }} value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
                <option value="">Select category...</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Difficulty">
              <select className="at-input" style={{ cursor: 'pointer' }} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </Field>
          </div>
          <Field label="Title *">
            <input className="at-input" placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </Field>
          <Field label="Description *">
            <textarea className="at-textarea" style={{ minHeight: 70 }} placeholder="Brief description shown to users" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </Field>
          <Field label="Instructions *">
            <textarea className="at-textarea" style={{ minHeight: 100 }} placeholder="Step-by-step instructions for completing the task..." value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} required />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Reward ($) *">
              <input type="number" step="0.01" min="0" className="at-input" placeholder="5.00" value={form.reward} onChange={e => setForm(f => ({ ...f, reward: e.target.value }))} required />
            </Field>
            <Field label="Time Limit (min)">
              <input type="number" min="1" className="at-input" placeholder="60" value={form.timeLimit} onChange={e => setForm(f => ({ ...f, timeLimit: e.target.value }))} />
            </Field>
            <Field label="Tags">
              <input className="at-input" placeholder="quick, beginner" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </Field>
          </div>
          <Field label="External URL">
            <input type="url" className="at-input" placeholder="https://..." value={form.externalUrl} onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '12px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: 11, background: loading ? 'rgba(212,168,67,0.5)' : 'linear-gradient(135deg,#D4A843,#A07820)', border: 'none', color: '#0A0A0A', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminTasks() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: categories } = useQuery('categories', () => api.get('/categories').then(r => r.data.data.categories));
  const { data: tasksData, isLoading } = useQuery(
    ['admin-tasks', categoryFilter],
    () => api.get(categoryFilter ? `/tasks/category/${categoryFilter}` : '/admin/tasks', { params: { limit: 50 } }).then(r => r.data.data),
  );

  const createMutation = useMutation((data) => api.post('/admin/tasks', data), {
    onSuccess: () => { toast.success('Task created.'); queryClient.invalidateQueries('admin-tasks'); setShowForm(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });
  const updateMutation = useMutation(({ id, data }) => api.put(`/admin/tasks/${id}`, data), {
    onSuccess: () => { toast.success('Task updated.'); queryClient.invalidateQueries('admin-tasks'); setEditingTask(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });
  const deleteMutation = useMutation((id) => api.delete(`/admin/tasks/${id}`), {
    onSuccess: () => { toast.success('Task deleted.'); queryClient.invalidateQueries('admin-tasks'); },
  });

  const tasks = tasksData?.tasks || [];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Task Management</h1>
            <p style={{ fontSize: 13, color: '#5A5A5A' }}>{tasks.length} tasks loaded.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', border: 'none', borderRadius: 11, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={15} /> New Task
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={13} style={{ color: '#5A5A5A' }} />
          <select className="at-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="at-card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Task','Category','Reward','Difficulty','Status','Actions'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '11px 16px', fontSize: 10, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, background: 'rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        {[180, 100, 50, 60, 60, 80].map((w, j) => (
                          <td key={j} style={{ padding: '14px 16px' }}><div style={{ height: 14, width: w }} className="at-skeleton" /></td>
                        ))}
                      </tr>
                    ))
                  : tasks.map((task, i) => (
                      <motion.tr key={task.id} className="at-tr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#ddd' }}>{task.title}</div>
                          <div style={{ fontSize: 11, color: '#5A5A5A', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{task.description}</div>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: 11, color: '#6B6B6B' }}>{task.category?.name || '—'}</td>
                        <td style={{ padding: '13px 16px', fontFamily: '"Syne",sans-serif', fontSize: 14, fontWeight: 900, color: '#D4A843' }}>${task.reward}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 9px', ...(task.difficulty === 'EASY' ? { color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' } : task.difficulty === 'MEDIUM' ? { color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' } : { color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }) }}>
                            {task.difficulty}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 9px', ...(task.status === 'ACTIVE' ? { color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' } : { color: '#5A5A5A', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }) }}>
                            {task.status}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingTask(task)} style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', color: '#D4A843', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => { if (window.confirm('Delete this task?')) deleteMutation.mutate(task.id); }} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(showForm || editingTask) && (
          <TaskForm
            task={editingTask}
            categories={categories}
            onClose={() => { setShowForm(false); setEditingTask(null); }}
            onSave={editingTask
              ? (data) => updateMutation.mutateAsync({ id: editingTask.id, data })
              : (data) => createMutation.mutateAsync(data)
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}