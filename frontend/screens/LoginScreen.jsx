import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { key: 'teacher', icon: '👩‍🏫', name: 'Lærer', desc: 'Oppgaver, AI-assistent, analyse' },
  { key: 'student', icon: '🎓', name: 'Elev', desc: 'Løs oppgaver, lær med AI' },
  { key: 'admin', icon: '🏛️', name: 'Administrator', desc: 'Skoler, brukere, systemlogg' },
];

export default function LoginScreen() {
  const { login, register, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [school, setSchool] = useState('Oslo Videregående Skole');
  const [className, setClassName] = useState('10A');
  const [selectedRole, setSelectedRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [infoBanner, setInfoBanner] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    const { error } = await login(email.trim(), password);
    setLoading(false);
    if (!error) navigate('/');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    const result = await register({
      email: email.trim(),
      password,
      displayName: displayName.trim() || email.split('@')[0],
      role: selectedRole,
      school,
      className: selectedRole === 'student' ? className : '',
      grade: '',
    });
    setLoading(false);
    if (result.error) return;
    if (result.needsEmailConfirm) {
      setInfoBanner(result.message);
      return;
    }
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🇳🇴</div>
          <div className="login-logo-text">
            <h1>Utdanningsplattform</h1>
            <p>Nasjonalt digitalt skolesystem</p>
          </div>
        </div>

        <div className="login-welcome">
          <h2 className="gradient-text-animated">{mode === 'login' ? 'Logg inn' : 'Opprett konto'}</h2>
          <p>{mode === 'login' ? 'Bruk e-post og passord fra Supabase Auth' : 'Registrer deg – data lagres i Supabase'}</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              type="button"
              className={`btn ${mode === m ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => {
                setMode(m);
                setAuthError(null);
                setInfoBanner('');
              }}
            >
              {m === 'login' ? 'Logg inn' : 'Registrer'}
            </button>
          ))}
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Fullt navn</label>
                <input
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Kari Nordmann"
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rolle</label>
                <div className="role-cards" style={{ marginTop: 8 }}>
                  {ROLES.map((r) => (
                    <div
                      key={r.key}
                      className={`role-card${selectedRole === r.key ? ' selected' : ''}`}
                      onClick={() => setSelectedRole(r.key)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="role-card-icon">{r.icon}</div>
                      <div className="role-card-name">{r.name}</div>
                      <div className="role-card-desc">{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Skole</label>
                <input className="form-input" value={school} onChange={(e) => setSchool(e.target.value)} />
              </div>
              {selectedRole === 'student' && (
                <div className="form-group">
                  <label className="form-label">Klasse</label>
                  <input className="form-input" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="10A" />
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label className="form-label">E-post</label>
            <input
              className="form-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deg@skole.no"
              autoComplete="email"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 28 }}>
            <label className="form-label">Passord</label>
            <input
              className="form-input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {infoBanner && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 8,
                background: 'rgba(34,197,94,0.12)',
                color: '#86efac',
                fontSize: '0.85rem',
                lineHeight: 1.5,
              }}
            >
              {infoBanner}
            </div>
          )}
          {authError && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 8,
                background: 'rgba(239,68,68,0.12)',
                color: '#fecaca',
                fontSize: '0.85rem',
                lineHeight: 1.5,
              }}
            >
              {authError}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ justifyContent: 'center', width: '100%' }}>
            {loading ? 'Vent litt…' : mode === 'login' ? 'Logg inn' : 'Opprett konto'}
          </button>
        </form>

        <div className="login-divider">Supabase · Vercel · GDPR-vennlig arkitektur</div>
      </div>
    </div>
  );
}
