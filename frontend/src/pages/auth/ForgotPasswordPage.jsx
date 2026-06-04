// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch { toast.error('Failed. Try again.'); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <CheckCircle className="text-gold mx-auto mb-4" size={40} />
        <h2 className="font-display text-2xl font-bold mb-2">Check Your Email</h2>
        <p className="text-muted mb-4">If an account exists, we've sent a reset link.</p>
        <Link to="/login" className="text-gold hover:underline text-sm">Back to login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-gold font-display text-2xl font-extrabold">TaskHive</Link>
          <p className="text-muted text-sm mt-2">Reset your password</p>
        </div>
        <div className="card p-8">
          <h1 className="font-display text-xl font-bold mb-5">Forgot Password</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com" {...register('email', { required: true })} />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 py-3">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Send Reset Link
            </button>
          </form>
          <p className="text-center text-muted text-sm mt-4"><Link to="/login" className="text-gold hover:underline">Back to login</Link></p>
        </div>
      </div>
    </div>
  );
}
