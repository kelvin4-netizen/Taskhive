// src/pages/auth/VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {status === 'loading' && <Loader2 className="animate-spin text-gold mx-auto mb-4" size={40} />}
        {status === 'success' && (
          <>
            <CheckCircle className="text-gold mx-auto mb-4" size={40} />
            <h2 className="font-display text-2xl font-bold mb-2">Email Verified!</h2>
            <p className="text-muted mb-6">Your account is now active. Sign in to start earning.</p>
            <Link to="/login" className="btn-gold inline-block px-8 py-3">Sign In Now →</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="text-red-400 mx-auto mb-4" size={40} />
            <h2 className="font-display text-2xl font-bold mb-2">Invalid Token</h2>
            <p className="text-muted mb-4">This link is invalid or expired.</p>
            <Link to="/login" className="text-gold hover:underline text-sm">Go to login</Link>
          </>
        )}
      </div>
    </div>
  );
}
