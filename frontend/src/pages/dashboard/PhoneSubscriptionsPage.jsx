// src/pages/dashboard/PhoneSubscriptionsPage.jsx
import { useQuery } from 'react-query';
import { Phone, ExternalLink } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function PhoneSubscriptionsPage() {
  const { data: subs } = useQuery('phone-subs', () =>
    api.get('/phones/my-subscriptions').then(r => r.data.data.subscriptions)
  );
  const { data: plans } = useQuery('phone-plans', () =>
    api.get('/phones/plans').then(r => r.data.data.plans)
  );

  const handleSubscribe = (plan) => {
    // Payment not yet configured — show friendly message
    toast('Payment integration coming soon! Contact support to subscribe.', {
      icon: '📱',
      duration: 4000,
    });
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">US Phone Numbers</h1>
        <p className="text-muted text-sm mt-1">Get a virtual US number for SMS verification and 2FA.</p>
      </div>

      {/* Active subscriptions */}
      {subs?.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-bold">Active Subscriptions</h2>
          {subs.map(sub => (
            <div key={sub.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                  <Phone size={18} className="text-gold" />
                </div>
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

      {/* Plans */}
      <div>
        <h2 className="font-display font-bold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans?.map((plan, i) => {
            const isPopular = i === 1;
            return (
              <div key={plan.name} className={`card p-5 text-center relative ${isPopular ? 'border-gold/40 bg-gold/[0.03]' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-dark text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap font-display">
                    BEST VALUE
                  </div>
                )}
                <div className="font-display text-lg font-bold mb-1">{plan.name}</div>
                <div className="text-3xl font-extrabold text-gold font-display mb-0.5">
                  ${plan.price}<span className="text-sm text-muted font-normal">/mo</span>
                </div>
                <div className="text-muted text-sm mt-1 mb-4">
                  {plan.numbers} US Number{plan.numbers > 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isPopular
                      ? 'btn-gold'
                      : 'btn-ghost hover:border-gold/40 hover:text-gold'
                  }`}
                >
                  Subscribe — ${plan.price}/mo
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 card p-4 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-semibold mb-1">Need help choosing a plan?</p>
            <p className="text-xs text-muted">Contact us via email and we'll set up your subscription manually until payment integration is live.</p>
          </div>
        </div>
      </div>
    </div>
  );
}