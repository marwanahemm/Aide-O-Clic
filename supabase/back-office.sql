-- À exécuter UNE FOIS dans Supabase > SQL Editor (après schema.sql) pour activer le back-office /admin.
-- Sans danger si exécuté plusieurs fois.

-- Réglages modifiables du site (tarifs, créneaux, communes, coordonnées, mentions légales)
create table if not exists public.parametres (
  cle    text primary key,
  valeur jsonb not null,
  maj    timestamptz not null default now()
);

-- Limitation des tentatives de connexion à /admin (adresse IP hachée, purgée chaque nuit)
create table if not exists public.admin_tentatives (
  ip    text primary key,
  nb    int not null default 0,
  debut timestamptz not null default now()
);

-- Même sécurité que les autres tables : RLS activé sans policy → inaccessible avec une clé publique
alter table public.parametres       enable row level security;
alter table public.admin_tentatives enable row level security;

-- Les créneaux ne sont plus figés dans la base : ils se modifient dans le back-office
alter table public.rendez_vous drop constraint if exists rendez_vous_creneau_check;
