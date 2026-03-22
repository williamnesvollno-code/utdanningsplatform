import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = {
  teacher: {
    id: 'u1',
    name: 'Kari Nordmann',
    email: 'kari.nordmann@skole.no',
    role: 'teacher',
    school: 'Oslo Videregående Skole',
    classes: ['10A', '10B', '9A'],
    subjects: ['Matematikk', 'Naturfag'],
    avatar: 'KN',
  },
  student: {
    id: 'u2',
    name: 'Ole Hansen',
    email: 'ole.hansen@elev.no',
    role: 'student',
    school: 'Oslo Videregående Skole',
    class: '10A',
    grade: '10.',
    avatar: 'OH',
  },
  admin: {
    id: 'u3',
    name: 'Admin Bruker',
    email: 'admin@utdanning.no',
    role: 'admin',
    school: 'Nasjonalt Utdanningsdirektorat',
    avatar: 'AB',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);

  const login = (role) => {
    const u = MOCK_USERS[role];
    setUser(u);
    addLog(`Innlogging: ${u.name} (${role}) logget inn`);
  };

  const logout = () => {
    if (user) addLog(`Utlogging: ${user.name} logget ut`);
    setUser(null);
  };

  const addLog = (msg) => {
    setLogs(prev => [
      { id: Date.now(), msg, time: new Date().toISOString() },
      ...prev.slice(0, 99),
    ]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, logs, addLog }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
