/**
 * Student AI Assistant
 * En dedikert AI-tjeneste for å gi elever pedagogisk veiledning.
 * Gir forklaringer, hint og stegvis veiledning uten å gi bort det endelige svaret direkte.
 */

class StudentAIAssistant {
  constructor(db) {
    this.db = db;
  }

  /**
   * Gir et hint for et spesifikt spørsmål basert på elevens tidligere svar eller nivå.
   * @param {number} studentId 
   * @param {number} questionId 
   */
  async getHint(studentId, questionId) {
    console.log(`[Elev-AI] Genererer hint for elev ${studentId} på spørsmål ${questionId}...`);
    
    // Her kalder vi LLM og ber den formulere et hint som ikke avslører svaret
    const hint = "Husk at fellesnevneren er det minste felles multiplum av de to nevnerne. Prøv å se på gangetabellene deres.";

    this._logInteraction(studentId, 'REQUESTED_HINT', { questionId });
    return { hint, aiGenerated: true };
  }

  /**
   * Gir en stegvis forklaring hvis eleven står fast.
   * Kan bryte ned problemet i mindre, lette deler.
   * @param {number} studentId 
   * @param {string} problemDescription 
   */
  async getStepByStepGuide(studentId, problemDescription) {
    console.log(`[Elev-AI] Genererer stegvis guide for elev ${studentId}...`);

    const steps = [
      "Steg 1: Les oppgaven nøye og finn ut hva som egentlig spørres etter.",
      "Steg 2: Skriv opp det du allerede vet (gitte verdier).",
      "Steg 3: Sett opp ligningen eller grunnformelen for problemet."
    ];

    this._logInteraction(studentId, 'REQUESTED_GUIDE', { problemDescription });
    return { steps, promptNext: "Hvilket av disse stegene vil du starte med?", aiGenerated: true };
  }

  /**
   * Gir en generell forklaring på et konsept, skreddersydd elevens ferdighetsnivå.
   * @param {number} studentId 
   * @param {string} concept 
   */
  async explainConcept(studentId, concept) {
    // Hent ferdighetsnivå fra LearningProfiles
    // const level = await this.db.LearningProfiles.findOne({ where: { studentId } }).currentAbility;
    const level = 'medium'; // Mock

    const explanation = `Siden konseptet er "${concept}": Se for deg at det er som et tårn. Grunnsteinen må være på plass... (tilpasset nivå ${level})`;

    this._logInteraction(studentId, 'REQUESTED_EXPLANATION', { concept });
    return { explanation, aiGenerated: true };
  }

  /**
   * Loggfør alle interaksjoner
   */
  _logInteraction(studentId, action, details) {
    // this.db.ActivityLogs.create({...})
    console.log(`[Elev-AI LOGG] Elev: ${studentId} | Aksjon: ${action} | Detaljer:`, details);
  }
}

module.exports = StudentAIAssistant;
