import { Resend } from 'resend';

const propre = (s) => String(s).replace(/[\r\n]+/g, ' ').trim(); // pas de saut de ligne dans l'objet du mail

/**
 * Envoie un e-mail de notification à l'éditeur du site (texte brut uniquement).
 * Ne lève JAMAIS d'erreur : la demande est déjà enregistrée en base, un échec d'e-mail ne doit pas la bloquer.
 * Désactivé silencieusement si RESEND_API_KEY ou NOTIFY_EMAIL est absent.
 */
export async function notifier({ sujet, lignes, replyTo }) {
  const { RESEND_API_KEY, NOTIFY_EMAIL, MAIL_FROM } = process.env;
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) return;
  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: MAIL_FROM || "Aide O'Clic <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject: propre(sujet),
      text: lignes.join('\n'),
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) console.error('Resend :', error.name, error.message); // jamais le contenu du message
  } catch (e) {
    console.error('Resend :', e.message);
  }
}

/**
 * Envoie un e-mail à un CLIENT (texte brut). Ne lève jamais d'erreur ; renvoie { ok, detail }.
 * Exige MAIL_FROM : l'expéditeur de test de Resend (onboarding@resend.dev) ne peut écrire qu'au propriétaire du compte Resend,
 * il faut donc un domaine vérifié dans Resend pour écrire à de vrais clients.
 */
export async function envoyerAuClient({ to, sujet, lignes, replyTo }) {
  const { RESEND_API_KEY, MAIL_FROM } = process.env;
  if (!RESEND_API_KEY) return { ok: false, detail: 'RESEND_API_KEY non défini' };
  if (!MAIL_FROM) return { ok: false, detail: "MAIL_FROM non défini (il faut un domaine vérifié dans Resend)" };
  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: MAIL_FROM,
      to,
      subject: propre(sujet),
      text: lignes.join('\n'),
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error('Resend (client) :', error.name, error.message); // jamais l'adresse ni le contenu
      return { ok: false, detail: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error('Resend (client) :', e.message);
    return { ok: false, detail: e.message };
  }
}
