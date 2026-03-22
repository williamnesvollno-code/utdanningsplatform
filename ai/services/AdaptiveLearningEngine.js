/**
 * Adaptive Learning Engine (AI Motor)
 * Kjernefunksjon for å estimere elevens ferdighetsnivå og velge neste tilpassede oppgave.
 * Benytter Item Response Theory (IRT) prinsipper og Bayesiansk estimering.
 */

class AdaptiveLearningEngine {
  constructor(db) {
    this.db = db;
    // Standard antakelser for en ny elev i et ferskt fag
    this.initialAbilityScale = 0; // Gjennomsnittlig startnivå (theta)
  }

  /**
   * Analyserer et innlevert prøvesvar og oppdaterer elevens profil
   * Basert på Bayesiansk ferdighetsestimering
   * @param {number} studentId
   * @param {number} assignmentId
   * @param {Array} answers
   */
  async analyzeSubmission(studentId, assignmentId, answers) {
    try {
      console.log(`[AI-Motor] Analyserer svar fra elev ${studentId} for oppgave ${assignmentId}...`);

      // Hent tidligere lagret profil fra LearningProfiles tabellen
      // let profile = await this.db.LearningProfiles.findOne({ where: { studentId } });
      let currentAbility = this.initialAbilityScale; // Hvis ingen profil finnes (mock)
      
      let correctAnswers = 0;
      
      // Gå gjennom hvert svar for å evaluere
      for (const ans of answers) {
        // Hent spørsmålets vanskelighetsgrad (b) og diskriminasjon (a) fra Question-tabell
        // For eksempelet antar vi et middels vanskelig spørsmål (b=0, a=1)
        const difficulty = ans.questionDifficulty || 0;
        const discrimination = ans.questionDiscrimination || 1;
        
        const isCorrect = ans.isCorrect;
        if (isCorrect) correctAnswers++;

        // En forenklet oppdatering av ferdighet (theta)
        // Ved riktig svar justeres nivået opp justert for oppgavens vanskelighet
        const adjustment = isCorrect 
          ? (1 - this.probabilityIRT(currentAbility, difficulty, discrimination))
          : (0 - this.probabilityIRT(currentAbility, difficulty, discrimination));

        currentAbility += (adjustment * 0.4); // 0.4 fungerer som en 'learning rate'
      }

      console.log(`[AI-Motor] Elev ${studentId} sin nye ferdighetsscore: ${currentAbility.toFixed(2)}`);

      // Lagre oppdatert profil i databasen
      // await profile.update({ currentAbility: currentAbility });

      // Loggfør AI-beslutningen / beregningen for sporbarhet
      this._logDecision(studentId, 'UPDATE_ABILITY', {
        oldAbility: this.initialAbilityScale,
        newAbility: currentAbility,
        assignmentId
      });

      return { studentId, newAbilityLevel: currentAbility, score: correctAnswers };
    } catch (error) {
      console.error('[AI-Motor] Feil ved analyse:', error);
      throw error;
    }
  }

  /**
   * Foreslår (genererer) neste oppgave for eleven basert på deres nivå
   * @param {number} studentId
   * @param {string} courseId
   */
  async recommendNextTask(studentId, courseId) {
    // Hent elevens ferdighetsnivå fra profil
    const currentAbility = 0.5; // Mock data

    console.log(`[AI-Motor] Søker etter oppgave med vanskelighetsgrad tilnærmet ${currentAbility.toFixed(2)} for elev ${studentId}`);
    
    // Finn et spørsmål der difficulity (b) er nærmest currentAbility (theta)
    // Slik at sjansen for riktig svar er ca 50% for optimal læring (Flow-sone)
    const recommendedTask = {
      id: 999,
      type: 'flervalg',
      title: 'Tilpasset Brøkregning',
      difficultyLevel: 0.55
    };

    return recommendedTask;
  }

  /**
   * Loggføring av AI-motor-beslutninger (Sikkerhet og Revisjon)
   */
  _logDecision(targetId, action, metadata) {
    // Lagre hendelsen i ActivityLogs-tabellen
    console.log(`[AI-LOG] Årsak: ${action} | Mål: ${targetId} | Metadata:`, metadata);
  }

  /**
   * 2PL (Two-Parameter Logistic) Modell innen Item Response Theory
   * Beregner sannsynligheten for at eleven svarer riktig
   */
  probabilityIRT(ability, difficulty, discrimination) {
    const e = Math.exp(discrimination * (ability - difficulty));
    return e / (1 + e);
  }
}

module.exports = AdaptiveLearningEngine;
