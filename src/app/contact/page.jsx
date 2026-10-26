import Icon from '../../components/Icon';
import PageHead from '../../components/PageHead';
import ContactForm from '../../components/ContactForm';
import { getConfig } from '../../lib/config';

export const metadata = { title: 'Contact' };
export const dynamic = 'force-dynamic';

export default async function Contact() {
  const { communes: COMMUNES, telephone: TELEPHONE, telephoneHref: TELEPHONE_HREF, email: EMAIL, horaires: HORAIRES } = await getConfig();
  return (
    <div className="ac-subpage">
      <PageHead
        titre="Une question ? Parlons-en."
        sousTitre="Un renseignement avant de me faire venir chez vous ? Appelez-moi ou écrivez-moi : je réponds avec plaisir."
        pastilles={['📞 Lundi - Vendredi', "📍 Bassin d'Agen", '⚡ Réponse sous 24h']}
      />

      <div className="contact-grid">
        <div className="contact-cards">
          <div className="contact-card primary">
            <div className="service-icon"><Icon name="phone" size={26} /></div>
            <div>
              <h2>Par téléphone</h2>
              <a className="big" href={TELEPHONE_HREF}>{TELEPHONE}</a>
              <p>{HORAIRES}</p>
            </div>
          </div>
          <div className="contact-card">
            <div className="service-icon"><Icon name="mail" size={26} /></div>
            <div>
              <h2>Par e-mail</h2>
              <a className="big" href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <p>Réponse sous 24 h</p>
            </div>
          </div>
          <div className="contact-card">
            <div className="service-icon"><Icon name="pin" size={26} /></div>
            <div>
              <h2>Zone d&apos;intervention</h2>
              <p style={{ color: 'var(--text-dark)', fontWeight: 700 }}>{COMMUNES.join(', ')}</p>
              <p>Déplacement inclus</p>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0 }}>
          <h2 className="panel-title"><Icon name="mail" size={24} /> Envoyer un message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
