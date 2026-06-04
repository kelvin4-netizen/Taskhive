// src/pages/admin/AdminCategories.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategories() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', estimatedEarn: '' });
  const queryClient = useQueryClient();
  const { data: categories } = useQuery('categories', () => api.get('/categories').then(r => r.data.data.categories));

  const createMutation = useMutation(
    (data) => api.post('/admin/categories', data),
    {
      onSuccess: () => { toast.success('Category created.'); queryClient.invalidateQueries('categories'); setShowForm(false); setForm({ name:'',slug:'',description:'',estimatedEarn:'' }); },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
    }
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Categories</h1>
        <button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm"><Plus size={16} /> New Category</button>
      </div>
      <div className="grid gap-3">
        {categories?.map(cat => (
          <div key={cat.id} className="card p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-xs text-muted">{cat.slug} · {cat.estimatedEarn}</p>
            </div>
            <div className="flex gap-3 text-xs text-muted">
              <span>{cat._count?.tasks || 0} tasks</span>
              <span>{cat._count?.packages || 0} packages</span>
              <span className={`font-semibold ${cat.isActive ? 'text-green-400' : 'text-red-400'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold">New Category</h2>
                <button onClick={() => setShowForm(false)} className="text-muted hover:text-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {[['name','Name'],['slug','Slug (url-safe)'],['description','Description'],['estimatedEarn','Estimated Earnings']].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-muted mb-1.5">{label}</label>
                    <input className="input-field" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="btn-ghost flex-1 py-3">Cancel</button>
                  <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isLoading} className="btn-gold flex-1 flex items-center justify-center gap-2 py-3">
                    {createMutation.isLoading && <Loader2 size={16} className="animate-spin" />} Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
