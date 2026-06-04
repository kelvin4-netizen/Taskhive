// src/pages/admin/AdminPayments.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data } = useQuery(['admin-payments', page, statusFilter], () =>
    api.get('/admin/payments', { params: { page, limit: 20, status: statusFilter || undefined } }).then(r => r.data.data)
  );

  const refundMutation = useMutation(
    (id) => api.post(`/admin/payments/${id}/refund`),
    { onSuccess: () => { toast.success('Refund processed.'); queryClient.invalidateQueries('admin-payments'); }, onError: () => toast.error('Refund failed.') }
  );

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Payments</h1>
        <select className="input-field w-auto px-4 py-2 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted uppercase tracking-wider border-b border-subtle bg-surface-2">
              <th className="text-left px-5 py-3">User</th>
              <th className="text-left px-5 py-3">Amount</th>
              <th className="text-left px-5 py-3">Method</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle/40">
            {data?.payments?.map(p => (
              <tr key={p.id} className="hover:bg-surface-2/50">
                <td className="px-5 py-3"><p className="font-medium">{p.user.fullName}</p><p className="text-xs text-muted">{p.user.email}</p></td>
                <td className="px-5 py-3 text-gold font-bold">${p.amount.toFixed(2)}</td>
                <td className="px-5 py-3 text-xs"><span className="bg-surface-3 px-2 py-0.5 rounded-full">{p.method}</span></td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'COMPLETED' ? 'text-green-400 bg-green-400/10' : p.status === 'PENDING' ? 'text-yellow-400 bg-yellow-400/10' : p.status === 'REFUNDED' ? 'text-blue-400 bg-blue-400/10' : 'text-red-400 bg-red-400/10'}`}>{p.status}</span>
                </td>
                <td className="px-5 py-3 text-muted text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right">
                  {p.status === 'COMPLETED' && (
                    <button onClick={() => window.confirm('Issue refund?') && refundMutation.mutate(p.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 border border-red-400/20 rounded hover:bg-red-400/10 transition-all">
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="text-sm text-muted">Page {page} of {data.pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages} className="btn-ghost px-3 py-2 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
