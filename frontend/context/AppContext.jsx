import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const INITIAL_ASSIGNMENTS = [
  {
    id: 'a1', title: 'Brøkregning – Del 1', subject: 'Matematikk',
    type: 'flervalg', status: 'Aktiv', class: '10A', due: '2026-03-25',
    difficulty: 3, icon: '📐', createdBy: 'u1',
    questions: [
      {
        id: 'q1', type: 'flervalg',
        text: 'Hva er 3/4 + 1/4?',
        options: ['1/2', '4/8', '1', '3/8'],
        correct: 2,
      },
      {
        id: 'q2', type: 'flervalg',
        text: 'Hva er 2/3 av 12?',
        options: ['4', '6', '8', '9'],
        correct: 2,
      },
      {
        id: 'q3', type: 'flervalg',
        text: 'Forenkle: 6/9',
        options: ['3/4', '2/3', '1/2', '5/8'],
        correct: 1,
      },
    ],
  },
  {
    id: 'a2', title: 'Norsk Grammatikk – Setningsledd', subject: 'Norsk',
    type: 'kort svar', status: 'Aktiv', class: '10A', due: '2026-03-22',
    difficulty: 2, icon: '📝', createdBy: 'u1',
    questions: [
      {
        id: 'q4', type: 'kort svar',
        text: 'Hva er subjektet i setningen: "Hunden løper fort"?',
        correct: 'Hunden',
      },
      {
        id: 'q5', type: 'kort svar',
        text: 'Hva kalles verbet i en setning?',
        correct: 'Predikat',
      },
    ],
  },
  {
    id: 'a3', title: 'Python Basis – Variabler og løkker', subject: 'Programmering',
    type: 'kode', status: 'Kommende', class: '10B', due: '2026-03-28',
    difficulty: 4, icon: '💻', createdBy: 'u1',
    questions: [
      {
        id: 'q6', type: 'kode',
        text: 'Skriv et Python-program som skriver ut tallene 1 til 10 med en for-løkke.',
        starterCode: 'for i in range(...):\n    print(...)',
        correct: 'for i in range(1, 11):\n    print(i)',
      },
    ],
  },
  {
    id: 'a4', title: 'Celle og Arv – Biologi', subject: 'Naturfag',
    type: 'flervalg', status: 'Vurdert', class: '9A', due: '2026-03-15',
    difficulty: 3, icon: '🔬', createdBy: 'u1',
    questions: [
      {
        id: 'q7', type: 'flervalg',
        text: 'Hva er cellens "kraftverk"?',
        options: ['Cellekjernen', 'Mitokondrien', 'Ribosomer', 'Golgi-apparatet'],
        correct: 1,
      },
    ],
  },
];

const INITIAL_STUDENTS = [
  { id: 'u2', name: 'Ole Hansen',     class: '10A', email: 'ole@elev.no',    role: 'student', skillLevel: 72, submissions: 8 },
  { id: 'u4', name: 'Emma Larsen',    class: '10A', email: 'emma@elev.no',   role: 'student', skillLevel: 88, submissions: 12 },
  { id: 'u5', name: 'Jonas Berg',     class: '10A', email: 'jonas@elev.no',  role: 'student', skillLevel: 61, submissions: 6 },
  { id: 'u6', name: 'Mia Andersen',   class: '10B', email: 'mia@elev.no',   role: 'student', skillLevel: 79, submissions: 10 },
  { id: 'u7', name: 'Erik Johansen',  class: '10B', email: 'erik@elev.no',   role: 'student', skillLevel: 55, submissions: 4 },
  { id: 'u8', name: 'Sarah Nilsen',   class: '9A',  email: 'sarah@elev.no',  role: 'student', skillLevel: 93, submissions: 15 },
  { id: 'u9', name: 'Lukas Pettersen',class: '9A',  email: 'lukas@elev.no', role: 'student', skillLevel: 67, submissions: 7 },
];

const INITIAL_TEACHERS = [
  { id: 'u1', name: 'Kari Nordmann',  email: 'kari@skole.no', role: 'teacher', subjects: ['Matematikk', 'Naturfag'], classes: ['10A','10B','9A'] },
  { id: 'u10', name: 'Per Solberg',   email: 'per@skole.no',  role: 'teacher', subjects: ['Norsk','Engelsk'],         classes: ['10A','9A'] },
  { id: 'u11', name: 'Lise Moen',     email: 'lise@skole.no', role: 'teacher', subjects: ['Programmering'],           classes: ['10B'] },
];

