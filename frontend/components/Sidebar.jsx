import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  teacher: [
    { to: '/',              icon: '🏠', label: 'Oversikt' },
    { to: '/teacher',       icon: '📋', label: 'Lærerpanel' },
    { to: '/oppgaver/ny',   icon: '➕', label: 'Ny Oppgave' },
    { to: '/analyse',       icon: '📊', label: 'Analyse' },
    { to: '/ai-chat',       icon: '🤖', label: 'AI-Assistent' },
    { to: '/klasser',       icon: '👥', label: 'Klasser' },
    { to: '/innstillinger', icon: '⚙️', label: 'Innstillinger' },
  ],
  student: [
    { to: '/',              icon: '🏠', label: 'Oversikt' },
    { to: '/student',       icon: '🎓', label: 'Mitt Panel' },
    { to: '/adaptiv-test',  icon: '🧠', label: 'Adaptiv Test', badge: 'AI', badgeColor: 'var(--brand-accent)' },
    { to: '/oppgaver',      icon: '📝', label: 'Mine Oppgaver' },
    { to: '/progresjon',    icon: '📈', label: 'Progresjon' },
    { to: '/innstillinger', icon: '⚙️', label: 'Innstillinger' },
  ],
  admin: [
    { to: '/',              icon: '🏠', label: 'Oversikt' },
    { to: '/admin',         icon: '⚙️', label: 'Administrasjon' },
    { to: '/brukere',       icon: '👥', label: 'Brukere' },
    { to: '/skoler',        icon: '🏫', label: 'Skoler' },
    { to: '/analyse',       icon: '📊', label: 'Analyse' },
    { to: '/logg',          icon: '📋', label: 'Systemlogg' },
    { to: '/innstillinger', icon: '⚙️', label: 'Innstillinger' },
  ],
};

const ROLE_THEME = {
  teacher: { gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', label: 'Lærer', color: 'var(--brand-primary)' },
  student: { gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)', label: 'Elev', color: 'var(--brand-info)' },
  admin:   { gradient: 'linear-gradient(135deg,#ef4444,#f97316)', label: 'Admin', color: 'var(--brand-danger)' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navItems = NAV[user.role] || NAV.student;
  const theme    = ROLE_THEME[user.role] || ROLE_THEME.student;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className={`sidebar${collapsed ? ' collapsed' : ''}`}
      style={{ transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)', width: collapsed ? 64 : 224 }}
    >
      {/* Logo */}
      <div className="sidebar-logo" style={{ padding: collapsed ? '20px 0' : '20px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
        }}>🎓</div>
        {!collapsed && (
          <div style={{ marginLeft: 10, overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2, whiteSpace: 'nowrap' }}>Utdanning</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Norge</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.75rem', padding: 4,
            display: collapsed ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >⟨</button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            background: theme.gradient, borderRadius: 'var(--radius-md)',
            padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
              {user.name?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'white', lineHeight: 1.2 }}>{user.name?.split(' ')[0]}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>{theme.label}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start', position: 'relative' }}
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="sidebar-link-label">{item.label}</span>
                {item.badge && (
                  <span className="badge" style={{
                    marginLeft: 'auto', fontSize: '0.6rem', padding: '2px 7px',
                    background: `${item.badgeColor}22`, color: item.badgeColor, border: `1px solid ${item.badgeColor}44`,
                  }}>{item.badge}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0 8px 20px', marginTop: 'auto' }}>
        {collapsed && (
          <button title="Utvid" onClick={() => setCollapsed(false)} style={{ width: '100%', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', padding: '8px 0', cursor: 'pointer', marginBottom: 8, fontSize: '0.85rem' }}>
            ⟩
          </button>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', textAlign: collapsed ? 'center' : 'left', justifyContent: collapsed ? 'center' : 'flex-start', color: 'var(--brand-danger)', border: 'none', cursor: 'pointer', background: 'none' }}
        >
          <span className="sidebar-link-icon">🚪</span>
          {!collapsed && <span className="sidebar-link-label">Logg ut</span>}
        </button>
      </div>
    </aside>
  );
}
