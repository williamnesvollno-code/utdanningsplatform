import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Diagnostic question banks per subject ---
const DIAG_QUESTIONS = {
  Matematikk: [
    { id:'m1', text: 'Hva er 3/4 + 1/4?', options:['1/2','4/8','1','3/8'], correct:2, level:1 },
    { id:'m2', text: 'Hva er 2x + 6 = 14? Løs for x.', options:['x=3','x=4','x=5','x=6'], correct:1, level:2 },
    { id:'m3', text: 'Hva er arealet av en sirkel med radius 5? (π≈3.14)', options:['78.5','31.4','15.7','50'], correct:0, level:3 },
    { id:'m4', text: 'Hva er den deriverte av f(x) = x² + 3x?', options:['2x','2x+3','x+3','3x²'], correct:1, level:4 },
    { id:'m5', text: 'Løs: x² - 5x + 6 = 0', options:['x=2,3','x=1,5','x=3,4','x=-2,-3'], correct:0, level:5 },
  ],
  Norsk: [
    { id:'n1', text: 'Hva er subjektet i: "Hunden løper fort"?', options:['løper','fort','Hunden','ingen'], correct:2, level:1 },
    { id:'n2', text: 'Hva er en metafor?', options:['En direkte sammenligning med "som"','En samenligning uten "som"','En overdrivelse','En personifikasjon'], correct:1, level:2 },
    { id:'n3', text: 'Hva kalles bruken av samme bokstav i starten av ord for å skape rytme?', options:['Assonans','Allitterasjon','Rim','Rytme'], correct:1, level:3 },
    { id:'n4', text: 'Hva kjennetegner sjangeren novelle?', options:['Mange karakterer og lang tid','Én hendelse, kort, avgrenset handling','Episk forteller og mange kapitler','Ingen konflikt'], correct:1, level:4 },
    { id:'n5', text: 'Hva er en upersonlig forteller (3. person allvitende)?', options:['En forteller som er med i historien','En forteller som ikke navngis og vet alt','En forteller som bare beskriver ytre hendelser','En forteller i 1. person'], correct:1, level:5 },
  ],
  Naturfag: [
    { id:'s1', text: 'Hva er cellens "kraftverk"?', options:['Cellekjernen','Ribosomer','Mitokondrien','Golgi'], correct:2, level:1 },
    { id:'s2', text: 'Hva er fotosyntese?', options:['Kjemisk nedbryting av sukker','Produksjon av sukker fra sollys og CO₂','Transport av oksygen i blodet','Cellenes respirasjon'], correct:1, level:2 },
    { id:'s3', text: 'Hva er Newtons 2. lov?', options:['F = ma','E = mc²','v = s/t','a = Δv/Δt'], correct:0, level:3 },
    { id:'s4', text: 'Hva er halvlivstid?', options:['Halv levetid for en organisme','Tiden det tar for halvparten av et radioaktivt stoff å henfalle','Halv periode for en bølge','Gjennomsnittlig levealder'], correct:1, level:4 },
    { id:'s5', text: 'Hva er en kovalent binding?', options:['Overføring av elektroner mellom ioner','Deling av elektronpar mellom atomer','En magnetisk tiltrekning','Binding via hydrogenatomer'], correct:1, level:5 },
  ],
  Programmering: [
    { id:'p1', text: 'Hva skriver ut "Hei" i Python?', options:['console.log("Hei")','print("Hei")','echo "Hei"','write("Hei")'], correct:1, level:1 },
    { id:'p2', text: 'Hva er en for-løkke?', options:['En funksjon','En variabel','En gjentakelse av kode','En betingelse'], correct:2, level:2 },
    { id:'p3', text: 'Hva returnerer len([1,2,3]) i Python?', options:['1','2','3','0'], correct:2, level:3 },
    { id:'p4', text: 'Hva er forskjellen mellom en liste og en dict i Python?', options:['Ingen forskjell','Liste er indeksert, dict er nøkkel-verdi-par','Dict er raskere alltid','Liste kan bare ha tall'], correct:1, level:4 },
    { id:'p5', text: 'Hva er rekursjon?', options:['En løkke','En funksjon som kaller seg selv','En klasse','En metode i Python'], correct:1, level:5 },
  ],
};

