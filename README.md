# Nasjonal Utdanningsplattform

Dette er den overordnede prosjektstrukturen for den nasjonale digitale undervisningsplattformen.

## Moduler og Sammenkobling

Systemet er bygget opp av modulære deler:
- **Frontend (React)**: Inneholder UI-komponenter og skjermer. Kommuniserer med backend via REST API-er.
- **Backend (Node.js/Express)**: Eksponerer API-endepunkter for datamanipulasjon og forretningslogikk. Delegaterer oppgaver til sine tjenester (services).
- **Database (PostgreSQL)**: Lagrer all tilstandsdata. Aksesseres gjennom backend-modellene.
- **AI-Motor**: Analyserer data via egne tjenester, som kan kalles fra backend-tjenestene (f.eks. for å generere oppgaver eller beregne ferdighetsnivå).

MVP startes ved å bygge ut basis frontend-ruting og et hoveddashbord (Del 1 & 2).
