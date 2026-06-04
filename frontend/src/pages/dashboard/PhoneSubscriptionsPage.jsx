// src/pages/dashboard/PhoneSubscriptionsPage.jsx
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import api from '@/services/api';

export default function PhoneSubscriptionsPage() {
  const { data } = useQuery('phone-subs', () =>
    api.get('/phones/my-subscriptions').then(r => r.data.data.subscriptions)
  );
  const { data: plans } = useQuery('phone-plans', () =>
    api.get('/phones/plans').then(r => r.data.data.plans)
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">US Phone Numbers</h1>
        <p className="text-muted text-sm mt-1">Manage your virtual US number subscriptions.</p>
      </div>
      {data?.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-bold">Active Subscriptions</h2>
          {data.map(sub => (
            <div key={sub.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center"><Phone size={18} className="text-gold" /></div>
                <div>
                  <p className="font-semibold">{sub.phoneNumber.number}</p>
                  <p className="text-xs text-muted">{sub.planName} · Expires {new Date(sub.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sub.status === 'ACTIVE' ? 'text-green-400 bg-green-400/10' : 'text-muted bg-subtle/50'}`}>
                {sub.status}
              </span>
            </div>
          ))}
        </div>
      )}
      <div>
        <h2 className="font-display font-bold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans?.map(plan => (
            <div key={plan.name} className="card p-5 text-center">
              <div className="font-display text-lg font-bold mb-1">{plan.name}</div>
              <div className="text-3xl font-extrabold text-gold font-display">${plan.price}<span className="text-sm text-muted font-normal">/mo</span></div>
              <div className="text-muted text-sm mt-2 mb-4">{plan.numbers} US Number{plan.numbers > 1 ? 's' : ''}</div>
              <button className="btn-ghost w-full py-2 text-sm">Subscribe</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
