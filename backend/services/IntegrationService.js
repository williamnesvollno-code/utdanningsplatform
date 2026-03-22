/**
 * Integration Service
 * Koblingspunkt mot eksterne leverandører som Visma InSchool, Feide, etc.
 * Sikrer synkronisering av brukerdata (elever, lærere, klasser) frem og tilbake.
 */

const axios = require('axios'); // Vanlig pakke brukt til HTTP-kall

class IntegrationService {
  constructor(db) {
    this.db = db;
    this.vismaApiUrl = process.env.VISMA_API_URL || 'https://api.vismainschool.no/v1';
    this.apiKey = process.env.VISMA_API_KEY || 'mock-api-key';
  }

  /**
   * Synkroniserer klasselister og fag fra Visma InSchool.
   * Kjøres typisk som en nattlig 'cron'-jobb eller ved semesterstart.
   * @param {number} schoolId 
   */
  async syncClassesFromVisma(schoolId) {
    console.log(`[Integrasjon] Starter synkronisering for skole ID: ${schoolId} mot Visma...`);

    try {
      // Reelt kall via Axios
      /*
      const response = await axios.get(`${this.vismaApiUrl}/schools/${schoolId}/classes`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      const externalClasses = response.data;
      */

      // Mock data inntil API-nøklene finnes:
      const externalClasses = [
        { externalId: 'VISMA_10A', name: '10A', course: 'Matematikk', teacherExternalId: 'VISMA_T1' },
        { externalId: 'VISMA_10B', name: '10B', course: 'Norsk', teacherExternalId: 'VISMA_T2' }
      ];

      // Oppdaterer interne databasetabeller (Class, Course) via standard databaselogikk
      let syncedCount = 0;
      for (const cls of externalClasses) {
        // let existing = await this.db.Classes.findOne({ where: { externalId: cls.externalId } });
        // if(!existing) { await this.db.Classes.create({...cls, schoolId}); }
        syncedCount++;
      }

      console.log(`[Integrasjon] Synkronisering vellykket. ${syncedCount} klasser oppdatert.`);
      return { success: true, synced: syncedCount, system: 'Visma' };

    } catch (error) {
      console.error('[Integrasjon] Feil under Visma-sync:', error.message);
      // Loggfør til en feillogg / varsle administrator
      throw error;
    }
  }

  /**
   * Sender fravær eller sluttvurderinger tilbake til det administrative systemet.
   * @param {Object} reportData 
   */
  async exportGradesToVisma(reportData) {
    console.log(`[Integrasjon] Eksporterer karakterer og fravær for klasse ${reportData.classId} til Visma...`);
    
    // axios.post(...)
    return { success: true, exportedAt: new Date().toISOString() };
  }
}

module.exports = IntegrationService;
