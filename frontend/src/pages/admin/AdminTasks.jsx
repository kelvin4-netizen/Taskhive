// src/pages/admin/AdminTasks.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Loader2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
      await onSave(payload);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl card p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold">{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="text-muted hover:text-text"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Category *</label>
              <select className="input-field" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
                <option value="">Select category...</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Difficulty</label>
              <select className="input-field" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Title *</label>
            <input className="input-field" placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Description *</label>
            <textarea className="input-field h-20 resize-none" placeholder="Brief description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Instructions *</label>
            <textarea className="input-field h-28 resize-none" placeholder="Step-by-step instructions for the user..." value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Reward ($) *</label>
              <input type="number" step="0.01" min="0" className="input-field" placeholder="5.00" value={form.reward} onChange={e => setForm(f => ({ ...f, reward: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Time Limit (min)</label>
              <input type="number" min="1" className="input-field" placeholder="60" value={form.timeLimit} onChange={e => setForm(f => ({ ...f, timeLimit: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Tags</label>
              <input className="input-field" placeholder="quick, beginner" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">External URL</label>
            <input type="url" className="input-field" placeholder="https://..." value={form.externalUrl} onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-gold flex-1 flex items-center justify-center gap-2 py-3">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
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

  const { data: categories } = useQuery('categories', () =>
    api.get('/categories').then(r => r.data.data.categories)
  );

  const { data: tasksData, isLoading } = useQuery(
    ['admin-tasks', categoryFilter],
    () => {
      const url = categoryFilter ? `/tasks/category/${categoryFilter}` : '/admin/tasks';
      return api.get(url, { params: { limit: 50 } }).then(r => r.data.data);
    }
  );

  const createMutation = useMutation(
    (data) => api.post('/admin/tasks', data),
    {
      onSuccess: () => {
        toast.success('Task created.');
        queryClient.invalidateQueries('admin-tasks');
        setShowForm(false);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/admin/tasks/${id}`, data),
    {
      onSuccess: () => {
        toast.success('Task updated.');
        queryClient.invalidateQueries('admin-tasks');
        setEditingTask(null);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/tasks/${id}`),
    {
      onSuccess: () => {
        toast.success('Task deleted.');
        queryClient.invalidateQueries('admin-tasks');
      },
    }
  );

  const tasks = tasksData?.tasks || [];

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Task Management</h1>
          <p className="text-muted text-sm mt-1">{tasks.length} tasks</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm">
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="flex gap-3">
        <select className="input-field w-auto px-4 py-2.5 text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted uppercase tracking-wider border-b border-subtle bg-surface-2">
              <th className="text-left px-5 py-3 font-semibold">Task</th>
              <th className="text-left px-5 py-3 font-semibold">Category</th>
              <th className="text-left px-5 py-3 font-semibold">Reward</th>
              <th className="text-left px-5 py-3 font-semibold">Difficulty</th>
              <th className="text-left px-5 py-3 font-semibold">Status</th>
              <th className="text-right px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle/40">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-subtle rounded" /></td>
                    ))}
                  </tr>
                ))
              : tasks.map(task => (
                  <tr key={task.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted line-clamp-1 mt-0.5">{task.description}</p>
                    </td>
                    <td className="px-5 py-4 text-muted text-xs">{task.category?.name || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="text-gold font-bold flex items-center gap-1">
                        <DollarSign size={13} />{task.reward}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        task.difficulty === 'EASY' ? 'text-green-400 bg-green-400/10' :
                        task.difficulty === 'MEDIUM' ? 'text-yellow-400 bg-yellow-400/10' :
                        'text-red-400 bg-red-400/10'
                      }`}>
                        {task.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        task.status === 'ACTIVE' ? 'text-green-400 bg-green-400/10' : 'text-muted bg-subtle/50'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setEditingTask(task)} className="text-muted hover:text-gold transition-colors p-1">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(task.id)} className="text-muted hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
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
    </div>
  );
}
