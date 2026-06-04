// src/pages/admin/AdminLogs.jsx
import { useQuery } from 'react-query';
import { FileText } from 'lucide-react';
import api from '@/services/api';

export default function AdminLogs() {
  const { data } = useQuery('admin-logs', () =>
    api.get('/admin/logs').then(r => r.data.data.logs)
  );

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Activity Logs</h1>
      {!data?.length ? (
        <div className="text-center py-16 text-muted">
          <FileText size={36} className="mx-auto mb-3 opacity-30" />
          <p>No activity logs yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted uppercase tracking-wider border-b border-subtle bg-surface-2">
                <th className="text-left px-5 py-3">Admin</th>
                <th className="text-left px-5 py-3">Action</th>
                <th className="text-left px-5 py-3">Description</th>
                <th className="text-left px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/40">
              {data.map(log => (
                <tr key={log.id} className="hover:bg-surface-2/50">
                  <td className="px-5 py-3 text-sm font-medium">{log.admin.fullName}</td>
                  <td className="px-5 py-3"><span className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full font-semibold">{log.action}</span></td>
                  <td className="px-5 py-3 text-muted text-xs">{log.description}</td>
                  <td className="px-5 py-3 text-muted text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
