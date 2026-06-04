// src/pages/PaymentSuccessPage.jsx
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 bg-gold/10 border border-gold/25 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-gold" size={36} />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Payment Confirmed!</h1>
        <p className="text-muted mb-8">Your access has been unlocked. Head to your dashboard to start completing tasks.</p>
        <Link to="/dashboard" className="btn-gold inline-block px-10 py-3.5">Go to Dashboard →</Link>
      </motion.div>
    </div>
  );
}
