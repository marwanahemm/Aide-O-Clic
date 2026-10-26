'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function connecter(e) {
    e.preventDefault();
    setEnvoi(true);
    setErreur('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motDePasse: new FormData(e.currentTarget).get('motDePasse') }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { router.refresh(); return; }
      setErreur(data.erreur || 'Connexion impossible.');
    } catch {
      setErreur('Connexion impossible. Vérifiez votre accès Internet.');
    }
    setEnvoi(false);
  }

  return (
    <div className="ac-subpage ac-login-wrap">
      <div className="ac-login">
        <div className="ac-login-intro">
          <p className="ac-eyebrow"><span className="ac-live" aria-hidden="true" /> Accès réservé · Aide O&apos;Clic</p>
          <h1>Espace <em>administration</em></h1>
          <p className="ac-lead">Gérez vos rendez-vous, messages, factures, tarifs et contenus du site depuis un seul tableau de bord.</p>
          <ul className="ac-ticks">
            <li>Connexion protégée par mot de passe</li>
            <li>Les modifications sont publiées aussitôt sur le site</li>
          </ul>
        </div>
        <div className="ac-console">
          <div className="ac-console-bar" aria-hidden="true">
            <span /><span /><span />
            <b>admin · connexion</b>
            <em>sécurisé</em>
          </div>
          <form className="ac-login-form" onSubmit={connecter}>
            <h2 className="ac-login-titre">Se connecter</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="mdp">Mot de passe</label>
              <input id="mdp" name="motDePasse" type="password" className="form-input" autoComplete="current-password" required />
            </div>
            {erreur && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {erreur}</div></div>}
            <button type="submit" className="btn btn-cta btn-lg btn-block" disabled={envoi}>{envoi ? 'Connexion…' : 'Se connecter'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
