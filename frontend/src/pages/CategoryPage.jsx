// src/pages/CategoryPage.jsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ChevronLeft, Loader2 } from 'lucide-react';
import api from '@/services/api';

export default function CategoryPage() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery(['category', slug], () =>
    api.get(`/categories/${slug}`).then(r => r.data.data.category)
  );
  if (isLoading) return <div className="min-h-screen bg-dark flex items-center justify-center"><Loader2 className="animate-spin text-gold" size={32} /></div>;
  return (
    <div className="min-h-screen bg-dark pt-24 pb-16 px-5 max-w-4xl mx-auto">
      <Link to="/" className="flex items-center gap-1 text-muted text-sm hover:text-text mb-8"><ChevronLeft size={14} /> Back</Link>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold">{data?.name}</h1>
        <p className="text-muted mt-3">{data?.description}</p>
        <p className="text-gold font-semibold mt-2">{data?.estimatedEarn}</p>
      </div>
      <Link to={`/categories/${slug}/packages`} className="btn-gold inline-block px-8 py-3.5">View Packages & Pricing →</Link>
    </div>
  );
}
