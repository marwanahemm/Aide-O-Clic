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
- Les tarifs (25 € / 35 €), communes et créneaux se modifient dans `src/lib/pricing.js`
  (si les créneaux changent, mettre aussi à jour la contrainte `creneau` dans `supabase/schema.sql`).
- Téléphone, e-mail, identité de l'éditeur et durées de conservation : `src/lib/site.js`.
- Sécurité : RLS activé sans policy → la base est inaccessible avec une clé publique ; seules les routes
  `/api/*` écrivent, côté serveur, avec la clé `service_role` (jamais préfixée `NEXT_PUBLIC_`).
