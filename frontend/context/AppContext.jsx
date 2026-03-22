import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const INITIAL_SCHOOLS = [
  { id: 's1', name: 'Oslo Videregående Skole', city: 'Oslo', students: 542, teachers: 38, classes: 18 },
  { id: 's2', name: 'Bergen Ungdomsskole', city: 'Bergen', students: 310, teachers: 24, classes: 12 },
  { id: 's3', name: 'Trondheim Barneskole', city: 'Trondheim', students: 280, teachers: 20, classes: 10 },
];

function rowToAssignment(row) {
  const q = row.questions;
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    type: row.type,
    status: row.status,
    class: row.class_name,
    due: row.due_date,
    difficulty: row.difficulty,
    icon: row.icon || '📄',
    description: row.description || '',
    createdBy: row.created_by,
    questions: Array.isArray(q) ? q : [],
  };
}

function rowToSubmission(row) {
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    studentId: row.student_id,
    answers: row.answers,
    score: row.score,
    submitted: row.submitted_at,
  };
}

function buildStudents(profileRows, submissionsList) {
  const counts = {};
  submissionsList.forEach((s) => {
    counts[s.studentId] = (counts[s.studentId] || 0) + 1;
  });
  return profileRows
    .filter((p) => p.role === 'student')
    .map((p) => {
      const sp = p.skill_profile || {};
      return {
        id: p.id,
        name: p.display_name,
        class: p.class_name || '—',
        email: p.email || '',
        role: 'student',
        skillLevel: Math.round(Number(sp.overall) || 50),
        submissions: counts[p.id] || 0,
      };
    });
}

function buildTeachers(profileRows) {
  return profileRows
    .filter((p) => p.role === 'teacher')
    .map((p) => ({
      id: p.id,
      name: p.display_name,
      email: p.email || '',
      role: 'teacher',
      subjects: p.subjects || [],
      classes: p.classes || [],
    }));
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [schools] = useState(INITIAL_SCHOOLS);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase || !user) {
      setAssignments([]);
      setProfiles([]);
      setSubmissions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);

    const [aRes, sRes, pRes] = await Promise.all([
      supabase.from('assignments').select('*').order('created_at', { ascending: false }),
      supabase.from('submissions').select('*').order('submitted_at', { ascending: false }),
      supabase.from('profiles').select('*'),
    ]);

    if (aRes.error) setLoadError(aRes.error.message);
    else if (sRes.error) setLoadError(sRes.error.message);
    else if (pRes.error) setLoadError(pRes.error.message);
    else {
      setAssignments((aRes.data || []).map(rowToAssignment));
      setSubmissions((sRes.data || []).map(rowToSubmission));
      setProfiles(pRes.data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const students = useMemo(() => buildStudents(profiles, submissions), [profiles, submissions]);
  const teachers = useMemo(() => buildTeachers(profiles), [profiles]);

  const addAssignment = async (assignment) => {
    if (!supabase || !user) return null;
    const row = {
      title: assignment.title,
      subject: assignment.subject,
      type: assignment.type || 'flervalg',
      status: assignment.status || 'Aktiv',
      class_name: assignment.class || '10A',
      due_date: assignment.due || '',
      difficulty: assignment.difficulty ?? 3,
      icon: assignment.icon || '📄',
      description: assignment.description || '',
      questions: assignment.questions || [],
      created_by: user.id,
      ai_generated: Boolean(assignment.aiGenerated),
    };
    const { data, error } = await supabase.from('assignments').insert(row).select().single();
    if (error) {
      setLoadError(error.message);
      return null;
    }
    const mapped = rowToAssignment(data);
    setAssignments((prev) => [mapped, ...prev]);
    return mapped;
  };

  const updateAssignment = async (id, updates) => {
    if (!supabase) return;
    const patch = {};
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.class !== undefined) patch.class_name = updates.class;
    if (updates.due !== undefined) patch.due_date = updates.due;
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.subject !== undefined) patch.subject = updates.subject;
    if (updates.difficulty !== undefined) patch.difficulty = updates.difficulty;
    if (updates.questions !== undefined) patch.questions = updates.questions;
    const { error } = await supabase.from('assignments').update(patch).eq('id', id);
    if (error) setLoadError(error.message);
    else {
      setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    }
  };

  const deleteAssignment = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) setLoadError(error.message);
    else setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const mergeSkillProfile = (prev, subject, score) => {
    const profile = { ...(prev || {}), overall: prev?.overall ?? 50 };
    const subj = subject || 'overall';
    const current = profile[subj] ?? profile.overall ?? 50;
    profile[subj] = Math.min(100, Math.round(current * 0.8 + score * 0.2));
    profile.overall = Math.min(100, Math.round((profile.overall || 50) * 0.85 + score * 0.15));
    return profile;
  };

  const submitAssignment = async (assignmentId, studentId, answersArray) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment || !supabase) return null;

    let correct = 0;
    assignment.questions.forEach((q, i) => {
      const ans = answersArray[i];
      if (ans === undefined || ans === null) return;
      if (q.type === 'flervalg' && ans === q.correct) correct++;
      else if (q.type === 'kort svar' && typeof ans === 'string' && typeof q.correct === 'string' && ans.toLowerCase().trim() === q.correct.toLowerCase()) correct++;
      else if (q.type === 'kode') correct++;
    });

    const score = assignment.questions.length > 0 ? Math.round((correct / assignment.questions.length) * 100) : 0;

    const { data: subRow, error: subErr } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: studentId,
        answers: answersArray,
        score,
      })
      .select()
      .single();

    if (subErr) {
      setLoadError(subErr.message);
      return null;
    }

    const sub = rowToSubmission(subRow);
    setSubmissions((prev) => [...prev, sub]);

    const { data: me } = await supabase.from('profiles').select('skill_profile').eq('id', studentId).single();
    const merged = mergeSkillProfile(me?.skill_profile, assignment.subject, score);
    await supabase.from('profiles').update({ skill_profile: merged }).eq('id', studentId);

    setProfiles((prev) =>
      prev.map((p) => (p.id === studentId ? { ...p, skill_profile: merged } : p))
    );

    return sub;
  };

  const getStudentSubmissions = (studentId) => submissions.filter((s) => s.studentId === studentId);

  const getAssignmentSubmissions = (assignmentId) => submissions.filter((s) => s.assignmentId === assignmentId);

  const getSkillProfile = (studentId) => {
    const p = profiles.find((x) => x.id === studentId);
    const sp = p?.skill_profile || {};
    return {
      overall: sp.overall ?? 50,
      Matematikk: sp.Matematikk ?? 50,
      Norsk: sp.Norsk ?? 50,
      Naturfag: sp.Naturfag ?? 50,
      Programmering: sp.Programmering ?? 50,
    };
  };

  const addUser = () => {
    /* Brukere opprettes via registrering på innloggingssiden (Supabase Auth). */
  };

  return (
    <AppContext.Provider
      value={{
        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        students,
        teachers,
        schools,
        submissions,
        submitAssignment,
        getStudentSubmissions,
        getAssignmentSubmissions,
        getSkillProfile,
        addUser,
        profiles,
        loading,
        loadError,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