const INITIAL_SCHOOLS = [
  { id: 's1', name: 'Oslo Videregående Skole',   city: 'Oslo',   students: 542, teachers: 38, classes: 18 },
  { id: 's2', name: 'Bergen Ungdomsskole',        city: 'Bergen', students: 310, teachers: 24, classes: 12 },
  { id: 's3', name: 'Trondheim Barneskole',       city: 'Trondheim', students: 280, teachers: 20, classes: 10 },
];

const INITIAL_SUBMISSIONS = [
  { id: 'sub1', assignmentId: 'a1', studentId: 'u2', answers: [2, 2, 1], score: 100, submitted: '2026-03-20T14:30:00Z' },
  { id: 'sub2', assignmentId: 'a2', studentId: 'u2', answers: ['Hunden', 'Predikat'], score: 100, submitted: '2026-03-19T10:00:00Z' },
  { id: 'sub3', assignmentId: 'a4', studentId: 'u2', answers: [1], score: 100, submitted: '2026-03-15T09:00:00Z' },
];

const INITIAL_SKILLS = {
  u2: {
    overall: 72,
    Matematikk: 68,
    Norsk: 82,
    Naturfag: 75,
    Programmering: 50,
  }
};

export function AppProvider({ children }) {
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [schools] = useState(INITIAL_SCHOOLS);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [skillProfiles, setSkillProfiles] = useState(INITIAL_SKILLS);

  const addAssignment = (assignment) => {
    const newA = {
      ...assignment,
      id: `a${Date.now()}`,
      status: 'Aktiv',
      icon: '📄',
      createdBy: 'u1',
    };
    setAssignments(prev => [newA, ...prev]);
    return newA;
  };

  const updateAssignment = (id, updates) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAssignment = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const submitAssignment = (assignmentId, studentId, answers) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return null;

    let correct = 0;
    assignment.questions.forEach((q, i) => {
      if (answers[i] !== undefined && answers[i] !== null) {
        if (q.type === 'flervalg' && answers[i] === q.correct) correct++;
        else if (q.type === 'kort svar' && typeof answers[i] === 'string' &&
          answers[i].toLowerCase().trim() === q.correct.toLowerCase()) correct++;
        else if (q.type === 'kode') correct++; // mock: code always accepted
      }
    });

    const score = assignment.questions.length > 0
      ? Math.round((correct / assignment.questions.length) * 100)
      : 0;

    const sub = {
      id: `sub${Date.now()}`,
      assignmentId,
      studentId,
      answers,
      score,
      submitted: new Date().toISOString(),
    };

    setSubmissions(prev => [...prev, sub]);

    // Update adaptive skill profile
    setSkillProfiles(prev => {
      const profile = prev[studentId] || { overall: 50 };
      const subject = assignment.subject || 'overall';
      const current = profile[subject] || profile.overall || 50;
      const updated = Math.round(current * 0.8 + score * 0.2);
      return {
        ...prev,
        [studentId]: {
          ...profile,
          [subject]: Math.min(100, updated),
          overall: Math.min(100, Math.round((profile.overall || 50) * 0.85 + score * 0.15)),
        },
      };
    });

    return sub;
  };

  const getStudentSubmissions = (studentId) =>
    submissions.filter(s => s.studentId === studentId);

  const getAssignmentSubmissions = (assignmentId) =>
    submissions.filter(s => s.assignmentId === assignmentId);

  const getSkillProfile = (studentId) =>
    skillProfiles[studentId] || { overall: 50, Matematikk: 50, Norsk: 50 };

  const addUser = (user) => {
    if (user.role === 'student') {
      setStudents(prev => [...prev, { ...user, id: `u${Date.now()}`, skillLevel: 50, submissions: 0 }]);
    } else {
      setTeachers(prev => [...prev, { ...user, id: `u${Date.now()}` }]);
    }
  };

  return (
    <AppContext.Provider value={{
      assignments, addAssignment, updateAssignment, deleteAssignment,
      students, teachers, schools,
      submissions, submitAssignment, getStudentSubmissions, getAssignmentSubmissions,
      skillProfiles, getSkillProfile,
      addUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
