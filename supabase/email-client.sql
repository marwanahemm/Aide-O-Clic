-- À exécuter UNE FOIS dans Supabase > SQL Editor pour la confirmation de rendez-vous par e-mail au client.
-- Ajoute l'adresse e-mail (facultative) saisie dans le formulaire de rendez-vous. Sans danger si exécuté plusieurs fois.
alter table public.rendez_vous
  add column if not exists email text check (char_length(email) <= 150);
