-- ==============================================================================
-- SISTEM INFORMASI GEOGRAFIS & SPK SAW PRIORITAS INFRASTRUKTUR DESA
-- STUDI KASUS: DESA SIMANDULANG, KEC. KUALUH LEIDONG, KAB. LABUHANBATU UTARA
-- Database Schema untuk Supabase (PostgreSQL 15+)
-- Dilengkapi Migrasi Kolom Otomatis (Aman Dijalankan Berulang Kali Tanpa Error)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
do $$ begin
  create type user_role as enum ('warga', 'perangkat_desa', 'kepala_desa');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type report_status as enum (
    'menunggu_verifikasi',
    'terverifikasi',
    'disetujui_kades',
    'dalam_pengerjaan',
    'selesai',
    'ditolak',
    'duplikat'
  );
exception
  when duplicate_object then null;
end $$;

-- Pastikan nilai enum baru ditambahkan jika tipe enum sudah ada sebelumnya di PostgreSQL
alter type report_status add value if not exists 'disetujui_kades';
alter type report_status add value if not exists 'duplikat';

do $$ begin
  create type kades_decision as enum (
    'disetujui_apbdes',
    'tanggap_darurat',
    'diteruskan_kabupaten',
    'ditunda'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type infrastructure_type as enum (
    'jalan_poros',
    'jalan_lingkungan',
    'jembatan',
    'drainase_tanggul_rob',
    'dermaga_tangkahan',
    'fasilitas_umum'
  );
exception
  when duplicate_object then null;
end $$;

-- 3. TABEL PROFIL PENGGUNA
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  nik text,
  dusun text not null default 'Dusun I',
  role user_role not null default 'warga',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. TABEL KRITERIA SAW
create table if not exists public.saw_criteria (
  code text primary key,
  name text not null,
  attribute text not null check (attribute in ('benefit', 'cost')),
  weight numeric(4, 3) not null check (weight > 0 and weight <= 1),
  scale_description text not null,
  created_at timestamptz not null default now()
);

-- 5. TABEL LAPORAN KERUSAKAN
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  ticket_number text unique not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reporter_name text not null,
  reporter_phone text not null,
  reporter_nik text,
  hide_reporter_identity boolean not null default true,
  
  infrastructure_type infrastructure_type not null,
  title text not null,
  description text not null,
  dusun text not null check (dusun in ('Dusun I', 'Dusun II', 'Dusun III', 'Dusun IV', 'Dusun V')),
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  address_detail text,
  photo_url text,
  status report_status not null default 'menunggu_verifikasi',
  duplicate_of_ticket text,

  -- Disposisi Kepala Desa
  kades_decision kades_decision,
  budget_source text,
  approved_budget numeric(14, 2) default 0,
  disposition_notes text,
  disposition_at timestamptz,

  -- Penugasan & Penyelesaian
  assigned_officer text,
  assigned_department text,
  completion_photo_url text,
  completion_notes text,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- MIGRASI OTOMATIS: Jika tabel reports sudah pernah dibuat sebelumnya pada versi lama,
-- tambahkan kolom-kolom baru berikut tanpa menghapus data yang sudah ada:
alter table public.reports add column if not exists hide_reporter_identity boolean not null default true;
alter table public.reports add column if not exists duplicate_of_ticket text;
alter table public.reports add column if not exists kades_decision kades_decision;
alter table public.reports add column if not exists budget_source text;
alter table public.reports add column if not exists approved_budget numeric(14, 2) default 0;
alter table public.reports add column if not exists disposition_notes text;
alter table public.reports add column if not exists disposition_at timestamptz;
alter table public.reports add column if not exists assigned_officer text;
alter table public.reports add column if not exists assigned_department text;
alter table public.reports add column if not exists completion_photo_url text;
alter table public.reports add column if not exists completion_notes text;
alter table public.reports add column if not exists completed_at timestamptz;

-- 6. TABEL DUKUNGAN WARGA (1 ORANG 1 DUKUNGAN + UNDO)
create table if not exists public.report_supporters (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (report_id, user_id)
);

-- 7. TABEL EVALUASI & VERIFIKASI PERANGKAT DESA
create table if not exists public.report_evaluations (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid unique not null references public.reports(id) on delete cascade,
  evaluator_id uuid references public.profiles(id) on delete set null,
  c1_damage_level integer not null check (c1_damage_level between 1 and 4),
  c2_access_urgency integer not null check (c2_access_urgency between 1 and 3),
  c3_hazard_risk integer not null check (c3_hazard_risk between 1 and 3),
  c4_beneficiaries integer not null check (c4_beneficiaries between 1 and 3),
  c5_estimated_cost integer not null check (c5_estimated_cost between 1 and 3),
  verified_cost_rupiah numeric(14, 2) default 0,
  verification_notes text,
  verified_at timestamptz not null default now()
);

-- 8. SEED DATA KRITERIA SAW
insert into public.saw_criteria (code, name, attribute, weight, scale_description)
values
  ('C1', 'Tingkat Kerusakan Fisik', 'benefit', 0.300, '1: Ringan, 2: Sedang, 3: Berat, 4: Putus Total/Hancur'),
  ('C2', 'Nilai Strategis Akses', 'benefit', 0.250, '1: Gang/Pemukiman, 2: Akses Kebun/Antar-Dusun, 3: Jalan Utama/Tangkahan Nelayan/Faskes'),
  ('C3', 'Kerentanan Pasang Rob / Keselamatan', 'benefit', 0.200, '1: Rendah, 2: Sedang, 3: Tinggi / Kerap Banjir Rob Pasang Laut'),
  ('C4', 'Volume Pengguna / KK Terdampak', 'benefit', 0.150, '1: <50 KK, 2: 50-150 KK, 3: >150 KK / Jalur Logistik Nelayan'),
  ('C5', 'Estimasi Biaya Penanganan', 'cost', 0.100, '1: < Rp 5 Juta, 2: Rp 5-15 Juta, 3: > Rp 15 Juta')
on conflict (code) do update set
  name = excluded.name,
  attribute = excluded.attribute,
  weight = excluded.weight,
  scale_description = excluded.scale_description;

-- 9. VIEW PERANGKINGAN SAW OTOMATIS (DROP TERLEBIH DAHULU AGAR BERSIH)
drop view if exists public.v_saw_rankings cascade;

create view public.v_saw_rankings as
with verified_data as (
  select
    r.id as report_id,
    r.ticket_number,
    r.title,
    r.infrastructure_type,
    r.dusun,
    r.latitude,
    r.longitude,
    r.status,
    r.created_at,
    r.kades_decision,
    r.assigned_officer,
    (select count(*) from public.report_supporters s where s.report_id = r.id) as total_upvotes,
    e.c1_damage_level as x1,
    e.c2_access_urgency as x2,
    e.c3_hazard_risk as x3,
    e.c4_beneficiaries as x4,
    e.c5_estimated_cost as x5,
    e.verified_cost_rupiah,
    e.verified_at
  from public.reports r
  inner join public.report_evaluations e on r.id = e.report_id
  where r.status in ('terverifikasi', 'disetujui_kades', 'dalam_pengerjaan', 'selesai')
),
max_min as (
  select
    max(x1)::numeric as max_x1,
    max(x2)::numeric as max_x2,
    max(x3)::numeric as max_x3,
    max(x4)::numeric as max_x4,
    min(x5)::numeric as min_x5
  from verified_data
),
normalized as (
  select
    v.*,
    case when m.max_x1 > 0 then round(v.x1 / m.max_x1, 4) else 0 end as r1,
    case when m.max_x2 > 0 then round(v.x2 / m.max_x2, 4) else 0 end as r2,
    case when m.max_x3 > 0 then round(v.x3 / m.max_x3, 4) else 0 end as r3,
    case when m.max_x4 > 0 then round(v.x4 / m.max_x4, 4) else 0 end as r4,
    case when v.x5 > 0 then round(m.min_x5 / v.x5, 4) else 0 end as r5
  from verified_data v
  cross join max_min m
),
preference as (
  select
    n.*,
    round(
      (n.r1 * 0.300) +
      (n.r2 * 0.250) +
      (n.r3 * 0.200) +
      (n.r4 * 0.150) +
      (n.r5 * 0.100),
      4
    ) as saw_score
  from normalized n
)
select
  p.*,
  dense_rank() over (order by p.saw_score desc, p.verified_at asc) as priority_rank
from preference p;

-- 10. ROW LEVEL SECURITY (RLS)
alter table public.reports enable row level security;
alter table public.report_supporters enable row level security;
alter table public.report_evaluations enable row level security;
alter table public.saw_criteria enable row level security;
alter table public.profiles enable row level security;

-- Hapus policy lama terlebih dahulu agar tidak error duplicate policy
drop policy if exists "Public can view reports" on public.reports;
drop policy if exists "Anyone can submit a report" on public.reports;
drop policy if exists "Public can view criteria" on public.saw_criteria;
drop policy if exists "Public can view evaluations" on public.report_evaluations;
drop policy if exists "Public can view supporters" on public.report_supporters;

create policy "Public can view reports" on public.reports for select using (true);
create policy "Anyone can submit a report" on public.reports for insert with check (true);
create policy "Anyone can update reports" on public.reports for update using (true);
create policy "Public can view criteria" on public.saw_criteria for select using (true);
create policy "Public can view evaluations" on public.report_evaluations for select using (true);
create policy "Anyone can submit evaluations" on public.report_evaluations for insert with check (true);
create policy "Anyone can update evaluations" on public.report_evaluations for update using (true);
create policy "Public can view supporters" on public.report_supporters for select using (true);
create policy "Anyone can manage supporters" on public.report_supporters for all using (true);

-- 11. HAK AKSES PERIZINAN SCHEMA PUBLIC (MENCEGAH ERROR 42501 DI SUPABASE)
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
