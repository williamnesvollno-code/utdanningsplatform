/**
 * Assignment Engine
 * Motor for håndtering av oppgaver og prøver.
 * Støtter flere spørsmålstyper og samhandler med Assignments, Questions og StudentAnswers tabellene.
 */

class AssignmentEngine {
  constructor(db) {
    this.db = db;
  }

  /**
   * Oppretter en ny prøve eller oppgavesett
   * @param {Object} assignmentData - Data om oppgavesettet
   * @param {Array} questions - Liste over spørsmål (flervalg, kort svar, matte, kode)
   */
  async createAssignment(assignmentData, questions) {
    try {
      console.log(`Oppretter nytt oppgavesett: ${assignmentData.title}`);
      
      // Validering av oppgavetype
      const validTypes = ['flervalg', 'kort_svar', 'matte', 'kodeoppgaver', 'tekstsvar'];
      questions.forEach(q => {
        if (!validTypes.includes(q.type)) {
          throw new Error(`Ugyldig oppgavetype: ${q.type}`);
        }
      });

      // DB-lagring: Opprett Assignment
      // const newAssignment = await this.db.Assignments.create(assignmentData);
      
      // DB-lagring: Opprett Spørsmål
      // const formattedQuestions = questions.map(q => ({ ...q, assignmentId: newAssignment.id }));
      // await this.db.Questions.bulkCreate(formattedQuestions);

      return {
        id: Math.floor(Math.random() * 5000),
        status: 'created',
        title: assignmentData.title,
        questionCount: questions.length
      };
    } catch (error) {
      console.error('Kunne ikke opprette oppgave:', error);
      throw error;
    }
  }

  /**
   * Håndterer innsending av svar fra elev
   * @param {number} studentId
   * @param {number} assignmentId
   * @param {Array} answers
   */
  async submitAnswers(studentId, assignmentId, answers) {
    console.log(`Elev ${studentId} har levert svar til oppgavesett ${assignmentId}.`);
    
    // Lagre svar i StudentAnswers tabellen
    // ...

    // Fyr av hendelse til Adaptive Learning Engine for analyse av resultatet
    // this.adaptiveAI.analyzeSubmission(studentId, assignmentId, answers);

    return { success: true, gradingStatus: 'pending' };
  }
}

module.exports = AssignmentEngine;
