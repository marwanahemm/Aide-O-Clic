import PageHead from '../../components/PageHead';
import BookingForm from '../../components/BookingForm';

export const metadata = { title: 'Prise de Rendez-vous — Assistance à domicile Agen' };

export default function RendezVous() {
  return (
    <>
      <PageHead
        titre="Prise de Rendez-vous en Ligne"
        sousTitre="Choisissez votre date et créneau d'intervention à domicile sur le Bassin d'Agen"
        pastilles={['📅 Calendrier en temps réel', '⚡ Intervention Rapide', '💳 Déduction 50 %']}
      />
      <BookingForm />
    </>
  );
}
