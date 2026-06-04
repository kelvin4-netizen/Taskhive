// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const COUNTRIES = [
  'Kenya', 'Nigeria', 'Ghana', 'South Africa', 'Uganda', 'Tanzania',
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
  'Philippines', 'Pakistan', 'Bangladesh', 'Indonesia', 'Other',
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data);
      setSuccess(true);
      toast.success('Account created! Check your email to verify.');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-16 h-16 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-gold" size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">Check Your Email</h2>
          <p className="text-muted mb-6">We sent a verification link to your email. Click it to activate your account.</p>
          <Link to="/login" className="btn-gold inline-block px-8 py-3">Go to Login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gold font-display text-2xl font-extrabold">
            <div className="w-8 h-8 bg-gold-gradient" style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }} />
            TaskHive
          </Link>
          <p className="text-muted text-sm mt-2">Create your free account</p>
        </div>

        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold mb-6">Get Started</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Full Name</label>
              <input className="input-field" placeholder="John Doe"
                {...register('fullName', { required: 'Full name required', minLength: { value: 2, message: 'Min 2 chars' } })} />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Country</label>
                <select className="input-field" {...register('country', { required: 'Required' })}>
                  <option value="">Select...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Phone (optional)</label>
                <input className="input-field" placeholder="+254..." {...register('phoneNumber')} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="Min 8 chars"
                  {...register('password', {
                    required: 'Password required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include upper, lower & number' },
                  })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Confirm Password</label>
              <input type="password" className="input-field" placeholder="Repeat password"
                {...register('confirmPassword', {
                  required: 'Please confirm',
                  validate: v => v === password || 'Passwords do not match',
                })} />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-base mt-2">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              {isLoading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-subtle text-center">
            <p className="text-muted text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-gold hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
