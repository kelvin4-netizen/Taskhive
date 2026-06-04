// src/components/layout/DashboardLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, ListTodo, DollarSign, ShoppingBag,
  Phone, User, Bell, LogOut, Menu, X, ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from 'react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/purchases', label: 'My Categories', icon: ShoppingBag },
  { to: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { to: '/dashboard/phones', label: 'Phone Numbers', icon: Phone },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: notifData } = useQuery('notifications', () =>
    api.get('/notifications').then(r => r.data.data.notifications), { staleTime: 30000 }
  );
  const unreadCount = notifData?.filter(n => !n.isRead).length || 0;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-surface border-r border-subtle">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-subtle">
        <div className="w-7 h-7 bg-gold-gradient" style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }} />
        <span className="font-display text-lg font-extrabold text-gold">TaskHive</span>
      </div>

      {/* Nav */}
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
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-gold' : ''} />
                {label}
                {label === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-gold text-dark text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-subtle">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-2 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center text-gold font-bold text-xs">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
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
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-60 flex flex-col"><Sidebar /></div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-subtle bg-dark/80 backdrop-blur-sm flex-shrink-0">
          <button
            className="md:hidden text-muted hover:text-text"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted">Wallet Balance</p>
              <p className="text-sm font-bold text-gold">${user?.walletBalance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
