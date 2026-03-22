import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const ROLE_LABELS = { student: 'Elev', teacher: 'Lærer', admin: 'Admin' };
const ROLE_COLORS = { student: 'badge-green', teacher: 'badge-blue', admin: 'badge-red' };

export default function UserManagement() {
  const { profiles } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRole] = useState('Alle');
  const [modal, setModal] = useState(false);

  const allUsers = useMemo(
    () =>
      profiles.map((p) => ({
        id: p.id,
        name: p.display_name,
        email: p.email || '',
        role: p.role,
        class:
          p.role === 'student'
            ? p.class_name || '—'
            : p.classes?.length
              ? p.classes.join(', ')
              : p.subjects?.length
                ? p.subjects.join(', ')
                : '—',
        subjects: p.subjects,
      })),
    [profiles]
  );

  const students = profiles.filter((p) => p.role === 'student');
  const teachers = profiles.filter((p) => p.role === 'teacher');
  const admins = profiles.filter((p) => p.role === 'admin');

  const filtered = allUsers.filter(
    (u) =>
      (roleFilter === 'Alle' || u.role === roleFilter.toLowerCase()) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>👥 Brukeradministrasjon</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Brukere fra Supabase (Auth + profiler)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          ℹ️ Ny bruker
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Elever', value: students.length, icon: '🎓', accent: 'accent-green' },
          { label: 'Lærere', value: teachers.length, icon: '👩‍🏫', accent: 'accent-blue' },
          { label: 'Admin', value: admins.length, icon: '🔐', accent: 'accent-red' },
          { label: 'Totalt', value: allUsers.length, icon: '👥', accent: 'accent-purple' },
        ].map((s, i) => (
          <div key={i} className={`stat-card card-3d ${s.accent} stagger-item`}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 240 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input placeholder="Søk på navn eller e-post..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ margin: 0 }}>
          {['Alle', 'Student', 'Teacher', 'Admin'].map((r) => (
            <button key={r} className={`tab-btn${roleFilter === r ? ' active' : ''}`} onClick={() => setRole(r)}>
              {r === 'Student' ? '🎓 Elever' : r === 'Teacher' ? '👩‍🏫 Lærere' : r === 'Admin' ? '🔐 Admin' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Bruker</th>
                <th>E-post</th>
                <th>Rolle</th>
                <th>Klasse / Fag</th>
                <th>Status</th>
                <th>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className="stagger-item" style={{ animationDelay: `${i * 0.04}s` }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        className={`user-avatar ${u.role === 'teacher' ? 'avatar-teacher' : u.role === 'admin' ? 'avatar-admin' : 'avatar-student'}`}
                        style={{ width: 34, height: 34, fontSize: '0.75rem' }}
                      >
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.id.slice(0, 8)}…</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {u.class || (u.subjects ? u.subjects.join(', ') : '–')}
                  </td>
                  <td>
                    <span className="badge badge-green">● Aktiv</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="btn btn-ghost btn-sm" title="Kommer">
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                    Ingen brukere funnet. Registrer første bruker på innloggingssiden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="➕ Legge til bruker"
        footer={
          <button className="btn btn-primary" onClick={() => setModal(false)}>
            Lukk
          </button>
        }
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Nye brukere opprettes med <strong>Registrer</strong> på innloggingssiden. De lagres i Supabase Auth, og profilen opprettes automatisk.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 12 }}>
          For produksjon kan du senere bruke invitasjoner eller en admin-Edge Function med service role.
        </p>
      </Modal>
    </div>
  );
}
