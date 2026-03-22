import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const TYPE_COLORS = {
  flervalg: 'badge-blue',
  'kort svar': 'badge-green',
  kode: 'badge-purple',
  matte: 'badge-cyan',
};

const STATUS_COLORS = {
  Aktiv:    'badge-green',
  Kommende: 'badge-yellow',
  Vurdert:  'badge-gray',
  Arkivert: 'badge-gray',
};

export default function TeacherDashboard() {
  const { assignments, deleteAssignment, updateAssignment, students, submissions, getAssignmentSubmissions } = useApp();
  const { addLog } = useAuth();
  const navigate = useNavigate();
  const [filterClass, setFilterClass] = useState('Alle');
  const [filterStatus, setFilterStatus] = useState('Alle');
  const [deleteModal, setDeleteModal] = useState(null);
  const [activeTab, setActiveTab] = useState('oppgaver');

  const classes = ['Alle', '10A', '10B', '9A'];
  const statuses = ['Alle', 'Aktiv', 'Kommende', 'Vurdert', 'Arkivert'];

  const filtered = assignments.filter(a =>
    (filterClass === 'Alle'  || a.class === filterClass) &&
    (filterStatus === 'Alle' || a.status === filterStatus)
  );

  const handleDelete = () => {
    deleteAssignment(deleteModal.id);
    addLog(`Slettet oppgave: ${deleteModal.title}`);
    setDeleteModal(null);
  };

  const handleStatusToggle = (a) => {
    const next = a.status === 'Aktiv' ? 'Arkivert' : 'Aktiv';
    updateAssignment(a.id, { status: next });
    addLog(`Endret status på "${a.title}" til ${next}`);
  };

  // Per-assignment submission count
  const subCount = (id) => submissions.filter(s => s.assignmentId === id).length;
  const avgScore = (id) => {
    const subs = submissions.filter(s => s.assignmentId === id);
    if (!subs.length) return '–';
    return Math.round(subs.reduce((acc, s) => acc + s.score, 0) / subs.length) + '%';
  };

  return (
    <div>
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>📋 Lærerpanel</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Administrer dine klasser, oppgaver og resultater</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/oppgaver/ny')}>
          ➕ Ny Oppgave
        </button>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Aktive Oppgaver', value: assignments.filter(a => a.status === 'Aktiv').length, icon: '📋', accent: 'accent-blue' },
          { label: 'Totale Elever',   value: students.length, icon: '🎓', accent: 'accent-green' },
          { label: 'Innleveringer',   value: submissions.length, icon: '✅', accent: 'accent-cyan' },
          { label: 'Snittskår',       value: submissions.length ? Math.round(submissions.reduce((a,s)=>a+s.score,0)/submissions.length)+'%' : '–', icon: '📊', accent: 'accent-purple' },
        ].map((s, i) => (
          <div key={i} className={`stat-card card-3d ${s.accent} stagger-item`}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['oppgaver', 'elever'].map(tab => (
          <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'oppgaver' ? '📋 Oppgaver' : '🎓 Elever'}
          </button>
        ))}
      </div>

      {activeTab === 'oppgaver' && (
        <div className="card" style={{ animation: 'slideInUp 0.3s ease' }}>
          {/* Filters */}
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <h3>Oppgaveliste</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select className="form-select" style={{ width: 'auto', padding: '7px 12px' }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="form-select" style={{ width: 'auto', padding: '7px 12px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="btn btn-ai btn-sm" onClick={() => navigate('/oppgaver/ny')}>
                🤖 Generer med AI
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Oppgave</th><th>Klasse</th><th>Type</th><th>Status</th>
                  <th>Innl.</th><th>Snitt</th><th>Frist</th><th>Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id} className="stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.subject}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{a.class}</span></td>
                    <td><span className={`badge ${TYPE_COLORS[a.type] || 'badge-gray'}`}>{a.type}</span></td>
                    <td><span className={`badge ${STATUS_COLORS[a.status] || 'badge-gray'}`}>{a.status}</span></td>
                    <td style={{ fontWeight: 600 }}>{subCount(a.id)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--brand-success)' }}>{avgScore(a.id)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.due}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/oppgaver/${a.id}`)}>📊</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatusToggle(a)} title={a.status === 'Aktiv' ? 'Deaktiver' : 'Aktiver'}>
                          {a.status === 'Aktiv' ? '⏸' : '▶️'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(a)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Ingen oppgaver funnet. <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={() => navigate('/oppgaver/ny')}>Lag ny oppgave</button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'elever' && (
        <div className="card" style={{ animation: 'slideInUp 0.3s ease' }}>
          <div className="card-header"><h3>Elevliste</h3></div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Elev</th><th>Klasse</th><th>Ferdighetsnivå</th><th>Innleveringer</th><th>Status</th></tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className="stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar avatar-student" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {s.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{s.class}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden', minWidth: 80 }}>
                          <div style={{ width: `${s.skillLevel}%`, height: '100%', background: s.skillLevel >= 80 ? 'var(--brand-success)' : s.skillLevel >= 60 ? 'var(--brand-primary)' : 'var(--brand-warning)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', minWidth: 36 }}>{s.skillLevel}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{submissions.filter(sub => sub.studentId === s.id).length}</td>
                    <td><span className="badge badge-green">● Aktiv</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Slett oppgave"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteModal(null)}>Avbryt</button>
            <button className="btn btn-danger" onClick={handleDelete}>🗑 Slett</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Er du sikker på at du vil slette <strong style={{ color: 'var(--text-primary)' }}>"{deleteModal?.title}"</strong>?
          Dette kan ikke angres.
        </p>
      </Modal>
    </div>
  );
}
