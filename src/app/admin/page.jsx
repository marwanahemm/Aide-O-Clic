import { estAdmin, adminConfigure } from '../../lib/adminAuth';
import { getSupabase } from '../../lib/supabase';
import { getConfig, baseConfiguree } from '../../lib/config';
import { MODE_DEMO } from '../../lib/site';
import LoginForm from '../../components/admin/LoginForm';
import AdminPanel from '../../components/admin/AdminPanel';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Administration', robots: { index: false, follow: false } };

export default async function Admin() {
  if (!adminConfigure() || !baseConfiguree()) {
    return (
      <div className="card-item" style={{ padding: 24, marginTop: 20 }}>
        <div className="card-item-header">🔧 Espace admin non configuré</div>
        <p>Pour activer l&apos;espace admin, définir dans Cloudflare (Settings → Variables and Secrets) :</p>
        <ul>
          <li><strong>ADMIN_PASSWORD</strong> — mot de passe d&apos;au moins 12 caractères (secret)</li>
          <li><strong>SUPABASE_URL</strong> et <strong>SUPABASE_SERVICE_ROLE_KEY</strong> (secret)</li>
        </ul>
        <p>Puis exécuter <code>supabase/back-office.sql</code> dans Supabase (SQL Editor) et redéployer.</p>
      </div>
    );
  }
  if (!(await estAdmin())) return <LoginForm />;

  const config = await getConfig();
  const db = getSupabase();
  const [rdv, msg] = await Promise.all([
    db.from('rendez_vous').select('*').order('date_rdv', { ascending: false }).order('creneau').limit(300),
    db.from('messages_contact').select('*').order('created_at', { ascending: false }).limit(300),
  ]);

  return (
    <AdminPanel
      config={config}
      rendezVous={rdv.data || []}
      messages={msg.data || []}
      erreurDonnees={rdv.error || msg.error ? 'Lecture des rendez-vous ou messages impossible : vérifiez que supabase/schema.sql a bien été exécuté.' : ''}
      demo={MODE_DEMO}
    />
  );
}
