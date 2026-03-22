import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const AI_SUGGESTIONS = {
  Matematikk: [
    { text: 'Hva er 2x + 6 = 14, løs for x?', correct: 'x = 4' },
    { text: 'Regn ut arealet av en rektangel med lengde 8 og bredde 5.', correct: '40' },
    { text: 'Hva er primtallene mellom 1 og 20?', correct: '2, 3, 5, 7, 11, 13, 17, 19' },
  ],
  Norsk: [
    { text: 'Hva er en metafor? Gi et eksempel.', correct: 'Sammenligning uten "som", f.eks. "Livet er en reise"' },
    { text: 'Hva er forskjellen på substantiv og verb?', correct: 'Substantiv er navneord, verb er handlings- eller tilstandsord' },
  ],
  Naturfag: [
    { text: 'Hva er fotosyntese?', correct: 'Prosessen der planter bruker lys, CO₂ og vann til å lage sukker og oksygen' },
    { text: 'Hva er forskjellen på celle og atom?', correct: 'Cellen er biologiens grunnleggende enhet, atomet er kjemiens' },
  ],
  Programmering: [
    { text: 'Skriv en while-løkke i Python som teller fra 1 til 5.', correct: 'i=1\nwhile i<=5:\n    print(i)\n    i+=1' },
    { text: 'Hva er forskjellen mellom liste og tuple i Python?', correct: 'Liste er muterbar, tuple er immuterbar' },
  ],
};

const SUBJECTS = ['Matematikk', 'Norsk', 'Naturfag', 'Programmering', 'Engelsk', 'Historie'];
const CLASSES  = ['10A', '10B', '9A', '9B', '8A'];
const TYPES    = ['flervalg', 'kort svar', 'matte', 'kode', 'tekstsvar'];

const STEPS = ['Grunninfo', 'Spørsmål', 'Innstillinger', 'Forhåndsvis'];

