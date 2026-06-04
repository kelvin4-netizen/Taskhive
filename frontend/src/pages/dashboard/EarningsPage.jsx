// src/pages/dashboard/EarningsPage.jsx
import { useQuery } from 'react-query';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import api from '@/services/api';

export default function EarningsPage() {
  const { data, isLoading } = useQuery('earnings', () =>
    api.get('/users/earnings').then(r => r.data.data)
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Earnings</h1>
        <p className="text-muted text-sm mt-1">Track your task submissions and payouts.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <DollarSign className="text-gold mb-3" size={20} />
          <p className="font-display text-2xl font-bold">${data?.totalEarned?.toFixed(2) || '0.00'}</p>
          <p className="text-muted text-sm">Total Earned</p>
        </div>
        <div className="card p-5">
          <CheckCircle className="text-green-400 mb-3" size={20} />
          <p className="font-display text-2xl font-bold">{data?.submissions?.filter(s => s.approved === true).length || 0}</p>
          <p className="text-muted text-sm">Approved Tasks</p>
        </div>
        <div className="card p-5">
          <Clock className="text-yellow-400 mb-3" size={20} />
          <p className="font-display text-2xl font-bold">{data?.submissions?.filter(s => s.approved === null).length || 0}</p>
          <p className="text-muted text-sm">Pending Review</p>
        </div>
      </div>
      {data?.submissions?.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted uppercase tracking-wider border-b border-subtle bg-surface-2">
                <th className="text-left px-5 py-3">Task</th>
                <th className="text-left px-5 py-3">Reward</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/40">
              {data.submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-surface-2/50">
                  <td className="px-5 py-3 font-medium">{sub.task.title}</td>
                  <td className="px-5 py-3 text-gold font-bold">${sub.reward}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      sub.approved === true ? 'text-green-400 bg-green-400/10' :
                      sub.approved === false ? 'text-red-400 bg-red-400/10' :
                      'text-yellow-400 bg-yellow-400/10'
                    }`}>
                      {sub.approved === true ? 'Approved' : sub.approved === false ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted text-xs">{new Date(sub.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && !data?.submissions?.length && (
        <div className="text-center py-16 text-muted">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
          <p>No earnings yet. Complete tasks to start earning.</p>
        </div>
      )}
    </div>
  );
}
