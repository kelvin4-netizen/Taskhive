// src/components/layout/DashboardLayout.jsx
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, DollarSign, ShoppingBag,
  Phone, User, Bell, LogOut, Menu, X, Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from 'react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard',               label: 'Overview',      icon: LayoutDashboard, end: true },
  { to: '/dashboard/purchases',     label: 'My Categories', icon: ShoppingBag },
  { to: '/dashboard/earnings',      label: 'Earnings',      icon: DollarSign },
  { to: '/dashboard/phones',        label: 'Phone Numbers', icon: Phone },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/profile',       label: 'Profile',       icon: User },
];

const CSS = `
  .db-sidebar { background: linear-gradient(180deg, #0D0D0D 0%, #111111 100%); }
  .db-nav-item { position: relative; transition: all 0.2s; }
  .db-nav-item::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:0; background:linear-gradient(180deg,#D4A843,#A07820); border-radius:0 3px 3px 0; transition:height 0.2s; }
  .db-nav-item.active::before { height:60%; }
  .db-nav-item:hover::before { height:40%; }
  .db-main { background: #0A0A0A; }
  .db-header { background: rgba(10,10,10,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(212,168,67,0.08); }
  .db-card { background: linear-gradient(135deg, #141414 0%, #111111 100%); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; transition: all 0.3s; }
  .db-card:hover { border-color: rgba(212,168,67,0.2); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
  .db-stat-card { position: relative; overflow: hidden; }
  .db-stat-card::after { content:''; position:absolute; top:-40%; right:-20%; width:120px; height:120px; border-radius:50%; opacity:0.06; }
  .db-stat-gold::after { background: #D4A843; }
  .db-stat-blue::after { background: #3B82F6; }
  .db-stat-green::after { background: #10B981; }
  .db-stat-purple::after { background: #8B5CF6; }
  .db-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
  .db-progress { height:4px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden; }
  .db-progress-bar { height:100%; background:linear-gradient(90deg,#D4A843,#F0C060); border-radius:99px; transition:width 1s ease; }
  .db-table-row:hover { background: rgba(212,168,67,0.03); }
  .db-wallet-pill { background: linear-gradient(135deg, rgba(212,168,67,0.15), rgba(212,168,67,0.05)); border: 1px solid rgba(212,168,67,0.2); border-radius: 12px; padding: 8px 14px; }
  @keyframes db-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .db-live { animation: db-pulse 2s ease-in-out infinite; }
`;

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: notifData } = useQuery('notifications', () =>
    api.get('/notifications').then(r => r.data.data.notifications), { staleTime: 30000 }
  );
  const unreadCount = notifData?.filter(n => !n.isRead).length || 0;

  const handleLogout = async () => {
    await logout();
    toast.success('See you soon!');
    navigate('/');
  };

  // Current page title
  const currentNav = navItems.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to));

  const SidebarContent = () => (
    <aside className="db-sidebar flex flex-col h-full" style={{ borderRight: '1px solid rgba(212,168,67,0.08)' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(212,168,67,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#D4A843,#A07820)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>🐝</div>
          <div>
            <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 17, fontWeight: 900, color: '#D4A843', lineHeight: 1 }}>TaskHive</div>
            <div style={{ fontSize: 10, color: '#5A5A5A', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Earning Platform</div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.1)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(212,168,67,0.2),rgba(212,168,67,0.05))', border: '1.5px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName}</div>
            <div style={{ fontSize: 10, color: '#D4A843', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} className="db-live" />
              Active Member
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#3A3A3A', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '4px 10px 8px' }}>Navigation</div>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 12,
              fontSize: 13, fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? '#D4A843' : '#6B6B6B',
              background: isActive ? 'rgba(212,168,67,0.08)' : 'transparent',
              border: isActive ? '1px solid rgba(212,168,67,0.12)' : '1px solid transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: isActive ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                  <Icon size={15} />
                </div>
                <span style={{ flex: 1 }}>{label}</span>
                {label === 'Notifications' && unreadCount > 0 && (
                  <span style={{ background: 'linear-gradient(135deg,#D4A843,#A07820)', color: '#0A0A0A', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20, minWidth: 18, textAlign: 'center' }}>{unreadCount}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Wallet + logout */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="db-wallet-pill" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Wallet Balance</div>
          <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 20, fontWeight: 900, color: '#D4A843' }}>${user?.walletBalance?.toFixed(2) || '0.00'}</div>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="db-main" style={{ display: 'flex', height: '100svh', overflow: 'hidden' }}>

        {/* Desktop sidebar */}
        <div style={{ width: 220, flexShrink: 0, display: 'none' }} className="md:block" id="db-desktop-sidebar">
          <style>{`#db-desktop-sidebar { display: block; } @media(max-width:767px){#db-desktop-sidebar{display:none!important;}}`}</style>
          <div style={{ height: '100%' }}><SidebarContent /></div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
            <div style={{ width: 220, flexShrink: 0, height: '100%' }}><SidebarContent /></div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Header */}
          <header className="db-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 60, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 8 }}
                id="db-hamburger"
              >
                <style>{`#db-hamburger{display:none!important} @media(max-width:767px){#db-hamburger{display:flex!important}}`}</style>
                <Menu size={20} />
              </button>
              <div>
                <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  {currentNav?.label || 'Dashboard'}
                </div>
                <div style={{ fontSize: 10, color: '#4A4A4A', marginTop: 1 }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Quick earn button */}
              <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 10, padding: '7px 12px', textDecoration: 'none', color: '#D4A843', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(212,168,67,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(212,168,67,0.08)'}
              >
                <Zap size={13} />
                <span style={{ display: 'none' }} id="earn-text">Earn More</span>
                <style>{`@media(min-width:640px){#earn-text{display:inline!important}}`}</style>
              </NavLink>

              {/* Notifications bell */}
              <NavLink to="/dashboard/notifications" style={{ position: 'relative', width: 36, height: 36, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B6B', textDecoration: 'none', transition: 'all 0.2s' }}>
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: 'linear-gradient(135deg,#D4A843,#A07820)', borderRadius: '50%', fontSize: 9, fontWeight: 800, color: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #0A0A0A' }}>{unreadCount}</span>
                )}
              </NavLink>

              {/* Avatar */}
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(212,168,67,0.25),rgba(212,168,67,0.08))', border: '1.5px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontWeight: 800, fontSize: 13 }}>
                {user?.fullName?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </header>

          {/* Page */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}