-- À exécuter dans Supabase > SQL Editor

-- ========== Rendez-vous ==========
create table if not exists public.rendez_vous (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  date_rdv    date not null,
  creneau     text not null,
  nom         text not null check (char_length(nom) between 2 and 100),
  telephone   text not null check (char_length(telephone) between 6 and 20),
  email       text check (char_length(email) <= 150),
  prestation  text not null,
  commune     text not null,
  details     text check (char_length(details) <= 1000),
  conditions_acceptees_le timestamptz,
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

-- ========== Back-office (/admin) ==========
-- Voir aussi supabase/back-office.sql (même contenu, à exécuter si la base existe déjà).
create table if not exists public.parametres (
  cle    text primary key,
  valeur jsonb not null,
  maj    timestamptz not null default now()
);
create table if not exists public.admin_tentatives (
  ip    text primary key,
  nb    int not null default 0,
  debut timestamptz not null default now()
);
alter table public.parametres       enable row level security;
alter table public.admin_tentatives enable row level security;

-- ========== Carnet de clients (back-office) ==========
-- Voir aussi supabase/gestion.sql (même contenu, à exécuter si la base existe déjà).
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  nom         text not null check (char_length(nom) between 2 and 100),
  telephone   text check (char_length(telephone) between 6 and 20),
  email       text check (char_length(email) <= 150),
  adresse     text check (char_length(adresse) <= 200),
  commune     text check (char_length(commune) <= 60),
  notes       text check (char_length(notes) <= 1000)
);
alter table public.clients enable row level security;
create index if not exists clients_nom_idx on public.clients (lower(nom));

-- ========== Factures (back-office) ==========
-- Voir aussi supabase/factures.sql (même contenu, à exécuter si la base existe déjà).
create table if not exists public.factures (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  numero          text not null unique,
  date_facture    date not null,
  date_prestation date not null,
  rdv_id          uuid references public.rendez_vous(id) on delete set null,
  client_id       uuid,
  client_nom      text not null check (char_length(client_nom) between 2 and 100),
  client_adresse  text check (char_length(client_adresse) <= 250),
  lignes          jsonb not null,
  total           numeric(10, 2) not null check (total > 0),
  statut          text not null default 'emise' check (statut in ('emise', 'payee', 'annulee')),
  date_paiement   date,
  mode_paiement   text check (char_length(mode_paiement) <= 40),
  notes           text check (char_length(notes) <= 500)
);
alter table public.factures enable row level security;
create index if not exists factures_date_idx on public.factures (date_facture desc);
create index if not exists factures_client_idx on public.factures (client_id);
