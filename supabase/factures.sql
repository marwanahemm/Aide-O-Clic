-- À exécuter UNE FOIS dans Supabase > SQL Editor pour activer les factures et attestations du back-office.
-- Sans danger si exécuté plusieurs fois. (Aucune facture n'est jamais supprimée automatiquement : conservation comptable de 10 ans.)
create table if not exists public.factures (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  numero          text not null unique,                      -- AAAA-NNN, continu (ex. 2026-001) : une facture n'est jamais supprimée, seulement annulée
  date_facture    date not null,
  date_prestation date not null,
  rdv_id          uuid references public.rendez_vous(id) on delete set null,
  client_id       uuid,                                      -- fiche du carnet de clients (facultatif ; la facture garde sa propre copie du nom et de l'adresse)
  client_nom      text not null check (char_length(client_nom) between 2 and 100),
  client_adresse  text check (char_length(client_adresse) <= 250),
  lignes          jsonb not null,                            -- [{ designation, quantite, prix_unitaire }]
  total           numeric(10, 2) not null check (total > 0),
  statut          text not null default 'emise' check (statut in ('emise', 'payee', 'annulee')),
  date_paiement   date,
  mode_paiement   text check (char_length(mode_paiement) <= 40),
  notes           text check (char_length(notes) <= 500)
);

-- Même sécurité que les autres tables : RLS activé sans policy → inaccessible avec une clé publique
alter table public.factures enable row level security;
create index if not exists factures_date_idx on public.factures (date_facture desc);
create index if not exists factures_client_idx on public.factures (client_id);
