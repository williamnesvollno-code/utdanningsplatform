import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const ACHIEVEMENTS = [
  { id: 'first_submit',  icon: '🎯', label: 'Første innlevering',  desc: 'Leverte første oppgave',    earned: true  },
  { id: 'perfect_score', icon: '💯', label: 'Perfekt skår',        desc: '100% på en oppgave',         earned: true  },
  { id: 'streak_3',      icon: '🔥', label: '3-dagers streak',     desc: 'Aktiv 3 dager på rad',       earned: true  },
  { id: 'adaptive',      icon: '🧠', label: 'Adaptiv lærling',     desc: 'Fullførte adaptiv test',     earned: false },
  { id: 'top_class',     icon: '🏆', label: 'Klassens beste',      desc: 'Topp 1 i klassen',           earned: false },
  { id: 'speed_run',     icon: '⚡', label: 'Speed Run',           desc: 'Løste oppgave under 2 min',  earned: false },
];

const DAILY_CHALLENGE = {
  text: 'Hva er 7² - 3²?',
  answer: '40',
  xp: 50,
  subject: 'Matematikk',
};

const LEADERBOARD = [
  { rank: 1, name: 'Emma Larsen',    score: 88, streak: 7,  avatar: 'EL', you: false },
  { rank: 2, name: 'Sarah Nilsen',   score: 85, streak: 12, avatar: 'SN', you: false },
  { rank: 3, name: 'Ole Hansen',     score: 72, streak: 3,  avatar: 'OH', you: true  },
  { rank: 4, name: 'Mia Andersen',   score: 70, streak: 5,  avatar: 'MA', you: false },
  { rank: 5, name: 'Lukas Pettersen',score: 67, streak: 2,  avatar: 'LP', you: false },
];

const XP_FOR_LEVEL = [0, 100, 250, 500, 900, 1400];
const STUDENT_XP = 320;

function getStudentLevel(xp) {
  for (let i = XP_FOR_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_FOR_LEVEL[i]) return { level: i + 1, current: xp - XP_FOR_LEVEL[i], needed: (XP_FOR_LEVEL[i + 1] || XP_FOR_LEVEL[i] + 500) - XP_FOR_LEVEL[i] };
  }
  return { level: 1, current: xp, needed: 100 };
}

