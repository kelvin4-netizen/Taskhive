// src/pages/dashboard/ProfilePage.jsx
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { fullName: user?.fullName, country: user?.country, phoneNumber: user?.phoneNumber || '' } });

  const mutation = useMutation(
    (data) => api.patch('/users/profile', data),
    {
      onSuccess: (res) => { updateUser(res.data.data.user); toast.success('Profile updated.'); },
      onError: () => toast.error('Update failed.'),
    }
  );

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-bold">My Profile</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-subtle">
          <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/25 flex items-center justify-center text-gold font-display font-bold text-2xl">
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <p className="font-display font-bold text-lg">{user?.fullName}</p>
            <p className="text-muted text-sm">{user?.email}</p>
            <p className="text-xs text-gold mt-1">Referral: {user?.referralCode}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(mutation.mutate)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Full Name</label>
            <input className="input-field" {...register('fullName', { required: true })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Country</label>
            <input className="input-field" {...register('country', { required: true })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Phone Number</label>
            <input className="input-field" {...register('phoneNumber')} />
          </div>
          <button type="submit" disabled={mutation.isLoading} className="btn-gold w-full flex items-center justify-center gap-2 py-3">
            {mutation.isLoading && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
