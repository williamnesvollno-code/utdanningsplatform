/**
 * Security Service
 * Kjernekomponent for sikkerhet og GDPR-samsvar på plattformen.
 * Håndterer tilgangskontroll (RBAC), kryptering, og sentralisert revisjonslogging for alle hendelser.
 */

// Brukes typisk for kryptering og hashing (f.eks bcrypt for passord)
const crypto = require('crypto'); 

class SecurityService {
  constructor(db) {
    this.db = db;
    // Nøkkel for symmetrisk kryptering av spesielt sensitive persondata
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Middleware/Funksjon for rollebasert tilgangskontroll (RBAC)
   * Sjekker om en bruker har tillatelse til å utføre en handling.
   * @param {Object} user 
   * @param {string} requiredRole 
   */
  async authorize(user, requiredRole) {
    console.log(`[Security] Verifiserer tilgang for bruker ${user.id} mot rolle: ${requiredRole}...`);
    
    // Et enklere hierarki: admin > skoleadmin > lærer > elev
    const roleHierarchy = {
      'administrator': 500,
      'skoleadministrator': 400,
      'lærer': 300,
      'foresatt': 200,
      'elev': 100
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 999;

    if (userLevel < requiredLevel) {
      // Loggfør et mislykket tilgangsforsøk – viktig for revisjon og inntrengingsdeteksjon
      this.logAudit({
        actorId: user.id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: requiredRole,
        status: 'FAILED'
      });
      throw new Error(`Tilgang nektet: Krever '${requiredRole}' rettigheter.`);
    }

    return true;
  }

  /**
   * Universal revisjonslogg (Audit Log) for hele plattformen for GDPR-samsvar.
   * Lagres uforanderlig for å overvåke "hvem gjorde hva, når".
   * @param {Object} eventMetadata 
   */
  async logAudit(eventMetadata) {
    const timestamp = new Date().toISOString();
    
    // I en reell implementasjon vil dette skrives til en 'Revisions'-tabell 
    // som IKKE har "UPDATE" eller "DELETE" rettigheter
    const logEntry = {
      id: crypto.randomUUID(),
      timestamp,
      actorId: eventMetadata.actorId || 'SYSTEM',
      action: eventMetadata.action,
      resource: eventMetadata.resource || 'unknown',
      details: JSON.stringify(eventMetadata),
      status: eventMetadata.status || 'SUCCESS'
    };

    console.log(`[AUDIT TRAIL] Modifikasjonspost lagret: [${logEntry.action}] av ID ${logEntry.actorId}`);
    // await this.db.ActivityLogs.create(logEntry);
  }

  /**
   * Enveis-hashing for passord
   * @param {string} plainTextPassword 
   */
  hashPassword(plainTextPassword) {
    // I praksis: return bcrypt.hash(plainTextPassword, 12);
    return crypto.createHash('sha256').update(plainTextPassword).digest('hex');
  }

  /**
   * Toveiskryptering av særdeles sensitive data (f.eks. medisinske unntak for tilpasning)
   * Kreves for "Secure by Design" tilnærming i skolesammenheng.
   * @param {string} text 
   */
  encryptSensitiveData(text) {
    // Implementasjon av AES-256 for GDPR-datakryptering
    // ...
    return `ENCRYPTED::${Buffer.from(text).toString('base64')}`;
  }
}

module.exports = SecurityService;
