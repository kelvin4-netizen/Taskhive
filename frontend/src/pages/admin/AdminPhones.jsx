// src/pages/admin/AdminPhones.jsx
import { useQuery } from 'react-query';
import { Phone } from 'lucide-react';
import api from '@/services/api';

export default function AdminPhones() {
  const { data } = useQuery('admin-phones', () =>
    api.get('/admin/analytics').then(r => r.data.data)
  );
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Phone Number Management</h1>
      <div className="card p-6 text-center">
        <Phone className="text-gold mx-auto mb-3" size={32} />
        <p className="font-display text-lg font-bold mb-2">Phone Inventory Manager</p>
        <p className="text-muted text-sm">Active subscriptions: {data?.overview?.totalSubscriptions || 0}</p>
        <p className="text-xs text-muted mt-4">Manage phone number inventory via the database seed or add numbers via the API.</p>
      </div>
    </div>
  );
}