export default function StudentDashboard() {
  const { assignments, submissions, getSkillProfile, getStudentSubmissions } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dailyAnswer, setDailyAnswer] = useState('');
  const [dailySolved, setDailySolved] = useState(false);
  const [activeTab, setActiveTab] = useState('oversikt');
  const [flip, setFlip] = useState(null);

  const studentId = user?.id;
  const profile   = getSkillProfile(studentId);
  const mySubs    = getStudentSubmissions(studentId);
  const active    = assignments.filter(a => a.status === 'Aktiv');
  const pending   = active.filter(a => !mySubs.find(s => s.assignmentId === a.id));
  const completed = mySubs.map(s => assignments.find(a => a.id === s.assignmentId)).filter(Boolean);
  const avgScore  = mySubs.length ? Math.round(mySubs.reduce((a, s) => a + s.score, 0) / mySubs.length) : 0;
  const { level: xpLevel, current: xpCurrent, needed: xpNeeded } = getStudentLevel(STUDENT_XP);
  const xpProgress = Math.round((xpCurrent / xpNeeded) * 100);

  const skillBars = [
    { label: 'Matematikk',    val: profile.Matematikk   || 68, color: '' },
    { label: 'Norsk',         val: profile.Norsk         || 82, color: 'green' },
    { label: 'Naturfag',      val: profile.Naturfag      || 75, color: 'cyan' },
    { label: 'Programmering', val: profile.Programmering || 50, color: 'yellow' },
  ];

  const handleDailySubmit = () => {
    if (dailyAnswer.trim() === DAILY_CHALLENGE.answer) setDailySolved(true);
  };

  return (
    <div>
      {/* XP / Level Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2), rgba(6,182,212,0.1))',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        marginBottom: 28,
        position: 'relative', overflow: 'hidden',
        animation: 'flipInX 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, flexShrink: 0, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            {xpLevel}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Level {xpLevel} · <span className="gradient-text-animated">{user?.name?.split(' ')[0]}</span></span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{STUDENT_XP} / {XP_FOR_LEVEL[xpLevel] || STUDENT_XP + xpNeeded} XP</span>
            </div>
            <div style={{ height: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${xpProgress}%`, height: '100%', background: 'var(--gradient-brand)', borderRadius: 'var(--radius-full)', transition: 'width 1s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 0 10px rgba(99,102,241,0.5)' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 5 }}>{xpNeeded - xpCurrent} XP til neste level</div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-warning)' }}>🔥 3</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Streak</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-success)' }}>{avgScore}%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Snitt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Fullførte', value: completed.length, icon: '✅', accent: 'accent-green' },
          { label: 'Aktive',    value: pending.length,   icon: '📝', accent: 'accent-blue' },
          { label: 'Snittskår', value: `${avgScore}%`,   icon: '🎯', accent: 'accent-cyan' },
          { label: 'Badges',    value: ACHIEVEMENTS.filter(a=>a.earned).length, icon: '🏅', accent: 'accent-yellow' },
        ].map((s, i) => (
          <div key={i} className={`stat-card card-3d ${s.accent} stagger-item`}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {['oversikt','oppgaver','progresjon','leaderboard','badges'].map(tab => (
          <button key={tab} className={`tab-btn${activeTab===tab?' active':''}`} onClick={()=>setActiveTab(tab)}>
            {tab==='oversikt'?'🏠 Oversikt':tab==='oppgaver'?'📝 Oppgaver':tab==='progresjon'?'📈 Progresjon':tab==='leaderboard'?'🏆 Klassen':'🏅 Badges'}
          </button>
        ))}
      </div>

      {/* ── OVERSIKT ── */}
      {activeTab === 'oversikt' && (
        <div style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
          <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
            {/* Daily Challenge */}
            <div className="card card-3d" style={{ border: dailySolved ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(245,158,11,0.3)', background: dailySolved ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.05)' }}>
              <div className="card-header">
                <h3>⚡ Dagens Utfordring</h3>
                {!dailySolved && <span className="badge badge-yellow">+{DAILY_CHALLENGE.xp} XP</span>}
                {dailySolved  && <span className="badge badge-green">✅ Fullført!</span>}
              </div>
              <div className="card-body">
                {!dailySolved ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 16, color: 'var(--text-primary)' }}>{DAILY_CHALLENGE.text}</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input className="form-input" style={{ flex: 1 }} placeholder="Svaret ditt..." value={dailyAnswer} onChange={e => setDailyAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDailySubmit()} />
                      <button className="btn btn-primary" onClick={handleDailySubmit}>Svar</button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                      Fag: {DAILY_CHALLENGE.subject} · Daglig utfordring gjelder i 24t
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎉</div>
                    <div style={{ fontWeight: 700, color: 'var(--brand-success)' }}>Riktig! +{DAILY_CHALLENGE.xp} XP</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Kom tilbake i morgen for ny utfordring</div>
                  </div>
                )}
              </div>
            </div>

            {/* Adaptive AI test CTA */}
            <div className="card card-3d" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }} onClick={() => navigate('/adaptiv-test')}>
              <div className="card-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'float 2.5s ease-in-out infinite' }}>🧠</div>
                <h3 style={{ marginBottom: 8 }}>Adaptiv Læringstest</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  AI analyserer ditt nivå og genererer skreddersydde oppgaver automatisk
                </p>
                <button className="btn btn-ai" style={{ pointerEvents: 'none' }}>
                  🚀 Start diagnosetest
                </button>
              </div>
            </div>
          </div>

          {/* Pending assignments */}
          {pending.length > 0 && (
            <div className="card card-3d">
              <div className="card-header"><h3>📝 Aktive oppgaver</h3><span className="badge badge-blue">{pending.length}</span></div>
              <div className="card-body">
                {pending.slice(0,3).map((a, i) => (
                  <div key={a.id} className={`assignment-item stagger-item`} style={{ animationDelay: `${i*0.08}s` }}>
                    <div className="assignment-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>{a.icon}</div>
                    <div className="assignment-info">
                      <div className="assignment-title">{a.title}</div>
                      <div className="assignment-meta">{a.subject} · Frist {a.due}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="badge badge-yellow">+{a.difficulty * 20} XP</span>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/oppgaver/${a.id}`)}>Start →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── OPPGAVER ── */}
      {activeTab === 'oppgaver' && (
        <div style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
          <div className="grid-2" style={{ gap: 20 }}>
            <div className="card card-3d">
              <div className="card-header"><h3>⏳ Aktive</h3><span className="badge badge-blue">{pending.length}</span></div>
              <div className="card-body">
                {pending.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>🎉 Ingen aktive!</div> : pending.map((a, i) => (
                  <div key={a.id} className={`assignment-item stagger-item`} style={{ animationDelay: `${i*0.07}s`, flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                      <div className="assignment-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>{a.icon}</div>
                      <div className="assignment-info">
                        <div className="assignment-title">{a.title}</div>
                        <div className="assignment-meta">{a.subject} · Klasse {a.class} · Frist {a.due}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, width: '100%' }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/oppgaver/${a.id}`)}>
                        📝 Løs oppgave
                      </button>
                      <span className="badge badge-yellow">+{a.difficulty * 20} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card card-3d">
              <div className="card-header"><h3>✅ Fullført</h3><span className="badge badge-green">{completed.length}</span></div>
              <div className="card-body">
                {completed.length === 0 ? <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'20px 0' }}>Ingen ennå</div> : completed.map((a, i) => {
                  const sub = mySubs.find(s => s.assignmentId === a.id);
                  return (
                    <div key={a.id} className="stagger-item" style={{ display:'flex', gap:12, alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border-subtle)', animationDelay:`${i*0.07}s` }}>
                      <span style={{ fontSize: '1.3rem' }}>{a.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.subject}</div>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: sub?.score >= 70 ? 'var(--brand-success)' : 'var(--brand-warning)' }}>{sub?.score}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROGRESJON ── */}
      {activeTab === 'progresjon' && (
        <div style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
          <div className="grid-2" style={{ gap: 20 }}>
            <div className="card card-3d">
              <div className="card-header"><h3>📊 Ferdighetsprofil</h3></div>
              <div className="card-body">
                {skillBars.map(s => (
                  <div key={s.label} className="skill-bar">
                    <div className="skill-bar-header">
                      <span className="skill-bar-label">{s.label}</span>
                      <span className="skill-bar-value">{s.val}%</span>
                    </div>
                    <div className="skill-bar-track">
                      <div className={`skill-bar-fill ${s.color}`} style={{ width: `${s.val}%` }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 20, padding: '12px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  🤖 Bruk <strong style={{ color: 'var(--brand-primary)' }}>Adaptiv Test</strong> for å oppdatere profilen din automatisk.
                </div>
              </div>
            </div>
            <div className="card card-3d">
              <div className="card-header"><h3>📈 Læringshistorikk</h3></div>
              <div className="card-body">
                {[
                  { label: 'Denne uken',   val: 3, icon: '📅' },
                  { label: 'Denne måneden',val: 11, icon: '📆' },
                  { label: 'Totalt XP',    val: STUDENT_XP, icon: '⭐' },
                  { label: 'Nåværende streak', val: '3 dager 🔥', icon: '🔥' },
                  { label: 'Beste streak', val: '7 dager',    icon: '🏆' },
                ].map((item, i) => (
                  <div key={item.label} className="stagger-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', animationDelay: `${i*0.06}s` }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.icon} {item.label}</span>
                    <strong>{item.val}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {activeTab === 'leaderboard' && (
        <div style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)', maxWidth: 520 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)' }}>
            🔒 Anonymisert i henhold til GDPR. Kun navn er synlig, ikke personlig data.
          </div>
          <div className="card card-3d">
            <div className="card-header"><h3>🏆 Klassens Topp 5</h3><span className="badge badge-blue">Klasse 10A</span></div>
            <div className="card-body" style={{ padding: '0 24px' }}>
              {LEADERBOARD.map((entry, i) => (
                <div key={entry.rank} className="stagger-item" style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 0',
                  borderBottom: i < LEADERBOARD.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: entry.you ? 'rgba(99,102,241,0.04)' : 'transparent',
                  animationDelay: `${i * 0.08}s`,
                  borderRadius: entry.you ? 'var(--radius-md)' : 0,
                  margin: entry.you ? '2px -8px' : 0,
                  padding: entry.you ? '14px 8px' : '16px 0',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: entry.rank === 1 ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : entry.rank === 2 ? 'linear-gradient(135deg,#94a3b8,#cbd5e1)' : entry.rank === 3 ? 'linear-gradient(135deg,#b45309,#d97706)' : 'var(--bg-card)',
                    fontWeight: 800, fontSize: entry.rank <= 3 ? '1rem' : '0.8rem',
                    color: entry.rank <= 3 ? 'white' : 'var(--text-muted)',
                    flexShrink: 0,
                  }}>
                    {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : entry.rank}
                  </div>
                  <div className={`user-avatar ${entry.you ? 'avatar-student' : ''}`} style={{ width: 34, height: 34, fontSize: '0.72rem', background: entry.you ? '' : 'var(--bg-card-hover)', color: entry.you ? '' : 'var(--text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    {entry.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: entry.you ? 800 : 600, fontSize: '0.9rem', color: entry.you ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                      {entry.name} {entry.you && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>Deg</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>🔥 {entry.streak} dagers streak</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: entry.rank === 1 ? 'var(--brand-warning)' : 'var(--text-primary)' }}>
                    {entry.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BADGES ── */}
      {activeTab === 'badges' && (
        <div style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {ACHIEVEMENTS.map((a, i) => (
              <div
                key={a.id}
                className={`card-3d stagger-item`}
                style={{
                  padding: 20, borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                  border: `2px solid ${a.earned ? 'rgba(245,158,11,0.4)' : 'var(--border-subtle)'}`,
                  background: a.earned ? 'rgba(245,158,11,0.06)' : 'var(--bg-card)',
                  opacity: a.earned ? 1 : 0.5,
                  filter: a.earned ? 'none' : 'grayscale(60%)',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  animationDelay: `${i * 0.07}s`,
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 10, animation: a.earned ? 'float 3s ease-in-out infinite' : 'none', animationDelay: `${i * 0.2}s` }}>{a.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.desc}</div>
                {a.earned && <div style={{ marginTop: 8 }}><span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>Opptjent ✓</span></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
