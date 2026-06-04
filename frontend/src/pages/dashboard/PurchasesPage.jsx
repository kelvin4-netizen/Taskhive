// src/pages/dashboard/PurchasesPage.jsx
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import api from '@/services/api';

export default function PurchasesPage() {
  const { data } = useQuery('my-purchases', () =>
    api.get('/purchases/my-purchases').then(r => r.data.data.purchases)
  );
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold">My Purchases</h1>
      {data?.length === 0 && (
        <div className="text-center py-16 text-muted">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="mb-4">No purchases yet.</p>
          <Link to="/" className="btn-gold px-6 py-2.5 text-sm">Browse Categories</Link>
        </div>
      )}
      <div className="grid gap-4">
        {data?.map(p => (
          <div key={p.id} className="card p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{p.category.name}</h3>
              <p className="text-sm text-muted">{p.package.name} · {p.isUnlimited ? 'Unlimited' : `${p.tasksUsed}/${p.taskLimit} tasks`}</p>
            </div>
            <Link to={`/dashboard/tasks/${p.categoryId}`} className="btn-ghost flex items-center gap-1.5 text-sm px-4 py-2">
              Open <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
