import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const avatarClass = user.role === 'teacher' ? 'avatar-teacher'
    : user.role === 'student' ? 'avatar-student'
    : 'avatar-admin';

  const roleLabel = user.role === 'teacher' ? 'Lærer'
    : user.role === 'student' ? 'Elev'
    : 'Administrator';

  return (
    <header className="app-header">
      <div className="header-left">
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {title || 'Utdanningsplattform'}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{subtitle}</div>
          )}
        </div>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="header-search">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Søk..." />
        </div>

        {/* Notifications */}
        <button className="header-icon-btn" title="Varslinger">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="notif-dot"></span>
        </button>

        {/* User pill */}
        <div className="user-pill">
          <div className={`user-avatar ${avatarClass}`}>
            {user.avatar}
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
