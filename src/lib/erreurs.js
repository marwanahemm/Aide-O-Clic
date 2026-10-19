// Traduit une erreur Supabase en message clair pour l'éditeur.
// Utilisé uniquement par les routes /api/admin/* (accessibles après connexion) : jamais affiché aux visiteurs.
export function expliquerErreurBase(e) {
  const code = e?.code || '';
  const msg = String(e?.message || '');
  if (code === 'PGRST205' || code === '42P01' || /could not find the table|does not exist/i.test(msg)) {
    return "Une table est introuvable dans Supabase : exécutez supabase/schema.sql, puis back-office.sql, conformite.sql et gestion.sql (SQL Editor).";
  }
  if (code === '42501' || /row-level security|permission denied/i.test(msg)) {
    return "Supabase refuse l'écriture : la clé enregistrée dans SUPABASE_SERVICE_ROLE_KEY n'a pas les droits. Utilisez la clé secrète (sb_secret_…) ou la clé service_role, pas la clé publique (anon / publishable).";
  }
  if (/invalid api key|jwt|apikey/i.test(msg)) {
    return 'Clé Supabase refusée : vérifiez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.';
  }
  if (/fetch failed|enotfound|network/i.test(msg)) {
    return 'Supabase est injoignable : vérifiez SUPABASE_URL.';
  }
  return `Erreur Supabase : ${msg.slice(0, 200) || 'inconnue'}`;
}
