// src/pages/dashboard/TasksPage.jsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Clock, DollarSign, ChevronLeft,
  ChevronRight, CheckCircle, AlertCircle, ExternalLink,
  X, Loader2, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

const DIFFICULTY_COLORS = {
  EASY: 'text-green-400 bg-green-400/10 border-green-400/20',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  HARD: 'text-red-400 bg-red-400/10 border-red-400/20',
};

function TaskModal({ task, onClose, onSubmit, isSubmitting }) {
  const [proof, setProof] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl card p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display text-lg font-bold">{task.title}</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block ${DIFFICULTY_COLORS[task.difficulty]}`}>
              {task.difficulty}
            </span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors"><X size={20} /></button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gold font-bold">
              <DollarSign size={15} />
              ${task.reward} reward
            </div>
            {task.timeLimit && (
              <div className="flex items-center gap-1.5 text-muted">
                <Clock size={14} />
                {task.timeLimit} min
              </div>
            )}
          </div>

          <div className="bg-surface-2 rounded-xl p-4">
            <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-2">Instructions</p>
            <pre className="text-sm text-muted whitespace-pre-wrap font-body leading-relaxed">{task.instructions}</pre>
          </div>

          {task.externalUrl && (
            <a
              href={task.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gold hover:underline"
            >
              <ExternalLink size={14} />
              Open Task Link
            </a>
          )}
        </div>

        {task.userSubmission ? (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
            task.userSubmission.approved === true ? 'bg-green-400/10 text-green-400 border border-green-400/20' :
            task.userSubmission.approved === false ? 'bg-red-400/10 text-red-400 border border-red-400/20' :
            'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
          }`}>
            {task.userSubmission.approved === true && <><CheckCircle size={16} /> Approved — earned ${task.reward}</>}
            {task.userSubmission.approved === false && <><AlertCircle size={16} /> Submission rejected</>}
            {task.userSubmission.approved === null && <><Clock size={16} /> Submission under review</>}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Proof of Completion</label>
              <textarea
                className="input-field h-24 resize-none"
                placeholder="Paste screenshot URL, transaction ID, or describe what you completed..."
                value={proof}
                onChange={e => setProof(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Notes (optional)</label>
              <input
                className="input-field"
                placeholder="Any additional notes..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            <button
              onClick={() => onSubmit({ taskId: task.id, proof, notes })}
              disabled={isSubmitting || !proof.trim()}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {isSubmitting ? 'Submitting...' : 'Submit Task'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function TasksPage() {
  const { categoryId } = useParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  const { data, isLoading, isError } = useQuery(
    ['tasks', categoryId, page, search, difficulty],
    () => api.get(`/tasks/category/${categoryId}`, {
      params: { page, limit: 12, search: search || undefined, difficulty: difficulty || undefined },
    }).then(r => r.data.data),
    { keepPreviousData: true }
  );

  const submitMutation = useMutation(
    ({ taskId, proof, notes }) => api.post(`/tasks/${taskId}/submit`, { proof, notes }),
    {
      onSuccess: () => {
        toast.success('Task submitted! Awaiting review.');
        setSelectedTask(null);
        queryClient.invalidateQueries(['tasks', categoryId]);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Submission failed.');
      },
    }
  );

  const category = data?.tasks?.[0] ? null : null;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="text-red-400 mb-3" size={40} />
        <h2 className="font-display text-lg font-bold mb-2">Access Denied</h2>
        <p className="text-muted text-sm mb-4">You need an active purchase for this category.</p>
        <Link to="/" className="btn-gold px-6 py-2.5 text-sm">Browse Packages →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/dashboard" className="text-muted text-sm hover:text-text flex items-center gap-1 mb-2">
            <ChevronLeft size={14} /> Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold">Task Dashboard</h1>
          {data?.purchase && (
            <p className="text-muted text-sm mt-1">
              {data.purchase.isUnlimited
                ? 'Unlimited access'
                : `${data.purchase.tasksUsed} / ${data.purchase.taskLimit} tasks used`
              }
            </p>
          )}
        </div>
        {data?.purchase?.taskLimit && !data?.purchase?.isUnlimited && (
          <div className="hidden sm:block w-48">
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span>Tasks Used</span>
              <span>{data.purchase.tasksUsed}/{data.purchase.taskLimit}</span>
            </div>
            <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-gradient rounded-full transition-all"
                style={{ width: `${Math.min((data.purchase.tasksUsed / data.purchase.taskLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input-field pl-9 py-2.5 text-sm"
            placeholder="Search tasks..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input-field w-auto px-4 py-2.5 text-sm"
          value={difficulty}
          onChange={e => { setDifficulty(e.target.value); setPage(1); }}
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Task Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="h-4 bg-subtle rounded w-3/4" />
              <div className="h-3 bg-subtle rounded w-1/2" />
              <div className="h-3 bg-subtle rounded w-full" />
              <div className="h-8 bg-subtle rounded" />
            </div>
          ))}
        </div>
      ) : data?.tasks?.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <ListTodo size={40} className="mx-auto mb-3 opacity-40" />
          <p>No tasks found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.tasks?.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card card-hover p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-sm leading-snug flex-1">{task.title}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${DIFFICULTY_COLORS[task.difficulty]}`}>
                  {task.difficulty}
                </span>
              </div>
              <p className="text-xs text-muted line-clamp-2 mb-4 flex-1">{task.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-gold font-bold text-sm">
                  <DollarSign size={13} />
                  ${task.reward}
                </div>
                {task.timeLimit && (
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Clock size={12} />
                    {task.timeLimit} min
                  </div>
                )}
              </div>
              {task.userSubmission ? (
                <div className={`text-xs font-semibold py-2 rounded-lg text-center border ${
                  task.userSubmission.approved === true ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                  task.userSubmission.approved === false ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                }`}>
                  {task.userSubmission.approved === true && '✦ Approved'}
                  {task.userSubmission.approved === false && '✗ Rejected'}
                  {task.userSubmission.approved === null && '⏳ Pending Review'}
                </div>
              ) : (
                <button
                  onClick={() => setSelectedTask(task)}
                  className="btn-ghost text-xs py-2 w-full"
                >
                  View & Submit Task
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost px-3 py-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted">Page {page} of {data.pagination.pages}</span>
          <button
            onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
            disabled={page === data.pagination.pages}
            className="btn-ghost px-3 py-2 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Task modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSubmit={submitMutation.mutate}
            isSubmitting={submitMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
