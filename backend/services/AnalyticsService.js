/**
 * Analytics Service
 * Samler inn og aggregerer data fra databasen for å produsere innsikt og rapporter.
 * Identifiserer svake temaer og beregner klasse- og elevprogresjon.
 */

class AnalyticsService {
  constructor(db, aiService) {
    this.db = db;
    this.aiService = aiService; // Kan brukes for dypere tekstanalyse e.l.
  }

  /**
   * Henter samlet statistikk og innsikt for en gitt klasse.
   * @param {number} classId 
   */
  async getClassAnalytics(classId) {
    console.log(`[Analytics] Bygger klasserapport for klasse ID: ${classId}...`);

    // Slik ville et reelt query sett ut i et PostgreSQL-system:
    // const students = await this.db.Users.findAll({ where: { classId, role: 'elev' }});
    // const profiles = await this.db.LearningProfiles.findAll({ where: { studentId: { [Op.in]: students.map(s => s.id) } }});
    // const answers = await this.db.StudentAnswers.findAll({ ... });

    // Aggregerte mock-data
    const report = {
      classId,
      averageProgress: 68, // Prosent fullført av årets pensum
      averageAbilityDelta: 0.15, // Endring i IRT-theta siden forrige måned
      weakTopics: [
        { topic: "Brøkregning (Ulik nevner)", wrongAnswerRate: 0.65 },
        { topic: "Sammensatte ord", wrongAnswerRate: 0.40 }
      ],
      studentDistribution: {
        advanced: 5,
        intermediate: 12,
        needsSupport: 3
      }
    };

    return report;
  }

  /**
   * Henter progresjonen til en enkelt elev over tid.
   * @param {number} studentId 
   */
  async getStudentProgression(studentId) {
    console.log(`[Analytics] Henter læringsprogresjon for elev ID: ${studentId}`);
    
    // Hent historiske theta (ferdighet) punkter for å tegne en graf
    // const history = await this.db.LearningPathData.findAll({ ... });

    return {
      studentId,
      overallStatus: 'On Track',
      recentTopics: [
        { name: "Algebra", status: 'Mestret' },
        { name: "Sannsynlighet", status: 'Trenger øving' }
      ],
      graphData: [
        { date: '2023-01', level: 0.1 },
        { date: '2023-02', level: 0.3 },
        { date: '2023-03', level: 0.45 }
      ]
    };
  }

  /**
   * Bruker AI for å autogenerere et handlingsnotat for læreren basert på tallene.
   * @param {Object} classReport 
   */
  async generateActionableInsights(classReport) {
    return `Basert på tallene anbefales en felles repetisjonsøkt om "Brøkregning (Ulik nevner)". 3 elever sakker akterut og bør få differensierte oppgaver.`;
  }
}

module.exports = AnalyticsService;
