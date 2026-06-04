// src/pages/admin/AdminDashboard.jsx
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Users, DollarSign, ShoppingBag, Phone, TrendingUp, Activity } from 'lucide-react';
import api from '@/services/api';

const StatCard = ({ label, value, icon: Icon, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card p-5"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
        <Icon size={18} className="text-gold" />
      </div>
    </div>
    <p className="font-display text-2xl font-extrabold tracking-tight">{value}</p>
    <p className="text-sm font-medium mt-1">{label}</p>
    {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
  </motion.div>
);

export default function AdminDashboard() {
  const { data, isLoading } = useQuery('admin-analytics',
    () => api.get('/admin/analytics').then(r => r.data.data),
    { staleTime: 60000 }
  );

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-8 bg-subtle rounded w-48 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5 animate-pulse h-32" />
        ))}
      </div>
    </div>
  );

  const { overview, recentPayments, recentUsers, revenueChart } = data || {};

  // Build mini chart bars
  const maxRevenue = Math.max(...(revenueChart?.map(d => d.revenue) || [1]), 1);

  return (
    <div className="max-w-7xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted text-sm mt-1">Platform overview and live metrics.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={overview?.totalUsers?.toLocaleString()} icon={Users} delay={0} />
        <StatCard label="Active Users" value={overview?.activeUsers?.toLocaleString()} icon={Activity} sub={`${overview?.suspendedUsers} suspended`} delay={0.04} />
        <StatCard label="Total Revenue" value={`$${overview?.totalRevenue?.toFixed(0)}`} icon={DollarSign} delay={0.08} />
        <StatCard label="Active Purchases" value={overview?.totalPurchases?.toLocaleString()} icon={ShoppingBag} delay={0.12} />
        <StatCard label="Active Tasks" value={overview?.totalTasks?.toLocaleString()} icon={TrendingUp} delay={0.16} />
        <StatCard label="Phone Subs" value={overview?.totalSubscriptions?.toLocaleString()} icon={Phone} delay={0.20} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-display font-bold mb-5">Revenue — Last 30 Days</h2>
          <div className="flex items-end gap-1 h-32">
            {revenueChart?.map((day, i) => (
              <div
                key={i}
                className="flex-1 bg-gold/20 hover:bg-gold/40 rounded-sm transition-colors cursor-pointer group relative"
                style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, 4)}%` }}
                title={`${day.date}: $${day.revenue.toFixed(2)}`}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface-2 border border-subtle text-xs px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                  ${day.revenue.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Recent users */}
        <div className="card p-6">
          <h2 className="font-display font-bold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers?.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.fullName}</p>
                  <p className="text-xs text-muted">{user.country}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  user.status === 'ACTIVE' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'
                }`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent payments */}
      <div className="card p-6">
        <h2 className="font-display font-bold mb-5">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted uppercase tracking-wider border-b border-subtle">
                <th className="text-left pb-3 font-semibold">User</th>
                <th className="text-left pb-3 font-semibold">Amount</th>
                <th className="text-left pb-3 font-semibold">Method</th>
                <th className="text-left pb-3 font-semibold">Status</th>
                <th className="text-left pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/50">
              {recentPayments?.map(payment => (
                <tr key={payment.id} className="hover:bg-surface-2 transition-colors">
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{payment.user.fullName}</p>
                      <p className="text-xs text-muted">{payment.user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 text-gold font-bold">${payment.amount.toFixed(2)}</td>
                  <td className="py-3">
                    <span className="text-xs bg-surface-3 px-2 py-0.5 rounded-full">{payment.method}</span>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      payment.status === 'COMPLETED' ? 'text-green-400 bg-green-400/10' :
                      payment.status === 'PENDING' ? 'text-yellow-400 bg-yellow-400/10' :
                      'text-red-400 bg-red-400/10'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted text-xs">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
