// src/pages/auth/ResetPasswordPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm();
  const password = watch('password');

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-gold font-display text-2xl font-extrabold">TaskHive</Link>
        </div>
        <div className="card p-8">
          <h1 className="font-display text-xl font-bold mb-5">Set New Password</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">New Password</label>
              <input type="password" className="input-field" placeholder="Min 8 characters"
                {...register('password', { required: true, minLength: { value: 8, message: 'Min 8 chars' } })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Confirm Password</label>
              <input type="password" className="input-field" placeholder="Repeat password"
                {...register('confirmPassword', { validate: v => v === password || 'Passwords do not match' })} />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 py-3">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
