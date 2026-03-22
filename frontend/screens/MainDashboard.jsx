import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const ROLE_LABELS = { teacher: 'Lærer', student: 'Elev', admin: 'Administrator' };

const ACTIVITY = [
  { icon: '✅', color: 'rgba(16,185,129,0.15)', text: '<strong>Ole Hansen</strong> leverte Brøkregning – Del 1', time: '5 min siden' },
  { icon: '🤖', color: 'rgba(99,102,241,0.15)',  text: '<strong>AI</strong> genererte 5 nye oppgaveforslag for deg', time: '12 min siden' },
  { icon: '📝', color: 'rgba(245,158,11,0.15)',  text: '<strong>Emma Larsen</strong> leverte Norsk Grammatikk', time: '28 min siden' },
  { icon: '🏆', color: 'rgba(6,182,212,0.15)',   text: '<strong>Jonas Berg</strong> oppnådde 100% på Python-oppgave', time: '1 time siden' },
  { icon: '⚠️', color: 'rgba(239,68,68,0.15)',   text: '<strong>Erik Johansen</strong> har ikke levert Python Basis', time: '2 timer siden' },
];

export default function MainDashboard() {
  const { user } = useAuth();
  const { assignments, students, submissions } = useApp();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ assignments: 0, students: 0, submissions: 0, pending: 0 });

  // Animated count-up
  useEffect(() => {
    const target = {
      assignments: assignments.filter(a => a.status === 'Aktiv').length,
      students: students.length,
      submissions: submissions.length,
      pending: submissions.filter(s => !s.graded).length,
    };
    let frame = 0;
    const duration = 60;
    const timer = setInterval(() => {
      frame++;
      const progress = Math.min(frame / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        assignments: Math.round(target.assignments * ease),
        students:    Math.round(target.students * ease),
        submissions: Math.round(target.submissions * ease),
        pending:     Math.round(target.pending * ease),
      });
      if (frame >= duration) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isAdmin   = user?.role === 'admin';

  const quickActions = isTeacher
    ? [
        { label: 'Ny Oppgave', icon: '➕', path: '/oppgaver/ny', color: 'var(--brand-primary)' },
        { label: 'Analyser Klasse', icon: '📊', path: '/analyse', color: 'var(--brand-accent)' },
        { label: 'AI-Assistent', icon: '🤖', path: '/ai-chat', color: 'var(--brand-secondary)' },
        { label: 'Mitt Panel', icon: '📋', path: '/teacher', color: 'var(--brand-success)' },
      ]
    : isStudent
    ? [
        { label: 'Mine Oppgaver', icon: '📝', path: '/oppgaver', color: 'var(--brand-primary)' },
        { label: 'Min Progresjon', icon: '📈', path: '/progresjon', color: 'var(--brand-success)' },
        { label: 'AI-Hjelp', icon: '🤖', path: '/ai-chat', color: 'var(--brand-secondary)' },
        { label: 'Mitt Panel', icon: '🎓', path: '/student', color: 'var(--brand-accent)' },
      ]
    : [
        { label: 'Brukere', icon: '👥', path: '/brukere', color: 'var(--brand-primary)' },
        { label: 'Analyser', icon: '📊', path: '/analyse', color: 'var(--brand-accent)' },
        { label: 'Adminpanel', icon: '⚙️', path: '/admin', color: 'var(--brand-warning)' },
        { label: 'Systemlogg', icon: '📋', path: '/logg', color: 'var(--brand-danger)' },
      ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15), rgba(6,182,212,0.1))',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 36px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
        animation: 'flipInX 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {ROLE_LABELS[user?.role] || 'Bruker'} · {user?.school}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
            God morgen, <span className="gradient-text-animated">{user?.name?.split(' ')[0]} 👋</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isTeacher && `Du har ${assignments.filter(a => a.status === 'Aktiv').length} aktive oppgaver og ${students.length} elever.`}
            {isStudent && 'Du har 2 oppgaver med frist denne uken. Lykke til!'}
            {isAdmin   && `Plattformen er aktiv med ${students.length} elever og ${assignments.length} oppgaver.`}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        {isTeacher && [
          { label: 'Aktive Oppgaver',   value: counts.assignments, icon: '📋', accent: 'accent-blue' },
          { label: 'Elever Totalt',      value: counts.students,    icon: '🎓', accent: 'accent-green' },
          { label: 'Innleveringer',      value: counts.submissions,  icon: '✅', accent: 'accent-cyan' },
          { label: 'Venter Vurdering',   value: counts.pending,      icon: '⏳', accent: 'accent-yellow' },
        ].map((s, i) => (
          <div key={i} className={`stat-card card-3d ${s.accent} stagger-item`}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-trend trend-up">↑ denne måneden</div>
          </div>
        ))}
        {isStudent && [
          { label: 'Fullførte Oppgaver', value: 3,   icon: '✅', accent: 'accent-green' },
          { label: 'Pågående',           value: 2,   icon: '📝', accent: 'accent-blue' },
          { label: 'Snittskår',          value: '87%', icon: '🎯', accent: 'accent-cyan' },
          { label: 'Dager aktiv',        value: 12,  icon: '🔥', accent: 'accent-yellow' },
        ].map((s, i) => (
          <div key={i} className={`stat-card card-3d ${s.accent} stagger-item`}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
        {isAdmin && [
          { label: 'Elever',     value: counts.students,    icon: '🎓', accent: 'accent-blue' },
          { label: 'Lærere',     value: 3,                   icon: '👩‍🏫', accent: 'accent-purple' },
          { label: 'Skoler',     value: 3,                   icon: '🏫', accent: 'accent-green' },
          { label: 'Oppgaver',   value: counts.assignments,  icon: '📋', accent: 'accent-cyan' },
        ].map((s, i) => (
          <div key={i} className={`stat-card card-3d ${s.accent} stagger-item`}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Quick Actions */}
        <div className="card card-3d">
          <div className="card-header">
            <h3>⚡ Hurtigvalg</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  className="btn btn-secondary stagger-item"
                  style={{ justifyContent: 'flex-start', gap: 10, padding: '14px 16px' }}
                  onClick={() => navigate(a.path)}
                >
                  <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        {isTeacher && (
          <div className="card card-3d">
            <div className="card-header">
              <h3>🔔 Aktivitet</h3>
              <div className="pulse-dot"></div>
            </div>
            <div className="card-body" style={{ padding: '0 24px' }}>
              <div className="activity-feed">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className={`activity-item stagger-item`}>
                    <div className="activity-dot" style={{ background: a.color, fontSize: '1rem' }}>{a.icon}</div>
                    <div className="activity-content">
                      <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                      <div className="activity-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming deadlines for student */}
        {isStudent && (
          <div className="card card-3d">
            <div className="card-header">
              <h3>📅 Kommende frister</h3>
            </div>
            <div className="card-body">
              <div className="assignment-grid">
                {assignments.filter(a => a.status === 'Aktiv').slice(0, 3).map((a, i) => (
                  <div key={a.id} className={`assignment-item stagger-item`}>
                    <div className="assignment-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>{a.icon}</div>
                    <div className="assignment-info">
                      <div className="assignment-title">{a.title}</div>
                      <div className="assignment-meta">Frist: {a.due}</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/oppgaver/${a.id}`)}>
                      Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
