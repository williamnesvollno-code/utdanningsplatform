/**
 * AIChatService
 * AI-assistent for lærere for å generere undervisningsmateriell, prøver og analysere behov.
 * Sikrer at alle handlinger loggføres og krever manuell godkjenning før bruk (human-in-the-loop).
 */

class AIChatService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Genererer et utkast til oppgaver basert på et emne og parametere.
   * Endelig publisering krever lærerens godkjenning.
   * @param {number} teacherId 
   * @param {string} topic 
   * @param {Object} parameters (vanskelighetsgrad, antall spørsmål, type)
   */
  async generateAssignmentDraft(teacherId, topic, parameters = {}) {
    console.log(`[AI-LærerAssistent] Genererer oppgaveutkast om "${topic}" for lærer ${teacherId}`);
    
    // Her ville vi normalt hatt et kall til en LLM (f.eks. OpenAI API)
    // for å generere innholdet. For nå mocker vi output.
    const mockGeneratedContent = [
      {
        type: 'flervalg',
        question: `Hva er hovedstaden i Norge? (Tema: ${topic})`,
        options: ['Oslo', 'Bergen', 'Trondheim', 'Tromsø'],
        correctAnswer: 'Oslo',
        aiGenerated: true
      },
      {
        type: 'kort_svar',
        question: 'Beskriv i korte trekk prinsippet bak demokrati.',
        aiGenerated: true
      }
    ];

    // Loggfør AI-handlingen
    this._logAction('GENERATE_ASSIGNMENT', teacherId, { topic, parameters });

    // Returner et 'Draft'-objekt, IKKE lagre direkte som aktiv oppgave!
    // Appen MÅ be om lærerens godkjenning i frontend.
    return {
      draftId: `draft_${Date.now()}`,
      status: 'pending_teacher_approval',
      content: mockGeneratedContent,
      warning: 'AI-forslag må gjennomgås og publiseres manuelt.'
    };
  }

  /**
   * Foreslår en undervisningsplan eller differensieringstiltak for en klasse.
   * @param {number} teacherId 
   * @param {number} classId 
   */
  async suggestDifferentiationPlan(teacherId, classId) {
    console.log(`[AI-LærerAssistent] Analyserer klasse ${classId} for differensieringstiltak...`);
    
    // Anta at systemet henter aggregerte data for klassen her
    const plan = {
      summary: "Klassen sliter med brøkregning, spesielt over fellesnevner.",
      recommendations: [
        "Del klassen opp i 3 nivågrupper de neste 2 ukene.",
        "Generer enklere visuelle oppgaver for gruppe C.",
        "La gruppe A få kodeoppgaver for å modellere brøk."
      ],
      aiGenerated: true
    };

    this._logAction('SUGGEST_PLAN', teacherId, { classId });
    return plan;
  }

  /**
   * Loggfør alle AI-aktiviteter for sporbarhet iht. personvernkrav.
   */
  _logAction(actionType, userId, details) {
    // console.log(`Lagrer til ActivityLog DB...`);
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: actionType,
      teacherId: userId,
      details: JSON.stringify(details)
    };
    console.log(`[REVISJONSLOGG] ->`, logEntry);
    // this.db.ActivityLogs.create(logEntry);
  }
}

module.exports = AIChatService;
