import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const CHART_DATA = [
  { label: 'Okt', val: 62 }, { label: 'Nov', val: 68 }, { label: 'Des', val: 71 },
  { label: 'Jan', val: 74 }, { label: 'Feb', val: 78 }, { label: 'Mar', val: 83 },
];

const WEAK_TOPICS = [
  { topic: 'Brøkregning', avg: 55, class: '10A', students: 4 },
  { topic: 'Algebra – likninger', avg: 62, class: '10A', students: 6 },
  { topic: 'Python løkker', avg: 48, class: '10B', students: 5 },
  { topic: 'Norsk grammatikk', avg: 68, class: '9A', students: 3 },
];

export default function AnalyticsDashboard() {
  const { students, submissions, assignments } = useApp();
  const [selectedClass, setSelectedClass] = useState('Alle');

  const classes = ['Alle', '10A', '10B', '9A'];
  const filteredStudents = selectedClass === 'Alle' ? students : students.filter(s => s.class === selectedClass);
  const avgSkill = filteredStudents.length
    ? Math.round(filteredStudents.reduce((a, s) => a + s.skillLevel, 0) / filteredStudents.length)
    : 0;
  const maxChart = Math.max(...CHART_DATA.map(d => d.val));

  return (
    <div>
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>📊 Analyse og Rapporter</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Klasseromsdata, svake tema og elevprogresjon</p>
        </div>
        <select className="form-select" style={{ width: 'auto', padding: '9px 16px' }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          {classes.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Snitt ferdighetsnivå', value: `${avgSkill}%`, icon: '🎯', accent: 'accent-blue' },
          { label: 'Totale innleveringer',  value: submissions.length, icon: '📝', accent: 'accent-green' },
          { label: 'Svake tema oppdaget',   value: WEAK_TOPICS.length, icon: '⚠️', accent: 'accent-yellow' },
          { label: 'Aktive elever',         value: filteredStudents.length, icon: '🎓', accent: 'accent-purple' },
        ].map((s, i) => (
          <div key={i} className={`stat-card card-3d ${s.accent} stagger-item`}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
        {/* Trend Chart */}
        <div className="card card-3d">
          <div className="card-header">
            <h3>📈 Klassegjennomsnitt over tid</h3>
            <span className="badge badge-green">↑ +21 pkt</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              {CHART_DATA.map((d, i) => (
                <div key={d.label} className="chart-bar-wrap">
                  <div
                    className="chart-bar"
                    data-val={`${d.val}%`}
                    style={{
                      height: `${(d.val / maxChart) * 100}%`,
                      animationDelay: `${i * 0.1}s`,
                      background: i === CHART_DATA.length - 1
                        ? 'var(--gradient-success)'
                        : 'var(--gradient-brand)',
                    }}
                  />
                  <span className="chart-bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weak topics */}
        <div className="card card-3d">
          <div className="card-header">
            <h3>🔍 AI: Svake tema</h3>
            <span className="badge badge-red">Trenger fokus</span>
          </div>
          <div className="card-body">
            {WEAK_TOPICS.map((t, i) => (
              <div key={i} className="stagger-item" style={{ marginBottom: 16, animationDelay: `${i * 0.08}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.topic}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Klasse {t.class} · {t.students} elever sliter</div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: t.avg < 60 ? 'var(--brand-danger)' : 'var(--brand-warning)' }}>
                    {t.avg}%
                  </span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className="skill-bar-fill"
                    style={{
                      width: `${t.avg}%`,
                      background: t.avg < 60 ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    }}
                  />
                </div>
              </div>
            ))}
            <div style={{ padding: '10px 12px', background: 'rgba(139,92,246,0.1)', borderRadius: 'var(--radius-md)', marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              🤖 <strong style={{ color: 'var(--brand-secondary)' }}>AI-anbefaling:</strong> Generer tilpassede øvingsoppgaver for disse temaene.
            </div>
          </div>
        </div>
      </div>

      {/* Student table */}
      <div className="card card-3d">
        <div className="card-header">
          <h3>🎓 Elevprogresjon – {selectedClass}</h3>
          <button className="btn btn-ghost btn-sm">⬇ Eksporter</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Elev</th><th>Klasse</th><th>Ferdighetsnivå</th><th>Innlev.</th><th>Trend</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, i) => (
                <tr key={s.id} className="stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar avatar-student" style={{ width: 32, height: 32, fontSize: '0.72rem' }}>
                        {s.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {s.name}
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{s.class}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden', minWidth: 80 }}>
                        <div style={{ width: `${s.skillLevel}%`, height: '100%', background: s.skillLevel >= 80 ? 'var(--brand-success)' : 'var(--brand-primary)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                      </div>
                      <strong>{s.skillLevel}%</strong>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{submissions.filter(sub => sub.studentId === s.id).length}</td>
                  <td>
                    <span className="badge badge-green">↑ +{Math.floor(Math.random() * 8 + 2)}%</span>
                  </td>
                  <td>
                    <span className={`badge ${s.skillLevel >= 70 ? 'badge-green' : s.skillLevel >= 55 ? 'badge-yellow' : 'badge-red'}`}>
                      {s.skillLevel >= 70 ? '✅ På sporet' : s.skillLevel >= 55 ? '⚠️ Følg opp' : '🚨 Trenger hjelp'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
