import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function AssignmentSolver() {
  const { id } = useParams();
  const { assignments, submitAssignment, getSkillProfile } = useApp();
  const { user, addLog } = useAuth();
  const navigate = useNavigate();

  const assignment = assignments.find(a => a.id === id) || assignments[0];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);

  if (!assignment) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Oppgave ikke funnet.</div>;
  }

  const questions = assignment.questions || [];
  const progress = questions.length ? ((Object.keys(answers).length / questions.length) * 100) : 0;

  const setAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));

  const handleSubmit = async () => {
    if (!user?.id) return;
    const answersArray = questions.map((q) => answers[q.id] ?? null);
    const res = await submitAssignment(assignment.id, user.id, answersArray);
    if (!res) return;
    setResult(res);
    setSubmitted(true);
    addLog(`Elev ${user?.name} leverte "${assignment.title}" – skår: ${res?.score}%`);
  };

  if (submitted && result) {
    const emoji = result.score >= 90 ? '🏆' : result.score >= 70 ? '🎯' : result.score >= 50 ? '📈' : '💪';
    const msg = result.score >= 90 ? 'Fantastisk! Du mestrer dette!' : result.score >= 70 ? 'Bra jobbet!' : result.score >= 50 ? 'Bra innsats!' : 'Fortsett å øve!';
    return (
      <div style={{
        maxWidth: 520, margin: '0 auto', textAlign: 'center', paddingTop: 60,
        animation: 'zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{ fontSize: '5rem', marginBottom: 20 }}>{emoji}</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>{msg}</h2>
        <div style={{
          fontSize: '3.5rem', fontWeight: 900, marginBottom: 16,
          background: result.score >= 70 ? 'var(--gradient-success)' : 'var(--gradient-brand)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{result.score}%</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.95rem' }}>
          {assignment.title} · {questions.length} spørsmål
        </p>

        {/* Answer review */}
        <div style={{ textAlign: 'left', marginBottom: 32 }}>
          {questions.map((q, i) => {
            const given = answers[q.id];
            let correct = false;
            if (q.type === 'flervalg') correct = given === q.correct;
            else if (q.type === 'kode') correct = true;
            else if (typeof given === 'string' && q.correct) {
              correct = given.toLowerCase().trim() === q.correct.toLowerCase();
            }
            return (
              <div key={q.id} style={{
                background: 'var(--bg-card)', border: `1px solid ${correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 10,
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: correct ? 'var(--brand-success)' : 'var(--brand-danger)', marginBottom: 4 }}>
                  {correct ? '✅ Riktig' : '❌ Feil'}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{q.text}</div>
                {q.correct !== undefined && !correct && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--brand-success)', marginTop: 4 }}>Fasit: {q.correct}</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0); }}>
            🔄 Prøv igjen
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/student')}>
            ← Mitt Panel
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header-actions" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {assignment.subject} · Klasse {assignment.class}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{assignment.icon} {assignment.title}</h1>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Tilbake</button>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span>Spørsmål {currentQ + 1} av {questions.length}</span>
          <span>{Math.round(progress)}% fullført</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: 'var(--gradient-brand)', borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </div>
      </div>

      {/* Navigation pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: '2px solid',
              borderColor: i === currentQ ? 'var(--brand-primary)' : answers[questions[i]?.id] !== undefined ? 'var(--brand-success)' : 'var(--border-medium)',
              background: i === currentQ ? 'rgba(99,102,241,0.15)' : answers[questions[i]?.id] !== undefined ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: i === currentQ ? 'var(--brand-primary)' : answers[questions[i]?.id] !== undefined ? 'var(--brand-success)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: i === currentQ ? 'scale(1.1)' : 'scale(1)',
            }}
          >{i + 1}</button>
        ))}
      </div>

      {/* Question */}
      {q && (
        <div key={q.id} style={{ animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className="question-card">
            <div className="question-number">Spørsmål {currentQ + 1} · {q.type}</div>
            <div className="question-text">{q.text}</div>

            {q.type === 'flervalg' && (
              <div>
                {(q.options || []).map((opt, oi) => (
                  <div
                    key={oi}
                    className={`mc-option${answers[q.id] === oi ? ' selected' : ''}`}
                    onClick={() => setAnswer(q.id, oi)}
                  >
                    <div className={`mc-radio${answers[q.id] === oi ? ' filled' : ''}`} />
                    {opt}
                  </div>
                ))}
              </div>
            )}

            {(q.type === 'kort svar' || q.type === 'matte') && (
              <input
                className="form-input"
                placeholder="Skriv svaret ditt her..."
                value={answers[q.id] || ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                onKeyDown={e => e.key === 'Enter' && currentQ < questions.length - 1 && setCurrentQ(q => q + 1)}
              />
            )}

            {q.type === 'kode' && (
              <div>
                <textarea
                  className="form-input"
                  rows={6}
                  placeholder={q.starterCode || '# Skriv Python-kode her...'}
                  value={answers[q.id] || q.starterCode || ''}
                  onChange={e => setAnswer(q.id, e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem', background: '#0a0e1a' }}
                />
              </div>
            )}

            {q.type === 'tekstsvar' && (
              <textarea
                className="form-input"
                rows={5}
                placeholder="Skriv svaret ditt her (min. 2 setninger)..."
                value={answers[q.id] || ''}
                onChange={e => setAnswer(q.id, e.target.value)}
              />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}>
              ← Forrige
            </button>
            {currentQ < questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setCurrentQ(q => q + 1)}>
                Neste →
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length === 0}
              >
                ✅ Lever Besvarelse
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
