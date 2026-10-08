// Worker d'entrée : réutilise le site Next.js généré par OpenNext et ajoute la tâche planifiée (Cron Trigger).
import handler from './.open-next/worker.js';

export default {
  fetch: handler.fetch,

  // Déclenché chaque nuit (voir "triggers.crons" dans wrangler.jsonc) : appelle la route de purge RGPD.
  async scheduled(_event, env, ctx) {
    const requete = new Request('https://interne.invalid/api/cron/purge', {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });
    const reponse = await handler.fetch(requete, env, ctx);
    console.log('Purge RGPD :', reponse.status, await reponse.text());
  },
};
