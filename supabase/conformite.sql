-- À exécuter UNE FOIS dans Supabase > SQL Editor (remplace email-client.sql : contient aussi la colonne e-mail).
-- Sans danger si exécuté plusieurs fois. À faire AVANT de déployer cette version, sinon l'enregistrement des rendez-vous échouera.
alter table public.rendez_vous
  add column if not exists email text check (char_length(email) <= 150);

-- Preuve de l'acceptation des conditions d'annulation / rétractation (case à cocher du formulaire)
alter table public.rendez_vous
  add column if not exists conditions_acceptees_le timestamptz;
