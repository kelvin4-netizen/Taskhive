// src/components/layout/AdminLayout.jsx
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, ListTodo, FolderOpen,
  CreditCard, Phone, FileText, LogOut, Menu, Shield, X, CheckSquare,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin',             label: 'Overview',      icon: LayoutDashboard, end: true },
  { to: '/admin/users',       label: 'Users',         icon: Users },
  { to: '/admin/tasks',       label: 'Tasks',         icon: ListTodo },
  { to: '/admin/submissions', label: 'Submissions',   icon: CheckSquare },
  { to: '/admin/categories',  label: 'Categories',    icon: FolderOpen },
  { to: '/admin/payments',    label: 'Payments',      icon: CreditCard },
  { to: '/admin/phones',      label: 'Phone Numbers', icon: Phone },
  { to: '/admin/logs',        label: 'Activity Logs', icon: FileText },
];

const CSS = `
  .al-sidebar { background:linear-gradient(180deg,#0D0D0D 0%,#111 100%); border-right:1px solid rgba(212,168,67,0.08); display:flex; flex-direction:column; height:100%; }
  .al-nav-item { position:relative; display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:11px; font-size:13px; font-weight:500; text-decoration:none; transition:all 0.2s; border:1px solid transparent; }
  .al-nav-item::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:0; background:linear-gradient(180deg,#D4A843,#A07820); border-radius:0 3px 3px 0; transition:height 0.2s; }
  .al-nav-item.active { background:rgba(212,168,67,0.08); color:#D4A843; border-color:rgba(212,168,67,0.12); }
  .al-nav-item.active::before { height:55%; }
  .al-nav-item:not(.active) { color:#5A5A5A; }
  .al-nav-item:not(.active):hover { background:rgba(255,255,255,0.04); color:#9A9A9A; }
  .al-header { background:rgba(10,10,10,0.92); backdrop-filter:blur(20px); border-bottom:1px solid rgba(212,168,67,0.08); display:flex; align-items:center; justify-content:space-between; padding:0 20px; height:58px; flex-shrink:0; }
  .al-main { flex:1; overflow-y:auto; padding:24px 20px; background:#0A0A0A; }
`;

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/');
  };

  const currentNav = navItems.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to));

  const SidebarContent = () => (
    <div className="al-sidebar">
      {/* Logo */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(212,168,67,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#D4A843,#A07820)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🐝</div>
          <div>
            <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 16, fontWeight: 900, color: '#D4A843', lineHeight: 1 }}>TaskHive</div>
            <div style={{ fontSize: 9, color: '#5A5A5A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <Shield size={8} style={{ color: '#D4A843' }} /> Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Admin badge */}
      <div style={{ padding: '14px 14px 10px' }}>
        <div style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.12)', borderRadius: 11, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(212,168,67,0.2),rgba(212,168,67,0.05))', border: '1.5px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#D4A843' }}>Administrator</div>
            <div style={{ fontSize: 10, color: '#5A5A5A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '6px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#3A3A3A', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '4px 10px 8px' }}>Management</div>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `al-nav-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: isActive ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                  <Icon size={14} />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: 'flex', height: '100svh', overflow: 'hidden', background: '#0A0A0A' }}>

        {/* Desktop sidebar */}
        <div style={{ width: 210, flexShrink: 0 }} id="al-desktop-sidebar">
          <style>{`#al-desktop-sidebar{display:block} @media(max-width:767px){#al-desktop-sidebar{display:none!important}}`}</style>
          <SidebarContent />
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
            <div style={{ width: 210, flexShrink: 0, height: '100%' }}><SidebarContent /></div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <header className="al-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setSidebarOpen(true)} id="al-hamburger" style={{ background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer', padding: 4, display: 'none', borderRadius: 8 }}>
                <style>{`#al-hamburger{display:none!important} @media(max-width:767px){#al-hamburger{display:flex!important}}`}</style>
                <Menu size={20} />
              </button>
              <div>
                <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>{currentNav?.label || 'Admin'}</div>
                <div style={{ fontSize: 10, color: '#4A4A4A' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 20, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#D4A843' }}>
              <Shield size={11} /> Admin Mode
            </div>
          </header>
          <main className="al-main">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}