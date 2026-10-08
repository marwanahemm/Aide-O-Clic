import { createClient } from '@supabase/supabase-js';

// Client SERVEUR uniquement (clé service_role) : utilisé dans les routes /api, jamais dans un composant client.
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant');
  return createClient(url, key, { auth: { persistSession: false } });
}
