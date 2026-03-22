import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TEACHER_SUGGESTIONS = [
  'Lag en flervalgsoppgave om brøkregning for 10. trinn',
  'Foreslå en undervisningsplan for algebra',
  'Hvilke elever trenger ekstra hjelp i matematikk?',
  'Generer 5 spørsmål om Norges historie',
];

const STUDENT_SUGGESTIONS = [
  'Forklar meg hva brøker er',
  'Gi meg et hint til oppgave 3',
  'Hvordan fungerer for-løkker i Python?',
  'Hva er forskjellen på subjekt og predikat?',
];

const AI_RESPONSES_TEACHER = {
  default: (msg) => [
    `Jeg har analysert forespørselen din om "${msg.substring(0, 30)}...".`,
    `Her er et forslag:\n\n**Oppgave: Brøkregning**\n1. Hva er 1/2 + 1/4? *(Flervalg)*\n2. Forenkle 4/8. *(Kort svar)*\n3. Regn ut 3/4 × 8. *(Matte)*\n\n⚠️ *Du må godkjenne disse spørsmålene før de publiseres.*`,
  ],
  'generer': [
    'Genererer oppgaver basert på dine klasser...',
    `**Forslag til oppgavesett (venter på din godkjenning):**\n\n📚 Tema: Algebra\n- Løs for x: 2x + 4 = 12\n- Hva er x² når x = 3?\n- Forenkle: 3x + 2x - x\n\n✅ Klikk "Godkjenn og publiser" i Ny Oppgave-skjermen.`,
  ],
  'analyse': [
    'Analyserer klasse 10A...',
    `**Klasseanalyse 10A:**\n\n🎯 Snittskår: 71%\n⚠️ Svake tema: Brøkregning (55%), Algebra (62%)\n💪 Sterke tema: Geometri (89%)\n\n**Anbefaling:** Fokuser på brøkregning neste uke. Jeg kan generere tilpassede oppgaver for de 3 elevene med lavest skår.`,
  ],
};

const AI_RESPONSES_STUDENT = {
  default: (msg) => [
    `Det er et godt spørsmål! La meg hjelpe deg med "${msg.substring(0, 25)}...".`,
    `**Forklaring:**\n\nTenk på det på denne måten – start med det grunnleggende og bygg videre.\n\n💡 *Tips:* Prøv å løse et enklere eksempel først, og se om du kan finne mønsteret.\n\nHar du prøvd å løse det selv ennå? Jeg kan gi deg et hint!`,
  ],
  'brøk': [
    'La meg forklare brøker på en enkel måte!',
    `**Hva er en brøk?**\n\nEn brøk viser en del av en helhet.\n\n🍕 Tenk på en pizza delt i 4 stykker:\n- 1/4 = ett stykke av fire\n- 2/4 = to stykker (= 1/2!)\n\n**Huskeregel:** Teller på toppen, nevner på bunnen.\n\nVil du prøve et eksempel? 🎯`,
  ],
  'hint': [
    'Her er et hint!',
    `**Hint 💡**\n\nSe på hva du vet, og hva du skal finne.\n\nSteg 1: Skriv ned det kjente\nSteg 2: Se etter et mønster\nSteg 3: Prøv, sjekk svaret\n\nHusk: Det er greit å gjøre feil – det er slik vi lærer! 🚀`,
  ],
};

function getAIResponse(msg, role) {
  const lower = msg.toLowerCase();
  const responses = role === 'teacher' ? AI_RESPONSES_TEACHER : AI_RESPONSES_STUDENT;

  for (const [key, val] of Object.entries(responses)) {
    if (key !== 'default' && lower.includes(key)) {
      return typeof val === 'function' ? val(msg) : val;
    }
  }
  return responses.default(msg);
}

export default function AIChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'ai',
      text: user?.role === 'teacher'
        ? '👋 Hei! Jeg er din AI-assistent for lærere. Jeg kan hjelpe deg med å generere oppgaver, analysere klasser, og foreslå undervisningsplaner. Husk: alle AI-forslag må godkjennes av deg før publisering!'
        : '👋 Hei! Jeg er din AI-hjelper. Jeg kan forklare fagstoff, gi deg hint, og guide deg steg for steg. Hva lurer du på?',
      time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const msgsRef = useRef(null);

  const suggestions = user?.role === 'teacher' ? TEACHER_SUGGESTIONS : STUDENT_SUGGESTIONS;

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { from: 'user', text, time }]);
    setInput('');
    setTyping(true);

    const responses = getAIResponse(text, user?.role);

    for (let i = 0; i < responses.length; i++) {
      await new Promise(r => setTimeout(r, 800 + i * 600));
      if (i === 0) setTyping(false);
      if (i < responses.length - 1) {
        setMessages(prev => [...prev, { from: 'ai', text: responses[i], time }]);
        setTyping(true);
        await new Promise(r => setTimeout(r, 400));
      } else {
        setTyping(false);
        setMessages(prev => [...prev, { from: 'ai', text: responses[i], time }]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const renderText = (text) => {
    // Simple markdown-ish rendering
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} style={{ margin: '2px 0' }} dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  };

  if (!user) return null;
  // Students don't get the floating AI — they use the AdaptiveTest screen instead
  if (user.role === 'student') return null;


  return (
    <>
      {open && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-chat-avatar">🤖</div>
            <div>
              <div className="ai-chat-title">
                {user.role === 'teacher' ? 'Lærer-AI Assistent' : 'Elev-AI Assistent'}
              </div>
              <div className="ai-chat-subtitle">
                {user.role === 'teacher'
                  ? 'Genererer oppgaver · Analyserer klasser'
                  : 'Forklaringer · Hint · Veiledning'}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', width: 28, height: 28, cursor: 'pointer' }}
            >✕</button>
          </div>

          {messages.length === 1 && (
            <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: 'var(--bg-card-hover)', border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-full)', padding: '5px 12px', color: 'var(--text-secondary)',
                    fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="ai-chat-msgs" ref={msgsRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from}`}>
                <div className="chat-bubble">{renderText(msg.text)}</div>
                <div className="chat-time">{msg.time}</div>
              </div>
            ))}
            {typing && (
              <div className="chat-msg ai">
                <div className="ai-typing">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </div>

          <div className="ai-chat-input-area">
            <textarea
              className="ai-chat-input"
              placeholder={user.role === 'teacher' ? 'Spør om oppgaver, analyse...' : 'Spør om hjelp...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="btn btn-primary btn-icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <button className="ai-chat-toggle" onClick={() => setOpen(o => !o)} title="AI Assistent">
        {open ? '✕' : '🤖'}
      </button>
    </>
  );
}
