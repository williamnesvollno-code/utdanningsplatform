import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

import Sidebar  from './components/Sidebar';
import Header   from './components/Header';
import AIChat   from './components/AIChat';

import LoginScreen       from './screens/LoginScreen';
import MainDashboard     from './screens/MainDashboard';
import TeacherDashboard  from './screens/TeacherDashboard';
import StudentDashboard  from './screens/StudentDashboard';
import AdminDashboard    from './screens/AdminDashboard';
import AssignmentCreator from './screens/AssignmentCreator';
import AssignmentSolver  from './screens/AssignmentSolver';
import AnalyticsDashboard from './screens/AnalyticsDashboard';
import UserManagement    from './screens/UserManagement';
import AdaptiveTest      from './screens/AdaptiveTest';

function AuthGuard({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function PageTitles() {
  const location = useLocation();
  const map = {
    '/':               ['Oversikt', 'God morgen!'],
    '/teacher':        ['Lærerpanel', 'Oppgaver og elever'],
    '/student':        ['Mitt Panel', 'Progresjon og oppgaver'],
    '/admin':          ['Administrasjon', 'Systemstatus og brukere'],
    '/oppgaver/ny':    ['Ny Oppgave', 'Lag eller generer med AI'],
    '/oppgaver':       ['Mine Oppgaver', 'Aktive og fullførte oppgaver'],
    '/analyse':        ['Analyse', 'Klasseromsdata og rapporter'],
    '/brukere':        ['Brukere', 'Administrer alle brukere'],
    '/adaptiv-test':   ['Adaptiv Test', 'AI tilpasser oppgaver til ditt nivå'],
    '/progresjon':     ['Progresjon', 'Din læringshistorikk'],
  };
  return map[location.pathname] || ['Utdanningsplattform', ''];
}

function AppLayout() {
  const location = useLocation();
  const [title, subtitle] = PageTitles();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header title={title} subtitle={subtitle} />
        <main className="app-page">
          <Routes location={location}>
            <Route path="/"               element={<AuthGuard><MainDashboard /></AuthGuard>} />
            <Route path="/teacher"        element={<AuthGuard><TeacherDashboard /></AuthGuard>} />
            <Route path="/student"        element={<AuthGuard><StudentDashboard /></AuthGuard>} />
            <Route path="/admin"          element={<AuthGuard><AdminDashboard /></AuthGuard>} />
            <Route path="/oppgaver/ny"    element={<AuthGuard><AssignmentCreator /></AuthGuard>} />
            <Route path="/oppgaver/:id"   element={<AuthGuard><AssignmentSolver /></AuthGuard>} />
            <Route path="/oppgaver"       element={<AuthGuard><StudentAssignmentList /></AuthGuard>} />
            <Route path="/adaptiv-test"   element={<AuthGuard><AdaptiveTest /></AuthGuard>} />
            <Route path="/analyse"        element={<AuthGuard><AnalyticsDashboard /></AuthGuard>} />
            <Route path="/brukere"        element={<AuthGuard><UserManagement /></AuthGuard>} />
            <Route path="/logg"           element={<AuthGuard><AdminDashboard /></AuthGuard>} />
            <Route path="/ai-chat"        element={<AuthGuard><AIChatPage /></AuthGuard>} />
            <Route path="/progresjon"     element={<AuthGuard><StudentDashboard /></AuthGuard>} />
            <Route path="/klasser"        element={<AuthGuard><TeacherDashboard /></AuthGuard>} />
            <Route path="/skoler"         element={<AuthGuard><AdminDashboard /></AuthGuard>} />
            <Route path="/innstillinger"  element={<AuthGuard><SettingsPage /></AuthGuard>} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <AIChat />
      </div>
    </div>
  );
}

// Student assignment list page
function StudentAssignmentList() {
  const { assignments, submissions } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const mySubs = submissions.filter(s => s.studentId === (user?.id || 'u2'));
  const active = assignments.filter(a => a.status === 'Aktiv');
  const pending = active.filter(a => !mySubs.find(s => s.assignmentId === a.id));
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 24 }}>📝 Mine Oppgaver</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {pending.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>🎉 Ingen aktive oppgaver!</div>}
        {pending.map(a => (
          <div key={a.id} className="card card-3d assignment-item">
            <div className="assignment-icon">{a.icon}</div>
            <div className="assignment-info">
              <div className="assignment-title">{a.title}</div>
              <div className="assignment-meta">{a.subject} · Frist {a.due} · Vanskelighet {a.difficulty}/5</div>
            </div>
            <button className="btn btn-primary" onClick={() => navigate(`/oppgaver/${a.id}`)}>Start →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIChatPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: '4rem', marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>🤖</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>AI-Assistent</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Klikk på AI-knappen nede til høyre for å åpne chatten.
      </p>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)', padding: '24px',
      }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          🎓 <strong style={{ color: 'var(--text-primary)' }}>Elever:</strong> Få forklaringer, hint og steg-for-steg veiledning.<br />
          👩‍🏫 <strong style={{ color: 'var(--text-primary)' }}>Lærere:</strong> Generer oppgaver, analyser klasser, foreslå undervisningsplan.<br />
          <br />
          ⚠️ <em style={{ color: 'var(--text-muted)' }}>Alle AI-forslag merkes og kan ikke publiseres uten din godkjenning.</em>
        </p>
      </div>
    </div>
  );
}

function SettingsPage() {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 24 }}>⚙️ Innstillinger</h1>
      <div className="card">
        <div className="card-header"><h3>Brukerprofil</h3></div>
        <div className="card-body">
          {[['Navn', user?.name], ['E-post', user?.email], ['Rolle', user?.role], ['Skole', user?.school]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3>🔒 GDPR og personvern</h3></div>
        <div className="card-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Dine data lagres sikkert i EU-datasentre i samsvar med GDPR. Du kan når som helst be om innsyn, endring eller sletting av dine personopplysninger.
          </p>
          <button className="btn btn-ghost" style={{ marginTop: 16 }}>📧 Be om datainnsyn</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*"    element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

function LoginPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <LoginScreen />;
}
