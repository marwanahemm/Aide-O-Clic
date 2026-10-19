# Site SAP — Assistance administrative & informatique (Agen)

Next.js (App Router) + Supabase (PostgreSQL) + Cloudflare Workers (via OpenNext) + Cloudflare R2 (images).

## 1. Supabase
1. Créer un projet sur https://supabase.com
2. **SQL Editor** → coller et exécuter `supabase/schema.sql`
3. **Project Settings → API** : noter l'URL du projet et la clé `service_role`

## 2. En local
```bash
npm install
cp .env.example .env.local     # puis remplir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
npm run dev                    # http://localhost:3000
```
Pour tester le rendu Cloudflare (Worker + R2) : copier aussi les variables dans un fichier `.dev.vars`,
puis `npm run preview`.

## 3. Cloudflare
1. Une seule fois : `npx wrangler login`, puis créer le bucket d'images :
   `npx wrangler r2 bucket create proxiclic-images --jurisdiction eu`
2. Déposer les images (logo, photos) dans ce bucket ; elles sont servies sur `/img/<nom-du-fichier>`.
3. Ajouter les variables/secrets (tableau de bord Cloudflare → Workers → *proxiclic* → Settings, ou
   `npx wrangler secret put SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, et si besoin
   `RESEND_API_KEY`, `NOTIFY_EMAIL`).
4. Déployer : `npm run deploy`
5. La purge RGPD quotidienne (03h00 UTC) est déclenchée par le Cron Trigger défini dans `wrangler.jsonc`
   et exécutée par `worker.js` ; elle nécessite `CRON_SECRET`.

> **Mode démo** : tant que `MODE_DEMO` n'est pas `false`, le site est non référencé et n'enregistre rien.
> Les pages étant générées au build, pour ouvrir le site au public lancer `MODE_DEMO=false npm run deploy`
> (et définir aussi `MODE_DEMO=false` côté Cloudflare).

## Fonctionnement
- `/` accueil & tarifs · `/simulation` · `/rendez-vous` · `/contact` · `/mentions-legales`
- Les demandes arrivent dans les tables `rendez_vous` et `messages_contact` (Supabase → Table Editor).
  Passer `statut` à `confirme` ou `annule` ; un RDV annulé libère le créneau.
- **Back-office : `/admin`.** Tarifs, crédit d'impôt, créneaux, communes, téléphone, e-mail, horaires et mentions légales
  se modifient sans toucher au code ; les rendez-vous (confirmer / annuler) et les messages s'y gèrent aussi.
  Mise en route : exécuter `supabase/back-office.sql` dans Supabase, puis définir le secret `ADMIN_PASSWORD`
  (12 caractères minimum) avec `npx wrangler secret put ADMIN_PASSWORD`, en plus de `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.
  Les valeurs écrites dans `src/lib/pricing.js` et `src/lib/site.js` ne servent plus que de valeurs de départ
  (utilisées tant que rien n'a été enregistré dans le back-office, ou si la base est injoignable).
- **Pages légales** : `/mentions-legales`, `/politique-de-confidentialite`, `/politique-de-cookies`, `/conditions-utilisation`
  et `/annulation-remboursement` (liées dans le pied de page). Elles lisent l'identité de l'éditeur, le médiateur de la
  consommation, la mention de TVA et le délai d'annulation depuis le back-office (onglets « Coordonnées & mentions légales » et « Tarifs »).
  Avant d'ouvrir le site au public : exécuter `supabase/conformite.sql` (et `supabase/gestion.sql` pour le carnet de clients), compléter ces champs (SIRET, n° SAP, médiateur…)
  et relire les textes. Aucun bandeau de cookies n'est nécessaire tant que le site n'utilise aucun traceur soumis à consentement.
- **Gestion depuis `/admin`** : formules et tarifs (ajout / modification / suppression, jusqu'à 6), FAQ de l'accueil, carnet de clients, rendez-vous et messages. Les formules et la FAQ sont stockées dans `parametres` (aucun SQL) ; le carnet de clients demande `supabase/gestion.sql`.
- Durées de conservation RGPD : `src/lib/site.js` (non modifiables depuis le back-office, car la purge automatique en dépend).
- Sécurité : RLS activé sans policy → la base est inaccessible avec une clé publique ; seules les routes
  `/api/*` écrivent, côté serveur, avec la clé `service_role` (jamais préfixée `NEXT_PUBLIC_`).
