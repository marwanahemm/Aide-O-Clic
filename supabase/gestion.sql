-- À exécuter UNE FOIS dans Supabase > SQL Editor pour activer le carnet de clients du back-office.
-- Sans danger si exécuté plusieurs fois. (Les formules, tarifs et la FAQ n'ont besoin d'aucune table : ils sont enregistrés dans « parametres ».)
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),   -- dernière mise à jour : sert à la suppression automatique (36 mois)
  nom         text not null check (char_length(nom) between 2 and 100),
  telephone   text check (char_length(telephone) between 6 and 20),
  email       text check (char_length(email) <= 150),
  adresse     text check (char_length(adresse) <= 200),
  commune     text check (char_length(commune) <= 60),
  notes       text check (char_length(notes) <= 1000)
);

-- Même sécurité que les autres tables : RLS activé sans policy → inaccessible avec une clé publique
alter table public.clients enable row level security;
create index if not exists clients_nom_idx on public.clients (lower(nom));
