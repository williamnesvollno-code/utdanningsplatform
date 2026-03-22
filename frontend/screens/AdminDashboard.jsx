import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const SYSTEM_STATUS = [
  { label: 'API Server',          status: 'Online', color: 'badge-green', uptime: '99.98%' },
  { label: 'Database (PostgreSQL)', status: 'Online', color: 'badge-green', uptime: '99.95%' },
  { label: 'AI-tjeneste',         status: 'Online', color: 'badge-green', uptime: '99.87%' },
  { label: 'Visma-integrasjon',   status: 'Degradert', color: 'badge-yellow', uptime: '97.1%' },
  { label: 'E-posttjeneste',      status: 'Online', color: 'badge-green', uptime: '100%' },
];

export default function AdminDashboard() {
  const { students, teachers, schools, assignments, submissions } = useApp();
  const { logs } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>⚙️ Administrasjonspanel</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Systemstatus, brukere og skoler</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/brukere')}>👥 Brukere</button>
          <button className="btn btn-primary" onClick={() => navigate('/analyse')}>📊 Analyse</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Elever',    value: students.length,    icon: '🎓', accent: 'accent-blue' },
          { label: 'Lærere',    value: teachers.length,    icon: '👩‍🏫', accent: 'accent-purple' },
          { label: 'Skoler',    value: schools.length,     icon: '🏫', accent: 'accent-green' },
          { label: 'Oppgaver',  value: assignments.length, icon: '📋', accent: 'accent-cyan' },
          { label: 'Innlev.',   value: submissions.length, icon: '✅', accent: 'accent-yellow' },
          { label: 'Loggoppf.',  value: logs.length,       icon: '📋', accent: 'accent-red' },
        ].map((s, i) => (
          <div key={i} className={`stat-card card-3d ${s.accent} stagger-item`} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
        {/* System Status */}
        <div className="card card-3d">
          <div className="card-header">
            <h3>🟢 Systemstatus</h3>
            <div className="pulse-dot"></div>
          </div>
          <div className="card-body" style={{ padding: '0 24px' }}>
            {SYSTEM_STATUS.map((s, i) => (
              <div key={i} className="stagger-item" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0', borderBottom: i < SYSTEM_STATUS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                animationDelay: `${i * 0.08}s`,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oppetid: {s.uptime}</div>
                </div>
                <span className={`badge ${s.color}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schools */}
        <div className="card card-3d">
          <div className="card-header">
            <h3>🏫 Skoler</h3>
            <span className="badge badge-blue">{schools.length} skoler</span>
          </div>
          <div className="card-body" style={{ padding: '0 24px' }}>
            {schools.map((s, i) => (
              <div key={s.id} className="stagger-item" style={{
                padding: '16px 0',
                borderBottom: i < schools.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                animationDelay: `${i * 0.1}s`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{s.city}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>{s.students} elever</div>
                    <div>{s.teachers} lærere</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                  <span className="badge badge-blue">{s.classes} klasser</span>
                  <span className="badge badge-green">● Aktiv</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="card card-3d">
        <div className="card-header">
          <h3>📋 Systemlogg (revisjonsspor)</h3>
          <span className="badge badge-cyan">GDPR-samsvar</span>
        </div>
        <div className="card-body" style={{ padding: '0 24px' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Ingen loggoppføringer ennå. Utfør handlinger for å se revisjonsspor.
            </div>
          ) : (
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {logs.map((l, i) => (
                <div key={l.id} className="stagger-item" style={{
                  padding: '10px 0', display: 'flex', gap: 14, alignItems: 'flex-start',
                  borderBottom: '1px solid var(--border-subtle)', animationDelay: `${i * 0.03}s`,
                }}>
                  <div style={{ width: 8, height: 8, background: 'var(--brand-primary)', borderRadius: '50%', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.845rem', color: 'var(--text-primary)' }}>{l.msg}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(l.time).toLocaleString('no-NO')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
