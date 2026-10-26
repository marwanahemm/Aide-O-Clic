import PageHead from '../../components/PageHead';
import BookingForm from '../../components/BookingForm';
import { construirePrestations } from '../../lib/pricing';
import { getConfig } from '../../lib/config';

export const metadata = { title: 'Prendre rendez-vous' };
export const dynamic = 'force-dynamic';

export default async function RendezVous({ searchParams }) {
  const cfg = await getConfig();
  const sp = await searchParams; // ?prestation=… (lien « Réserver cette aide » du catalogue)
  const prestationInitiale = typeof sp?.prestation === 'string' ? sp.prestation : '';
  const dateInitiale = typeof sp?.date === 'string' ? sp.date : '';
  const creneauInitial = typeof sp?.creneau === 'string' ? sp.creneau : '';
  return (
    <div className="ac-subpage">
      <PageHead
        titre="Prendre rendez-vous"
        sousTitre="Choisissez un jour et un créneau : je viens chez vous, sur le Bassin d'Agen. C'est simple et sans engagement."
        pastilles={['📅 Calendrier en temps réel', '⚡ Intervention rapide', `💳 Crédit d'impôt ${cfg.creditImpotPct} %`]}
      />
      <BookingForm creneaux={cfg.creneaux} communes={cfg.communes} prestations={construirePrestations(cfg)} prestationInitiale={prestationInitiale} dateInitiale={dateInitiale} creneauInitial={creneauInitial} />
    </div>
  );
}
