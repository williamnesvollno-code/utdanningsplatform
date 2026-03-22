import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const ROLE_LABELS = { student: 'Elev', teacher: 'Lærer', admin: 'Admin' };
const ROLE_COLORS = { student: 'badge-green', teacher: 'badge-blue', admin: 'badge-red' };

export default function UserManagement() {
  const { students, teachers, addUser } = useApp();
  const { addLog } = useAuth();

  const [search, setSearch]   = useState('');
  const [roleFilter, setRole] = useState('Alle');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', role: 'student', class: '10A' });

  const allUsers = [
    ...students.map(s => ({ ...s, role: 'student' })),
    ...teachers.map(t => ({ ...t, role: 'teacher' })),
    { id: 'u3', name: 'Admin Bruker', email: 'admin@utdanning.no', role: 'admin' },
  ];

  const filtered = allUsers.filter(u =>
    (roleFilter === 'Alle' || u.role === roleFilter.toLowerCase()) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    addUser(form);
    addLog(`Admin opprettet bruker: ${form.name} (${form.role})`);
    setModal(false);
    setForm({ name: '', email: '', role: 'student', class: '10A' });
  };

  return (
    <div>
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>👥 Brukeradministrasjon</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Administrer elever, lærere og administratorer</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          ➕ Ny Bruker
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Elever',      value: students.length, icon: '🎓', accent: 'accent-green' },
          { label: 'Lærere',      value: teachers.length, icon: '👩‍🏫', accent: 'accent-blue' },
          { label: 'Admin',       value: 1,               icon: '🔐', accent: 'accent-red' },
          { label: 'Totalt',      value: allUsers.length, icon: '👥', accent: 'accent-purple' },
        ].map((s, i) => (
          <div key={i} className={`stat-card card-3d ${s.accent} stagger-item`}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 240 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Søk på navn eller e-post..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ margin: 0 }}>
          {['Alle', 'Student', 'Teacher', 'Admin'].map(r => (
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
              <tr><th>Bruker</th><th>E-post</th><th>Rolle</th><th>Klasse / Fag</th><th>Status</th><th>Handlinger</th></tr>
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
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td><span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {u.class || (u.subjects ? u.subjects.join(', ') : '–')}
                  </td>
                  <td><span className="badge badge-green">● Aktiv</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm">✏️</button>
                      <button className="btn btn-danger btn-sm">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Ingen brukere funnet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="➕ Ny Bruker"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Avbryt</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name || !form.email}>Opprett</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Fullt navn *</label>
          <input className="form-input" placeholder="Ola Nordmann" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">E-post *</label>
          <input className="form-input" type="email" placeholder="ola@skole.no" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Rolle</label>
          <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="student">Elev</option>
            <option value="teacher">Lærer</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        {form.role === 'student' && (
          <div className="form-group">
            <label className="form-label">Klasse</label>
            <select className="form-select" value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))}>
              {['10A','10B','9A','9B','8A'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          🔒 Brukerdata behandles i samsvar med GDPR. En velkomst-e-post sendes automatisk.
        </div>
      </Modal>
    </div>
  );
}
