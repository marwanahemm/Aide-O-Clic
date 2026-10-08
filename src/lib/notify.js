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
      from: MAIL_FROM || 'Site SAP <onboarding@resend.dev>',
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