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
    <div className="card-item" style={{ padding: 24, maxWidth: 420, margin: '40px auto' }}>
      <div className="card-item-header">🔒 Espace administration</div>
      <form onSubmit={connecter}>
        <div className="form-group">
          <label className="form-label" htmlFor="mdp">Mot de passe</label>
          <input id="mdp" name="motDePasse" type="password" className="form-input" autoComplete="current-password" required />
        </div>
        {erreur && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {erreur}</div></div>}
        <button type="submit" className="btn-primary" disabled={envoi}>{envoi ? 'Connexion…' : 'Se connecter'}</button>
      </form>
    </div>
  );
}
