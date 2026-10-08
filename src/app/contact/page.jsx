import PageHead, { SectionTitle } from '../../components/PageHead';
import ContactForm from '../../components/ContactForm';
import { COMMUNES } from '../../lib/pricing';
import { TELEPHONE, TELEPHONE_HREF, EMAIL } from '../../lib/site';

export const metadata = { title: 'Contact — Assistance à domicile Agen' };

const lien = { color: 'var(--cyan-accent)', fontWeight: 700, textDecoration: 'none' };

export default function Contact() {
  return (
    <>
      <PageHead
        titre="Contact Rapide & Direct"
        sousTitre="Une question ? Un renseignement préalable avant d'intervenir chez vous ?"
        pastilles={['📞 Lundi - Vendredi', "📍 Bassin d'Agen", '⚡ Réponse sous 24h']}
      />
      <SectionTitle>ME CONTACTER DIRECTEMENT</SectionTitle>

      <div className="grid-2">
        <div className="card-item" style={{ padding: 20 }}>
          <div className="card-item-header" style={{ fontSize: 14, color: 'var(--navy-bg)', marginBottom: 12 }}>📞 Coordonnées Directes</div>
          <p style={{ marginBottom: 12 }}>
            <strong>Téléphone :</strong><br />
            <a href={TELEPHONE_HREF} style={lien}>{TELEPHONE}</a>
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong>Adresse e-mail :</strong><br />
            <a href={`mailto:${EMAIL}`} style={lien}>{EMAIL}</a>
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong>Zone d&apos;Intervention :</strong><br />
            {COMMUNES.join(', ')}.
          </p>
          <p>
            <strong>Horaires d&apos;Intervention :</strong><br />
            Du lundi au vendredi : 09h00 – 18h00.
          </p>
        </div>

        <div className="card-item" style={{ padding: 20 }}>
          <div className="card-item-header" style={{ fontSize: 14, color: 'var(--navy-bg)', marginBottom: 12 }}>✉️ Formulaire Simple</div>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