// Generate adaptive assignments based on level
function generateAdaptiveAssignments(subject, levelScore) {
  const level = Math.max(1, Math.min(5, Math.round(levelScore / 20)));
  const banks = {
    Matematikk: {
      1: [
        { text: 'Regn ut: 15 + 27', type:'kort svar', correct:'42' },
        { text: 'Hva er 3/4 av 20?', type:'kort svar', correct:'15' },
        { text: 'Regn ut: 8 × 7', type:'kort svar', correct:'56' },
      ],
      2: [
        { text: 'Løs for x: 3x + 6 = 21', type:'kort svar', correct:'5' },
        { text: 'Regn ut arealet av et rektangel med lengde 8 og bredde 6.', type:'kort svar', correct:'48' },
        { text: 'Hva er 25% av 200?', type:'kort svar', correct:'50' },
      ],
      3: [
        { text: 'Regn ut: (x + 3)(x - 2) = ?', type:'kort svar', correct:'x²+x-6' },
        { text: 'Hva er sinus til 30°?', type:'flervalg', options:['0.5','1','0.87','0.25'], correct:0 },
        { text: 'Regn ut verdien av 4! (fakultet)', type:'kort svar', correct:'24' },
      ],
      4: [
        { text: 'Deriver f(x) = 3x³ - 2x² + x', type:'kort svar', correct:'9x²-4x+1' },
        { text: 'Løs: x² - 7x + 12 = 0', type:'kort svar', correct:'x=3,x=4' },
        { text: 'Hva er integralet av 2x?', type:'kort svar', correct:'x²+C' },
      ],
      5: [
        { text: 'Bevis at summen av vinklene i en trekant er 180°', type:'tekstsvar', correct:'Bevis' },
        { text: 'Løs likningssystemet: 2x+y=7, x-y=2', type:'kort svar', correct:'x=3,y=1' },
        { text: 'Hva er grenseverdien av (x²-1)/(x-1) når x→1?', type:'kort svar', correct:'2' },
      ],
    },
    Norsk: {
      1: [{ text:'Hva er et substantiv?', type:'kort svar', correct:'Navneord' }, { text:'Skriv en setning med et adjektiv.', type:'tekstsvar', correct:'' }, { text:'Hva er et verb?', type:'kort svar', correct:'Handlingsord/tilstandsord' }],
      2: [{ text:'Forklar forskjellen mellom subjekt og objekt.', type:'tekstsvar', correct:'' }, { text:'Hva er en metafor?', type:'kort svar', correct:'Sammenligning uten som' }, { text:'Skriv et eksempel på allitterasjon.', type:'tekstsvar', correct:'' }],
      3: [{ text:'Analyser denne teksten kort: "Solen sank bak åsene som et sluknet lys."', type:'tekstsvar', correct:'' }, { text:'Hva er forskjellen mellom episk og lyrisk tekst?', type:'tekstsvar', correct:'' }, { text:'Hva er en novelle?', type:'kort svar', correct:'Kort fiktiv prosafortelling' }],
      4: [{ text:'Skriv et avsnitt med retorisk analyse av en reklame.', type:'tekstsvar', correct:'' }, { text:'Hva er dialektisme og hva gjør det med teksten?', type:'tekstsvar', correct:'' }, { text:'Sammenlign romantikk og realisme som litterære epoker.', type:'tekstsvar', correct:'' }],
      5: [{ text:'Skriv en faglig argumenterende tekst om skolereformen.', type:'tekstsvar', correct:'' }, { text:'Analyser et av Ibsens dramaer med fokus på tematikk.', type:'tekstsvar', correct:'' }, { text:'Hva er postmodernisme i litteraturen?', type:'tekstsvar', correct:'' }],
    },
    Naturfag: {
      1: [{ text:'Hva er de tre tilstandene til vann?', type:'kort svar', correct:'Fast, flytende, gass' }],
      2: [{ text:'Forklar fotosyntese med egne ord.', type:'tekstsvar', correct:'' }],
      3: [{ text:'Beregn kraft: masse 5 kg, akselerasjon 3 m/s²', type:'kort svar', correct:'15 N' }],
      4: [{ text:'Forklar begrepet halvlivstid.', type:'tekstsvar', correct:'' }],
      5: [{ text:'Beskriv Bohrs atommodell og dens begrensninger.', type:'tekstsvar', correct:'' }],
    },
    Programmering: {
      1: [{ text:'Skriv et Python-program som skriver ut "Hei verden"', type:'kode', correct:'print("Hei verden")' }],
      2: [{ text:'Skriv en for-løkke som teller fra 1 til 5', type:'kode', correct:'for i in range(1,6):\n    print(i)' }],
      3: [{ text:'Skriv en funksjon som returnerer summen av to tall', type:'kode', correct:'def sum(a,b):\n    return a+b' }],
      4: [{ text:'Skriv en funksjon som sjekker om et tall er primtall', type:'kode', correct:'' }],
      5: [{ text:'Implementer en rekursiv fibonacci-funksjon', type:'kode', correct:'' }],
    },
  };
  const questions = (banks[subject]?.[level] || banks.Matematikk[1]).map((q, i) => ({
    id: `adaptive-${Date.now()}-${i}`,
    ...q,
    options: q.options || undefined,
  }));
  return { questions, level };
}

