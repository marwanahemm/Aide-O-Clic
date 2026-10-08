'use client';
import { useState } from 'react';
import RgpdNote from './RgpdNote';

export default function ContactForm() {
  const [envoi, setEnvoi] = useState(false);
  const [etat, setEtat] = useState({ type: '', texte: '' });

  async function envoyer(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setEnvoi(true);
    setEtat({ type: '', texte: '' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        setEtat({ type: 'ok', texte: data.demo ? "Mode démonstration : le formulaire fonctionne, mais votre message n'a pas été enregistré." : 'Message envoyé. Je vous réponds sous 24h.' });
        form.reset();
      } else {
        setEtat({ type: 'erreur', texte: data.erreur || "Une erreur est survenue. Merci de réessayer ou de m'appeler." });
      }
    } catch {
      setEtat({ type: 'erreur', texte: 'Connexion impossible. Vérifiez votre accès Internet et réessayez.' });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={envoyer}>
      <input className="hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="form-group">
        <label className="form-label" htmlFor="c-nom">Votre Nom</label>
        <input id="c-nom" type="text" name="nom" className="form-input" required minLength={2} maxLength={100} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="c-contact">Téléphone ou E-mail</label>
        <input id="c-contact" type="text" name="contact" className="form-input" required minLength={5} maxLength={150} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="c-message">Votre Message</label>
        <textarea id="c-message" name="message" rows={4} className="form-textarea" placeholder="Expliquez brièvement votre demande..." required minLength={5} maxLength={2000} />
      </div>

      <RgpdNote />

      {etat.type === 'ok' && <div className="callout-box" role="status"><p>✅ {etat.texte}</p></div>}
      {etat.type === 'erreur' && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {etat.texte}</div></div>}

      <button type="submit" className="btn-primary" disabled={envoi}>{envoi ? 'Envoi en cours…' : 'Envoyer le message'}</button>
    </form>
  );
}