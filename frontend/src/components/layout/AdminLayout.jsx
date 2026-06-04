// src/components/layout/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, ListTodo, FolderOpen,
  CreditCard, Phone, FileText, LogOut, Menu, Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/phones', label: 'Phone Numbers', icon: Phone },
  { to: '/admin/logs', label: 'Activity Logs', icon: FileText },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-surface border-r border-subtle">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-subtle">
        <div className="w-7 h-7 bg-gold-gradient" style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }} />
        <div>
          <span className="font-display text-base font-extrabold text-gold block leading-none">TaskHive</span>
          <span className="text-xs text-muted flex items-center gap-1 mt-0.5"><Shield size={10} /> Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-muted hover:bg-surface-2 hover:text-text'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-subtle">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-2 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold text-xs">
            {user?.fullName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gold">ADMIN</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-muted hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      <div className="hidden md:flex w-56 flex-shrink-0 flex-col"><Sidebar /></div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-56 flex flex-col"><Sidebar /></div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-4 border-b border-subtle bg-dark/80 backdrop-blur-sm flex-shrink-0">
          <button className="md:hidden text-muted hover:text-text" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 text-xs text-gold bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-full">
            <Shield size={11} /> Admin Mode
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