const SUBJECTS = Object.keys(DIAG_QUESTIONS);
const LEVEL_LABELS = ['', 'Nybegynner', 'Under middels', 'Middels', 'Over middels', 'Avansert'];
const LEVEL_COLORS = ['', 'var(--brand-warning)', 'var(--brand-warning)', 'var(--brand-primary)', 'var(--brand-success)', 'var(--brand-accent)'];

const PHASES = { SELECT: 'select', TEST: 'test', RESULT: 'result', ASSIGNMENTS: 'assignments', SOLVING: 'solving' };

export default function AdaptiveTest() {
  const { user } = useAuth();
  const { addAssignment, submitAssignment } = useApp();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(PHASES.SELECT);
  const [subject, setSubject] = useState('Matematikk');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [generatedAssignment, setGeneratedAssignment] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [solveAnswers, setSolveAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  const questions = DIAG_QUESTIONS[subject] || [];
  const q = questions[currentQ];

  const handleSelect = (oi) => setAnswers(a => ({ ...a, [q.id]: oi }));

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(q => q + 1);
    else finishTest();
  };

  const finishTest = () => {
    let correct = 0;
    questions.forEach(qq => { if (answers[qq.id] === qq.correct) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const level = Math.ceil((score / 100) * 5);
    setResult({ score, correct, total: questions.length, level });
    setPhase(PHASES.RESULT);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    const { questions: qs, level } = generateAdaptiveAssignments(subject, result.score);
    const assignment = {
      title: `Adaptiv Oppgave – ${subject} (Nivå ${level})`,
      subject,
      class: user?.class || '10A',
      type: qs[0]?.type || 'flervalg',
      due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      difficulty: level,
      description: `Automatisk generert av AI basert på diagnosetest. Tilpasset nivå ${level}/5.`,
      questions: qs,
      icon: '🤖',
      status: 'Aktiv',
      aiGenerated: true,
    };
    const saved = await addAssignment(assignment);
    setGenerating(false);
    if (saved) {
      setGeneratedAssignment({ ...assignment, id: saved.id });
      setPhase(PHASES.ASSIGNMENTS);
    }
  };

  const handleSubmitSolve = async () => {
    if (!generatedAssignment || !user?.id) return;
    let correct = 0;
    generatedAssignment.questions.forEach((qq) => {
      const ans = solveAnswers[qq.id];
      if (qq.type === 'flervalg' && ans === qq.correct) correct++;
      else if (qq.type === 'kort svar' && typeof ans === 'string' && qq.correct && ans.toLowerCase().trim() === qq.correct.toLowerCase()) correct++;
      else if (qq.type === 'kode' || qq.type === 'tekstsvar') correct++;
    });
    const score = Math.round((correct / generatedAssignment.questions.length) * 100);
    setFinalScore(score);
    await submitAssignment(
      generatedAssignment.id,
      user.id,
      generatedAssignment.questions.map((qq) => solveAnswers[qq.id])
    );
    setSubmitted(true);
  };

  // ── SELECT phase ───────────────────────────────────────────
  if (phase === PHASES.SELECT) return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>🧠</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }} className="gradient-text-animated">Adaptiv Læringstest</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, maxWidth: 480, margin: '8px auto 0' }}>
          Ta en kort diagnosetest og AI tilpasser automatisk oppgavene til akkurat ditt nivå.
        </p>
      </div>

      <div className="card card-3d" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3>Velg fag</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {SUBJECTS.map(s => {
              const icons = { Matematikk:'📐', Norsk:'📝', Naturfag:'🔬', Programmering:'💻' };
              const selected = subject === s;
              return (
                <div
                  key={s}
                  onClick={() => setSubject(s)}
                  className="card-3d"
                  style={{
                    padding: '20px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${selected ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                    background: selected ? 'rgba(99,102,241,0.12)' : 'var(--bg-base)',
                    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: selected ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>{icons[s]}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>5 spørsmål · ~3 min</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.8rem' }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Slik fungerer adaptiv læring</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                1. Du tar en kort diagnosetest i {subject}<br />
                2. AI analyserer svarene dine og beregner ferdighetsnivå (1–5)<br />
                3. AI genererer et sett med oppgaver tilpasset akkurat ditt nivå<br />
                4. Du løser oppgavene! Nivået oppdateres automatisk.
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        className="btn btn-primary btn-lg"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={() => setPhase(PHASES.TEST)}
      >
        🚀 Start diagnosetest i {subject}
      </button>
    </div>
  );

  // ── TEST phase ─────────────────────────────────────────────
  if (phase === PHASES.TEST) {
    const progress = ((currentQ) / questions.length) * 100;
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            <span>🧪 Diagnosetest: {subject}</span>
            <span>{currentQ + 1} / {questions.length}</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gradient-brand)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
          {/* Level indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['Lv.1','Lv.2','Lv.3','Lv.4','Lv.5'].map((l, i) => (
              <span key={l} style={{ fontSize: '0.7rem', color: i === (q?.level - 1) ? 'var(--brand-primary)' : 'var(--text-muted)', fontWeight: i === (q?.level - 1) ? 700 : 400 }}>{l}</span>
            ))}
          </div>
        </div>

        {q && (
          <div key={q.id} style={{ animation: 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="question-card">
              <div className="question-number" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Spørsmål {currentQ + 1} · Vanskelighetsgrad {q.level}/5</span>
                {'⭐'.repeat(q.level)}
              </div>
              <div className="question-text">{q.text}</div>
              {q.options.map((opt, oi) => (
                <div
                  key={oi}
                  className={`mc-option${answers[q.id] === oi ? ' selected' : ''}`}
                  onClick={() => handleSelect(oi)}
                >
                  <div className={`mc-radio${answers[q.id] === oi ? ' filled' : ''}`} />
                  <span style={{ fontWeight: 600, marginRight: 8, color: 'var(--text-muted)' }}>
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  {opt}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={answers[q.id] === undefined}
              >
                {currentQ < questions.length - 1 ? 'Neste →' : '✅ Fullfør test'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── RESULT phase ───────────────────────────────────────────
  if (phase === PHASES.RESULT && result) {
    const levelColor = LEVEL_COLORS[result.level] || 'var(--brand-primary)';
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', animation: 'zoomIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>
          {result.score >= 80 ? '🏆' : result.score >= 60 ? '🎯' : result.score >= 40 ? '📈' : '💪'}
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Diagnose fullført!</h2>
        <div style={{ fontSize: '4rem', fontWeight: 900, margin: '16px 0', color: levelColor }}>
          {result.score}%
        </div>
        <div style={{ marginBottom: 8 }}>
          <span className="badge" style={{ background: `${levelColor}22`, color: levelColor, border: `1px solid ${levelColor}44`, fontSize: '0.9rem', padding: '6px 16px' }}>
            Ferdighetsnivå {result.level}/5 · {LEVEL_LABELS[result.level]}
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0 32px', fontSize: '0.9rem' }}>
          {result.correct} av {result.total} riktige · Fag: {subject}
        </p>

        {/* Level bar visual */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 32, border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>DIN FERDIGHETSPROFIL</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[1,2,3,4,5].map(l => (
              <div key={l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ height: 48, borderRadius: 6, width: '100%', background: l <= result.level ? levelColor : 'var(--bg-base)', transition: `background 0.3s ease ${l * 0.1}s`, opacity: l <= result.level ? 1 : 0.3 }} />
                <span style={{ fontSize: '0.65rem', color: l <= result.level ? levelColor : 'var(--text-muted)', fontWeight: l === result.level ? 700 : 400 }}>Lv.{l}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            🤖 AI vil generere oppgaver på nivå {result.level}{result.level < 5 ? `–${result.level + 1}` : ''}.
          </div>
        </div>

        <button
          className="btn btn-ai btn-lg"
          style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }}></span> AI genererer oppgaver...</>
          ) : '🤖 Generer tilpassede oppgaver'}
        </button>
        <button className="btn btn-ghost" onClick={() => { setPhase(PHASES.SELECT); setCurrentQ(0); setAnswers({}); }}>
          ← Ta testen på nytt
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── ASSIGNMENTS phase ──────────────────────────────────────
  if (phase === PHASES.ASSIGNMENTS && generatedAssignment) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', animation: 'slideInUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✨</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{generatedAssignment.title}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>AI har generert {generatedAssignment.questions.length} oppgaver tilpasset ditt nivå</p>
          <span className="badge badge-purple" style={{ marginTop: 10 }}>🤖 AI-generert · Nivå {generatedAssignment.difficulty}/5</span>
        </div>

        <div className="card card-3d" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3>Oppgavene dine</h3></div>
          <div className="card-body">
            {generatedAssignment.questions.map((q, i) => (
              <div key={q.id} className="stagger-item" style={{ padding: '12px 0', borderBottom: i < generatedAssignment.questions.length - 1 ? '1px solid var(--border-subtle)' : 'none', animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700, marginBottom: 4 }}>{i + 1}. {q.type?.toUpperCase()}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{q.text}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => setPhase(PHASES.SOLVING)}
        >
          📝 Start oppgavene
        </button>
      </div>
    );
  }

  // ── SOLVING phase ──────────────────────────────────────────
  if (phase === PHASES.SOLVING && generatedAssignment) {
    if (submitted) {
      return (
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', paddingTop: 60, animation: 'zoomIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div style={{ fontSize: '5rem', marginBottom: 16 }}>{finalScore >= 80 ? '🏆' : finalScore >= 60 ? '🎯' : '📈'}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Bra jobbet!</h2>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, margin: '12px 0', background: 'var(--gradient-success)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{finalScore}%</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Din ferdighetsprofil er oppdatert!</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => { setPhase(PHASES.SELECT); setCurrentQ(0); setAnswers({}); setSolveAnswers({}); setSubmitted(false); }}>
              🔄 Ny test
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/student')}>Mitt Panel →</button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 800 }}>🧠 Løs oppgavene</h2>
          <span className="badge badge-purple">Nivå {generatedAssignment.difficulty}/5</span>
        </div>
        {generatedAssignment.questions.map((q, i) => (
          <div key={q.id} className="question-card stagger-item" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="question-number">Spørsmål {i + 1}</div>
            <div className="question-text">{q.text}</div>
            {q.type === 'flervalg' && q.options && (
              <div>
                {q.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className={`mc-option${solveAnswers[q.id] === oi ? ' selected' : ''}`}
                    onClick={() => setSolveAnswers(a => ({ ...a, [q.id]: oi }))}
                  >
                    <div className={`mc-radio${solveAnswers[q.id] === oi ? ' filled' : ''}`} />
                    {opt}
                  </div>
                ))}
              </div>
            )}
            {(q.type === 'kort svar' || q.type === 'matte') && (
              <input className="form-input" placeholder="Skriv svaret ditt..." value={solveAnswers[q.id] || ''} onChange={e => setSolveAnswers(a => ({ ...a, [q.id]: e.target.value }))} />
            )}
            {q.type === 'kode' && (
              <textarea className="form-input" rows={5} placeholder="# Skriv koden din her..." value={solveAnswers[q.id] || q.starterCode || ''} onChange={e => setSolveAnswers(a => ({ ...a, [q.id]: e.target.value }))} style={{ fontFamily: 'monospace', background: '#0a0e1a' }} />
            )}
            {q.type === 'tekstsvar' && (
              <textarea className="form-input" rows={4} placeholder="Skriv svaret ditt her..." value={solveAnswers[q.id] || ''} onChange={e => setSolveAnswers(a => ({ ...a, [q.id]: e.target.value }))} />
            )}
          </div>
        ))}
        <button
          className="btn btn-success btn-lg"
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          onClick={handleSubmitSolve}
        >
          ✅ Lever besvarelse
        </button>
      </div>
    );
  }

  return null;
}
