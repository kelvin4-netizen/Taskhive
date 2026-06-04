// src/pages/dashboard/DashboardHome.jsx
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, ListTodo, TrendingUp, ArrowRight, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

const StatCard = ({ label, value, icon: Icon, color = 'gold', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card p-5"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted uppercase tracking-wider mb-2">{label}</p>
        <p className="font-display text-2xl font-bold">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'gold' ? 'bg-gold/10' : 'bg-blue-500/10'}`}>
        <Icon size={18} className={color === 'gold' ? 'text-gold' : 'text-blue-400'} />
      </div>
    </div>
  </motion.div>
);

export default function DashboardHome() {
  const { user } = useAuthStore();

  const { data: purchases } = useQuery('my-purchases', () =>
    api.get('/purchases/my-purchases').then(r => r.data.data.purchases)
  );

  const { data: categories } = useQuery('categories', () =>
    api.get('/categories').then(r => r.data.data.categories)
  );

  const { data: earnings } = useQuery('earnings', () =>
    api.get('/users/earnings').then(r => r.data.data)
  );

  const purchasedCategoryIds = new Set(purchases?.map(p => p.categoryId) || []);

  return (
    <div className="max-w-6xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-2xl font-bold">
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted text-sm mt-1">Here's your earning dashboard overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Wallet Balance" value={`$${user?.walletBalance?.toFixed(2) || '0.00'}`} icon={DollarSign} delay={0} />
        <StatCard label="Total Earned" value={`$${earnings?.totalEarned?.toFixed(2) || '0.00'}`} icon={TrendingUp} delay={0.05} />
        <StatCard label="Active Categories" value={purchases?.length || 0} icon={ShoppingBag} delay={0.1} />
        <StatCard label="Tasks Completed" value={earnings?.submissions?.length || 0} icon={ListTodo} delay={0.15} color="blue" />
      </div>

      {/* Purchased categories */}
      {purchases && purchases.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold mb-4">My Active Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchases.map((purchase) => (
              <motion.div key={purchase.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card card-hover p-5 cursor-pointer">
                <Link to={`/dashboard/tasks/${purchase.categoryId}`} className="block">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{purchase.category.name}</h3>
                      <p className="text-xs text-muted mt-0.5">{purchase.package.name} Plan</p>
                    </div>
                    <ArrowRight size={16} className="text-gold mt-0.5" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Tasks used: {purchase.tasksUsed}{purchase.taskLimit ? `/${purchase.taskLimit}` : ' (unlimited)'}</span>
                    <span className="text-gold font-semibold">Active ✦</span>
                  </div>
                  {purchase.taskLimit && (
                    <div className="mt-3 h-1 bg-subtle rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-gradient rounded-full"
                        style={{ width: `${Math.min((purchase.tasksUsed / purchase.taskLimit) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Browse categories CTA */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">Browse Categories</h2>
          <Link to="/" className="text-gold text-sm hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories?.map((cat) => {
            const isPurchased = purchasedCategoryIds.has(cat.id);
            return (
              <Link
                key={cat.id}
                to={isPurchased ? `/dashboard/tasks/${cat.id}` : `/categories/${cat.slug}/packages`}
                className="card card-hover p-4 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wide">{cat.name}</span>
                  {isPurchased
                    ? <span className="text-gold text-xs font-bold">✦</span>
                    : <Lock size={12} className="text-subtle" />
                  }
                </div>
                <p className="text-xs text-muted line-clamp-2">{cat.description}</p>
                <p className="text-xs text-gold mt-2 font-medium">{cat.estimatedEarn}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
