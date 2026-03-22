import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    key: 'teacher',
    icon: '👩‍🏫',
    name: 'Lærer',
    desc: 'Oppgaver, AI-assistent, analyse',
    color: 'var(--brand-primary)',
    user: 'Kari Nordmann',
  },
  {
    key: 'student',
    icon: '🎓',
    name: 'Elev',
    desc: 'Løs oppgaver, lær med AI',
    color: 'var(--brand-success)',
    user: 'Ole Hansen',
  },
  {
    key: 'admin',
    icon: '🏛️',
    name: 'Administrator',
    desc: 'Skoler, brukere, systemlogg',
    color: 'var(--brand-warning)',
    user: 'Admin Bruker',
  },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!selected) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    login(selected);
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🇳🇴</div>
          <div className="login-logo-text">
            <h1>Utdanningsplattform</h1>
            <p>Nasjonalt digitalt skolesystem</p>
          </div>
        </div>

        {/* Welcome */}
        <div className="login-welcome">
          <h2 className="gradient-text-animated">Velkommen tilbake</h2>
          <p>Velg din rolle for å logge inn i demomodus</p>
        </div>

        {/* Role selection */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Logg inn som
          </div>
          <div className="role-cards">
            {ROLES.map((r) => (
              <div
                key={r.key}
                className={`role-card${selected === r.key ? ' selected' : ''}`}
                onClick={() => setSelected(r.key)}
                style={selected === r.key ? { borderColor: r.color } : {}}
              >
                <div className="role-card-icon">{r.icon}</div>
                <div className="role-card-name">{r.name}</div>
                <div className="role-card-desc">{r.desc}</div>
                {selected === r.key && (
                  <div style={{ fontSize: '0.7rem', color: r.color, marginTop: 6, fontWeight: 600 }}>
                    ✓ {r.user}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form fields (visual only) */}
        <div className="form-group">
          <label className="form-label">E-post</label>
          <input
            className="form-input"
            type="email"
            placeholder={
              selected
                ? ROLES.find(r => r.key === selected)?.user.toLowerCase().replace(' ', '.') + '@skole.no'
                : 'din@epost.no'
            }
            readOnly
          />
        </div>
        <div className="form-group" style={{ marginBottom: 28 }}>
          <label className="form-label">Passord</label>
          <input className="form-input" type="password" placeholder="••••••••" readOnly value={selected ? '••••••••' : ''} />
        </div>

        <button
          className="btn btn-primary w-full btn-lg"
          onClick={handleLogin}
          disabled={!selected || loading}
          style={{ justifyContent: 'center', width: '100%' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }}></span>
              Logger inn...
            </span>
          ) : selected ? `Logg inn som ${ROLES.find(r => r.key === selected)?.name}` : 'Velg en rolle ovenfor'}
        </button>

        <div className="login-divider">Sikret med GDPR-samsvar · EU-data</div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          {['🔒 GDPR', '🇪🇺 EU-sky', '🔐 Kryptert'].map(tag => (
            <span key={tag} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
