import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function mapProfileToUser(profile, sessionUser) {
  const email = profile.email || sessionUser?.email || '';
  const name = profile.display_name || email.split('@')[0] || 'Bruker';
  const initials =
    profile.avatar_initials ||
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    '??';

  return {
    id: profile.id,
    name,
    email,
    role: profile.role,
    school: profile.school || '',
    class: profile.class_name || '',
    grade: profile.grade || '',
    avatar: initials,
    subjects: profile.subjects || [],
    classes: profile.classes || [],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((msg) => {
    setLogs((prev) => [
      { id: Date.now(), msg, time: new Date().toISOString() },
      ...prev.slice(0, 99),
    ]);
  }, []);

  const loadProfile = useCallback(
    async (sessionUser) => {
      if (!supabase || !sessionUser) {
        setUser(null);
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error || !profile) {
        setUser(null);
        setAuthError(error?.message || 'Kunne ikke laste profil. Har du kjørt database-migrasjonen i Supabase?');
        return;
      }
      setAuthError(null);
      setUser(mapProfileToUser(profile, sessionUser));
    },
    []
  );

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setInitializing(false);
      setUser(null);
      setSession(null);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) loadProfile(s.user);
      else setUser(null);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) loadProfile(s.user);
      else setUser(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = async (email, password) => {
    setAuthError(null);
    if (!supabase) return { error: new Error('Supabase er ikke konfigurert') };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return { error };
    }
    if (data.user) {
      await loadProfile(data.user);
      addLog(`Innlogging: ${email}`);
    }
    return { error: null };
  };

  const register = async ({ email, password, displayName, role, school, className, grade }) => {
    setAuthError(null);
    if (!supabase) return { error: new Error('Supabase er ikke konfigurert'), needsEmailConfirm: false };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role,
          school: school || 'Min skole',
          class_name: className || '',
          grade: grade || '',
        },
      },
    });
    if (error) {
      setAuthError(error.message);
      return { error, needsEmailConfirm: false };
    }
    if (data.user && data.session) {
      await loadProfile(data.user);
      return { error: null, needsEmailConfirm: false };
    }
    if (data.user && !data.session) {
      return {
        error: null,
        needsEmailConfirm: true,
        message:
          'Konto opprettet. Bekreft e-postlenken, eller skru av «Confirm email» under Authentication → Providers i Supabase for raskere testing.',
      };
    }
    return { error: null, needsEmailConfirm: false };
  };

  const logout = async () => {
    if (user) addLog(`Utlogging: ${user.name} logget ut`);
    setUser(null);
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        initializing,
        authError,
        setAuthError,
        login,
        register,
        logout,
        logs,
        addLog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
