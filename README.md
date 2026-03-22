# Nasjonal Utdanningsplattform

Dette er den overordnede prosjektstrukturen for den nasjonale digitale undervisningsplattformen.

## Moduler og Sammenkobling

Systemet er bygget opp av modulære deler:
- **Frontend (React)**: Inneholder UI-komponenter og skjermer. Kommuniserer med backend via REST API-er.
- **Backend (Node.js/Express)**: Eksponerer API-endepunkter for datamanipulasjon og forretningslogikk. Delegaterer oppgaver til sine tjenester (services).
- **Database (PostgreSQL)**: Lagrer all tilstandsdata. Aksesseres gjennom backend-modellene.
- **AI-Motor**: Analyserer data via egne tjenester, som kan kalles fra backend-tjenestene (f.eks. for å generere oppgaver eller beregne ferdighetsnivå).

MVP startes ved å bygge ut basis frontend-ruting og et hoveddashbord (Del 1 & 2).

## Drift med Supabase + Vercel (anbefalt for live demo)

Frontend bruker **Supabase Auth**, **Postgres** (tabeller: `profiles`, `assignments`, `submissions`) og **Row Level Security**. Ingen egen Express-server er nødvendig for denne flyten.

### 1. Supabase

1. Opprett prosjekt på [supabase.com](https://supabase.com).
2. **SQL Editor** → lim inn og kjør hele filen `supabase/migrations/20260322120000_init.sql` én gang.  
   - Hvis trigger-feil: bytt `execute procedure` til `execute function` i trigger-linjen (avhengig av Postgres-versjon).
3. **Authentication → Providers → Email**: for rask testing, skru av **Confirm email** (valgfritt i produksjon).
4. **Authentication → URL Configuration**: legg inn nettadressen til Vercel-appen under **Site URL** og **Redirect URLs** (f.eks. `https://ditt-prosjekt.vercel.app` og `https://ditt-prosjekt.vercel.app/**`).
5. **Project Settings → API**: kopier **Project URL** og **anon public** key.

### 2. Miljøvariabler

- Lokalt: kopier `frontend/.env.example` til `frontend/.env` og fyll inn `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY`.
- **Vercel** (prosjekt → Settings → Environment Variables): samme to variabler for *Production* (og ev. Preview).

### 3. Vercel

1. Koble GitHub-repo til Vercel, velg prosjektet.
2. **Root Directory**: `frontend`.
3. **Build Command**: `npm run build`  
4. **Output Directory**: `dist`
5. Deploy. Etter første deploy: legg inn env-vars hvis du ikke gjorde det før, deretter **Redeploy**.

### 4. Første brukere

1. Åpne den deployede URL-en.
2. **Registrer** minst én **lærer** og én **elev** (ulike e-poster).
3. Logg inn som elev for å løse oppgaver og lagre innleveringer i databasen; som lærer for å opprette nye oppgaver.

Endringer du pusher til `main` (eller branchen Vercel bygger fra) gir ny deploy automatisk.
