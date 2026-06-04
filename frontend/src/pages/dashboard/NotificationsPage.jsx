// src/pages/dashboard/NotificationsPage.jsx
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery('notifications', () =>
    api.get('/notifications').then(r => r.data.data.notifications)
  );
  const markAllRead = useMutation(
    () => api.patch('/notifications/read-all'),
    { onSuccess: () => { toast.success('All marked as read.'); queryClient.invalidateQueries('notifications'); } }
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        {data?.some(n => !n.isRead) && (
          <button onClick={() => markAllRead.mutate()} className="btn-ghost text-sm px-4 py-2">Mark all read</button>
        )}
      </div>
      {data?.length === 0 && (
        <div className="text-center py-16 text-muted">
          <Bell size={36} className="mx-auto mb-3 opacity-30" />
          <p>No notifications yet.</p>
        </div>
      )}
      <div className="space-y-2">
        {data?.map(notif => (
          <div key={notif.id} className={`card p-4 ${!notif.isRead ? 'border-gold/25 bg-gold/[0.02]' : ''}`}>
            <div className="flex items-start gap-3">
              {!notif.isRead && <div className="w-2 h-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />}
              <div className={!notif.isRead ? '' : 'ml-5'}>
                <p className="font-semibold text-sm">{notif.title}</p>
                <p className="text-muted text-sm mt-0.5">{notif.message}</p>
                <p className="text-xs text-subtle mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
