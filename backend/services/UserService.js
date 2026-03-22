/**
 * UserService
 * Hovedmodul for brukerhåndtering, innlogging og administrasjon av roller.
 * Modulen samhandler med databasens Users-tabell (PostgreSQL).
 */

class UserService {
  constructor(db) {
    this.db = db; // Innskutt database-instans
  }

  /**
   * Oppretter en ny bruker i systemet
   * @param {Object} userData - Egenskaper for den nye brukeren 
   * @returns {Object} den opprettede brukeren
   */
  async createUser(userData) {
    try {
      // Validering av påkrevde felt og roller
      const allowedRoles = ['administrator', 'skoleadministrator', 'lærer', 'elev', 'foresatt'];
      if (!allowedRoles.includes(userData.role)) {
        throw new Error('Ugyldig brukerrolle angitt.');
      }

      // Her ville det vanligvis vært hashing av passord
      // const hashedPassword = await SecurityService.hashPassword(userData.password);

      console.log(`Oppretter ny bruker med rolle: ${userData.role}`);

      // Her utføres den faktiske databaselagringen
      // const newUser = await this.db.Users.create({ ...userData, password: hashedPassword });
      
      const mockCreatedUser = {
        id: Math.floor(Math.random() * 10000),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        schoolId: userData.schoolId || null
      };

      // Alltid loggfør endringer!
      // await ActivityLog.create({ action: 'CREATE_USER', targetId: mockCreatedUser.id, userId: requestUser.id });

      return mockCreatedUser;
    } catch (error) {
      console.error('Feil ved opprettelse av bruker:', error);
      throw error;
    }
  }

  /**
   * Henter alle brukere tilknyttet en spesifikk skole
   * @param {number} schoolId 
   */
  async getUsersBySchool(schoolId) {
    console.log(`Henter brukere for skole ID: ${schoolId}`);
    // return await this.db.Users.findAll({ where: { schoolId } });
    return [
      { id: 1, name: 'Kari Nordmann', role: 'lærer' },
      { id: 2, name: 'Ola Nordmann', role: 'elev' }
    ];
  }
}

module.exports = UserService;
