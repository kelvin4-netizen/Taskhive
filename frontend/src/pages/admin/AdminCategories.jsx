// src/pages/admin/AdminCategories.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, X, Loader2, ListTodo, ShoppingBag, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CSS = `
  .ac-cat { background:linear-gradient(135deg,#141414,#111); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px 20px; display:flex; align-items:center; justify-content:space-between; transition:all 0.3s; gap:12px; flex-wrap:wrap; }
  .ac-cat:hover { border-color:rgba(212,168,67,0.2); }
  .ac-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:10px; padding:10px 14px; font-size:13px; font-family:inherit; outline:none; transition:all 0.2s; box-sizing:border-box; }
  .ac-input:focus { border-color:rgba(212,168,67,0.4); background:rgba(212,168,67,0.03); }
  .ac-input::placeholder { color:#3A3A3A; }
  .ac-label { display:block; font-size:10px; font-weight:700; color:#5A5A5A; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:7px; }
  .ac-modal-bg { position:fixed; inset:0; z-index:200; display:flex; align-items:center; justify-content:center; padding:16px; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); }
  .ac-modal { background:linear-gradient(135deg,#161616,#111); border:1px solid rgba(255,255,255,0.08); border-radius:20px; width:100%; max-width:480px; }
  .ac-skeleton { background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%); background-size:200% 100%; border-radius:12px; animation:ac-shimmer 1.5s infinite; }
  @keyframes ac-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

const CATEGORY_ICONS = {
  'Academic Writing':'🎓','Freelancing':'💼','Watching Videos':'▶️',
  'Surveys':'📋','App Testing':'📱','Data Entry':'⌨️',
  'Social Media Promotion':'📣','Crypto Tasks':'₿',
};

export default function AdminCategories() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', estimatedEarn: '' });
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery('categories', () =>
    api.get('/categories').then(r => r.data.data.categories)
  );

  const createMutation = useMutation(
    (data) => api.post('/admin/categories', data),
    {
      onSuccess: () => {
        toast.success('Category created.');
        queryClient.invalidateQueries('categories');
        setShowForm(false);
        setForm({ name: '', slug: '', description: '', estimatedEarn: '' });
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
    }
  );

  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm(f => ({ ...f, name, slug }));
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Categories</h1>
            <p style={{ fontSize: 13, color: '#5A5A5A' }}>{categories?.length || 0} categories configured.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', border: 'none', borderRadius: 11, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={15} /> New Category
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ height: 80 }} className="ac-skeleton" />)
            : categories?.map((cat, i) => (
                <motion.div key={cat.id} className="ac-cat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {CATEGORY_ICONS[cat.name] || '📂'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#ddd', marginBottom: 3 }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: '#5A5A5A' }}>/{cat.slug} · {cat.estimatedEarn}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B6B6B' }}>
                      <ListTodo size={12} /> {cat._count?.tasks || 0} tasks
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B6B6B' }}>
                      <ShoppingBag size={12} /> {cat._count?.packages || 0} packages
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 9px', ...(cat.isActive ? { color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' } : { color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }) }}>
                      {cat.isActive ? <><CheckCircle size={9} /> Active</> : <><XCircle size={9} /> Inactive</>}
                    </span>
                  </div>
                </motion.div>
              ))
          }
        </div>
      </div>

      {/* New category modal */}
      <AnimatePresence>
        {showForm && (
          <div className="ac-modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div className="ac-modal" initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}>
              <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 800, color: '#fff' }}>New Category</div>
                <button onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
              </div>
              <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="ac-label">Category Name *</label>
                  <input className="ac-input" placeholder="e.g. Academic Writing" value={form.name} onChange={e => handleNameChange(e.target.value)} />
                </div>
                <div>
                  <label className="ac-label">Slug (auto-generated)</label>
                  <input className="ac-input" style={{ color: '#D4A843' }} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
                <div>
                  <label className="ac-label">Description</label>
                  <input className="ac-input" placeholder="Brief description of task type" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="ac-label">Estimated Earnings</label>
                  <input className="ac-input" placeholder="e.g. $10–$50 per task" value={form.estimatedEarn} onChange={e => setForm(f => ({ ...f, estimatedEarn: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                  <button onClick={() => setShowForm(false)} style={{ padding: '12px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  <button
                    onClick={() => createMutation.mutate(form)}
                    disabled={createMutation.isLoading || !form.name}
                    style={{ padding: '12px', borderRadius: 11, background: createMutation.isLoading ? 'rgba(212,168,67,0.5)' : 'linear-gradient(135deg,#D4A843,#A07820)', border: 'none', color: '#0A0A0A', fontSize: 13, fontWeight: 700, cursor: createMutation.isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                  >
                    {createMutation.isLoading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                    Create Category
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}