export default function AssignmentCreator() {
  const { addAssignment } = useApp();
  const { addLog } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    title: '',
    subject: 'Matematikk',
    class: '10A',
    type: 'flervalg',
    due: '',
    difficulty: 3,
    description: '',
    questions: [],
  });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const generateWithAI = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    const pool = AI_SUGGESTIONS[form.subject] || AI_SUGGESTIONS.Matematikk;
    const generated = pool.map((q, i) => ({
      id: `ai-q${i}`,
      type: 'kort svar',
      text: q.text,
      correct: q.correct,
      aiGenerated: true,
    }));
    setForm(f => ({ ...f, questions: generated }));
    setAiLoading(false);
  };

  const addQuestion = () => {
    setForm(f => ({
      ...f,
      questions: [
        ...f.questions,
        { id: `q${Date.now()}`, type: form.type, text: '', options: ['', '', '', ''], correct: 0, aiGenerated: false },
      ],
    }));
  };

  const updateQuestion = (id, key, val) => {
    setForm(f => ({
      ...f,
      questions: f.questions.map(q => q.id === id ? { ...q, [key]: val } : q),
    }));
  };

  const removeQuestion = (id) => {
    setForm(f => ({ ...f, questions: f.questions.filter(q => q.id !== id) }));
  };

  const handlePublish = () => {
    const a = addAssignment({
      ...form,
      icon: form.subject === 'Matematikk' ? '📐'
        : form.subject === 'Norsk' ? '📝'
        : form.subject === 'Programmering' ? '💻'
        : form.subject === 'Naturfag' ? '🔬'
        : '📚',
    });
    addLog(`Publiserte oppgave: "${form.title}" for klasse ${form.class}`);
    setSaved(true);
    setTimeout(() => navigate('/teacher'), 1500);
  };

  if (saved) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '60vh', animation: 'zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Oppgave publisert!</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Sender deg tilbake til lærerpanelet...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>➕ Ny Oppgave</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Lag oppgaver manuelt eller bruk AI-generering</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/teacher')}>← Tilbake</button>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 6, border: '1px solid var(--border-subtle)' }}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            onClick={() => i < step ? setStep(i) : null}
            style={{
              flex: 1, textAlign: 'center', padding: '10px 0',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem', fontWeight: 600,
              cursor: i < step ? 'pointer' : 'default',
              background: i === step ? 'var(--gradient-brand)' : 'transparent',
              color: i === step ? 'white' : i < step ? 'var(--brand-primary)' : 'var(--text-muted)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: i === step ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <span style={{ marginRight: 6 }}>{i < step ? '✓' : i + 1}</span>{s}
          </div>
        ))}
      </div>

      {/* Step 0: Grunninfo */}
      {step === 0 && (
        <div className="card" style={{ animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className="card-header"><h3>📋 Grunnleggende informasjon</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Tittel *</label>
              <input className="form-input" placeholder="f.eks. Brøkregning – Del 2" value={form.title} onChange={e => update('title', e.target.value)} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Fag</label>
                <select className="form-select" value={form.subject} onChange={e => update('subject', e.target.value)}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Klasse</label>
                <select className="form-select" value={form.class} onChange={e => update('class', e.target.value)}>
                  {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Oppgavetype</label>
                <select className="form-select" value={form.type} onChange={e => update('type', e.target.value)}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Frist</label>
                <input className="form-input" type="date" value={form.due} onChange={e => update('due', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Vanskelighetsgrad: {form.difficulty}/5</label>
              <input type="range" min={1} max={5} value={form.difficulty} onChange={e => update('difficulty', +e.target.value)}
                style={{ width: '100%', accentColor: 'var(--brand-primary)', height: 6, marginTop: 6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>Lett</span><span>Middels</span><span>Vanskelig</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Beskrivelse (valgfri)</label>
              <textarea className="form-input" rows={3} placeholder="Kort beskrivelse til elevene..." value={form.description} onChange={e => update('description', e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={() => form.title ? setStep(1) : null} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              Neste: Spørsmål →
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Spørsmål */}
      {step === 1 && (
        <div style={{ animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h3>❓ Spørsmål ({form.questions.length})</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ai btn-sm" onClick={generateWithAI} disabled={aiLoading}>
                  {aiLoading ? (
                    <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }}></span> Genererer...</>
                  ) : '🤖 Generer med AI'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={addQuestion}>+ Legg til</button>
              </div>
            </div>
            {aiLoading && (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'float 1s ease-in-out infinite' }}>🤖</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI analyserer faget og genererer spørsmål...</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>⚠️ Du må godkjenne alle spørsmål før publisering</div>
              </div>
            )}
            {form.questions.length === 0 && !aiLoading && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Ingen spørsmål ennå. Bruk AI eller legg til manuelt.
              </div>
            )}
          </div>

          {form.questions.map((q, i) => (
            <div key={q.id} className="question-card stagger-item" style={{ position: 'relative' }}>
              {q.aiGenerated && (
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <span className="badge badge-purple">🤖 AI-generert</span>
                </div>
              )}
              <div className="question-number">Spørsmål {i + 1}</div>
              <textarea
                className="form-input"
                style={{ marginBottom: 12 }}
                rows={2}
                placeholder="Skriv spørsmålet her..."
                value={q.text}
                onChange={e => updateQuestion(q.id, 'text', e.target.value)}
              />
              {!q.aiGenerated && q.type === 'flervalg' && (
                <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr', marginBottom: 10 }}>
                  {(q.options || ['','','','']).map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="radio" name={`correct-${q.id}`}
                        checked={q.correct === oi}
                        onChange={() => updateQuestion(q.id, 'correct', oi)}
                        style={{ accentColor: 'var(--brand-primary)' }}
                      />
                      <input
                        className="form-input"
                        style={{ padding: '7px 10px' }}
                        placeholder={`Alternativ ${oi + 1}`}
                        value={opt}
                        onChange={e => {
                          const opts = [...(q.options || ['','','',''])];
                          opts[oi] = e.target.value;
                          updateQuestion(q.id, 'options', opts);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {q.correct !== undefined && (
                <div style={{ fontSize: '0.78rem', color: 'var(--brand-success)', marginBottom: 10 }}>
                  ✅ Fasit: {q.correct}
                </div>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(q.id)}>Fjern</button>
            </div>
          ))}

          {form.questions.length > 0 && (
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => setStep(2)}>
              Neste: Innstillinger →
            </button>
          )}
        </div>
      )}

      {/* Step 2: Innstillinger */}
      {step === 2 && (
        <div className="card" style={{ animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className="card-header"><h3>⚙️ Innstillinger</h3></div>
          <div className="card-body">
            {[
              { label: 'Vis fasit etter innlevering', key: 'showAnswer', default: true },
              { label: 'Tillat AI-hjelp (elev-AI)', key: 'allowAI', default: true },
              { label: 'Tilfeldig rekkefølge på spørsmål', key: 'shuffle', default: false },
              { label: 'Tidsbegrensning', key: 'timeLimit', default: false },
            ].map((opt) => (
              <div key={opt.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{opt.label}</span>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={opt.default} style={{ accentColor: 'var(--brand-primary)', width: 18, height: 18 }} />
                </label>
              </div>
            ))}
            <div style={{ padding: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', marginTop: 20 }}>
              <div style={{ color: 'var(--brand-warning)', fontWeight: 600, marginBottom: 4 }}>⚠️ GDPR-merknad</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Elevbesvarelsene lagres sikkert og er kun tilgjengelig for deg og skolens administrator. Alle AI-genererte spørsmål er merket og loggført.</div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }} onClick={() => setStep(3)}>
              Forhåndsvis →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <div style={{ animation: 'zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h3>🔍 Forhåndsvisning</h3>
              <span className="badge badge-yellow">⚠️ Venter på godkjenning</span>
            </div>
            <div className="card-body">
              <div className="grid-2" style={{ marginBottom: 20 }}>
                {[['Tittel', form.title], ['Fag', form.subject], ['Klasse', form.class], ['Frist', form.due || '–'], ['Type', form.type], ['Vanskelighet', `${form.difficulty}/5`]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                    <div style={{ fontWeight: 600, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>{form.questions.length} spørsmål</div>
              {form.questions.map((q, i) => (
                <div key={q.id} style={{ padding: '10px 14px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', marginBottom: 8, fontSize: '0.875rem' }}>
                  <strong style={{ color: 'var(--brand-primary)' }}>{i+1}.</strong> {q.text}
                  {q.aiGenerated && <span className="badge badge-purple" style={{ marginLeft: 8 }}>🤖 AI</span>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Tilbake</button>
            <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePublish}>
              ✅ Godkjenn og Publiser
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
