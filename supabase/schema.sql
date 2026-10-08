-- À exécuter dans Supabase > SQL Editor

-- ========== Rendez-vous ==========
create table if not exists public.rendez_vous (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  date_rdv    date not null,
  creneau     text not null check (creneau in ('09h00 - 11h00','11h00 - 12h30','14h00 - 16h00','16h00 - 18h00')),
  nom         text not null check (char_length(nom) between 2 and 100),
  telephone   text not null check (char_length(telephone) between 6 and 20),
  prestation  text not null,
  commune     text not null,
  details     text check (char_length(details) <= 1000),
  statut      text not null default 'en_attente' check (statut in ('en_attente','confirme','annule'))
);

-- Un créneau ne peut être réservé qu'une fois (sauf si le RDV est annulé)
create unique index if not exists rendez_vous_creneau_unique
  on public.rendez_vous (date_rdv, creneau) where statut <> 'annule';

-- ========== Messages de contact ==========
create table if not exists public.messages_contact (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  nom         text not null check (char_length(nom) between 2 and 100),
  contact     text not null check (char_length(contact) between 5 and 150),
  message     text not null check (char_length(message) between 5 and 2000),
  lu          boolean not null default false
);

-- ========== Sécurité (RLS) ==========
-- RLS activé SANS aucune policy : personne ne peut lire/écrire avec la clé publique.
-- Seules les routes API du site (clé service_role côté serveur) accèdent aux tables.
alter table public.rendez_vous     enable row level security;
alter table public.messages_contact enable row level security;
