// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Public pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import CategoryPage from '@/pages/CategoryPage';
import PackagesPage from '@/pages/PackagesPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';

// Protected user pages
import DashboardHome from '@/pages/dashboard/DashboardHome';
import TasksPage from '@/pages/dashboard/TasksPage';
import EarningsPage from '@/pages/dashboard/EarningsPage';
import PurchasesPage from '@/pages/dashboard/PurchasesPage';
import PhoneSubscriptionsPage from '@/pages/dashboard/PhoneSubscriptionsPage';
import ProfilePage from '@/pages/dashboard/ProfilePage';
import NotificationsPage from '@/pages/dashboard/NotificationsPage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminTasks from '@/pages/admin/AdminTasks';
import AdminSubmissions from '@/pages/admin/AdminSubmissions';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminPhones from '@/pages/admin/AdminPhones';
import AdminLogs from '@/pages/admin/AdminLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

// ─── ROUTE GUARDS ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#12141E', color: '#E8EAF0', border: '1px solid #3A3F5C' },
            success: { iconTheme: { primary: '#D4A843', secondary: '#08090D' } },
          }}
        />
        <Routes>
          {/* ── PUBLIC ── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories/:slug" element={<CategoryPage />} />
            <Route path="/categories/:slug/packages" element={<PackagesPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          </Route>

          {/* ── AUTH (guest only) ── */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

          {/* ── PROTECTED USER ── */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="tasks/:categoryId" element={<TasksPage />} />
            <Route path="earnings" element={<EarningsPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="phones" element={<PhoneSubscriptionsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* ── ADMIN ── */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="phones" element={<AdminPhones />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>

          {/* ── FALLBACK ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}