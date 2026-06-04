// src/pages/admin/AdminUsers.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Search, UserX, UserCheck, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['admin-users', page, search, statusFilter],
    () => api.get('/admin/users', { params: { page, limit: 20, search: search || undefined, status: statusFilter || undefined } }).then(r => r.data.data),
    { keepPreviousData: true }
  );

  const statusMutation = useMutation(
    ({ id, status }) => api.patch(`/admin/users/${id}/status`, { status }),
    {
      onSuccess: (_, { status }) => {
        toast.success(`User ${status.toLowerCase()}.`);
        queryClient.invalidateQueries('admin-users');
      },
      onError: () => toast.error('Action failed.'),
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/users/${id}`),
    {
      onSuccess: () => {
        toast.success('User deleted.');
        queryClient.invalidateQueries('admin-users');
      },
      onError: () => toast.error('Delete failed.'),
    }
  );

  const confirmDelete = (user) => {
    if (window.confirm(`Delete ${user.fullName}? This is irreversible.`)) {
      deleteMutation.mutate(user.id);
    }
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">User Management</h1>
        <p className="text-muted text-sm mt-1">{data?.pagination?.total?.toLocaleString()} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input-field pl-9 py-2.5 text-sm"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input-field w-auto px-4 py-2.5 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING_VERIFICATION">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted uppercase tracking-wider border-b border-subtle bg-surface-2">
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-5 py-3 font-semibold">Country</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold">Purchases</th>
                <th className="text-left px-5 py-3 font-semibold">Joined</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/40">
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-subtle rounded w-40" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-subtle rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-subtle rounded w-16" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-subtle rounded w-8" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-subtle rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-subtle rounded w-20 ml-auto" /></td>
                    </tr>
                  ))
                : data?.users?.map(user => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-surface-2/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-xs text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">{user.country}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          user.status === 'ACTIVE' ? 'text-green-400 bg-green-400/10' :
                          user.status === 'SUSPENDED' ? 'text-red-400 bg-red-400/10' :
                          'text-yellow-400 bg-yellow-400/10'
                        }`}>
                          {user.status === 'PENDING_VERIFICATION' ? 'PENDING' : user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted">{user._count.purchases}</td>
                      <td className="px-5 py-4 text-muted text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {user.status === 'SUSPENDED' ? (
                            <button
                              onClick={() => statusMutation.mutate({ id: user.id, status: 'ACTIVE' })}
                              disabled={statusMutation.isLoading}
                              className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded border border-green-400/20 hover:bg-green-400/10 transition-all"
                            >
                              <UserCheck size={13} /> Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => statusMutation.mutate({ id: user.id, status: 'SUSPENDED' })}
                              disabled={statusMutation.isLoading}
                              className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 px-2 py-1 rounded border border-yellow-400/20 hover:bg-yellow-400/10 transition-all"
                            >
                              <UserX size={13} /> Suspend
                            </button>
                          )}
                          <button
                            onClick={() => confirmDelete(user)}
                            disabled={deleteMutation.isLoading}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-400/20 hover:bg-red-400/10 transition-all"
                          >
                            <Trash2 size={13} /> Delete
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

      {/* Pagination */}
      {data?.pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-2 disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted">Page {page} of {data.pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages} className="btn-ghost px-3 py-2 disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
