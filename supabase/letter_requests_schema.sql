-- ==============================================================================
-- SKEMA TABEL PERMOHONAN SURAT ADMINISTRASI DESA SIMANDULANG
-- Eksekusi file ini di Supabase > SQL Editor
-- Aman dijalankan berulang kali (Idempotent)
-- ==============================================================================

-- 1. ENUM TIPE SURAT & STATUS SURAT
do $$ begin
  create type letter_type as enum (
    'sku',
    'sktm',
    'domisili',
    'pengantar_ktp'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type letter_status as enum (
    'menunggu_verifikasi',
    'diproses',
    'ditandatangani_kades',
    'selesai',
    'ditolak'
  );
exception
  when duplicate_object then null;
end $$;

-- 2. TABEL PERMOHONAN SURAT
create table if not exists public.letter_requests (
  id uuid primary key default uuid_generate_v4(),
  ticket_number text unique not null,
  applicant_id uuid references public.profiles(id) on delete set null,
  applicant_name text not null,
  applicant_phone text not null,
  applicant_nik text,
  dusun text not null check (dusun in ('Dusun I', 'Dusun II', 'Dusun III', 'Dusun IV', 'Dusun V')),
  letter_type letter_type not null,
  purpose text not null,
  business_name text,
  business_type text,
  status letter_status not null default 'menunggu_verifikasi',
  rejection_reason text,
  officer_notes text,
  processed_by text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. INDEX UNTUK KECEPATAN PENCARIAN TIKET & PEMOHON
create index if not exists idx_letter_ticket on public.letter_requests (ticket_number);
create index if not exists idx_letter_applicant on public.letter_requests (applicant_id);
create index if not exists idx_letter_status on public.letter_requests (status);

-- 4. ROW LEVEL SECURITY (RLS)
alter table public.letter_requests enable row level security;

drop policy if exists "Public can view letter requests" on public.letter_requests;
drop policy if exists "Anyone can submit letter request" on public.letter_requests;
drop policy if exists "Anyone can update letter request" on public.letter_requests;

create policy "Public can view letter requests" on public.letter_requests for select using (true);
create policy "Anyone can submit letter request" on public.letter_requests for insert with check (true);
create policy "Anyone can update letter request" on public.letter_requests for update using (true);

-- 5. HAK AKSES PERIZINAN SCHEMA PUBLIC
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

-- 6. DATA SAMPEL PERMOHONAN SURAT (SEED DATA)
insert into public.letter_requests (
  ticket_number,
  applicant_name,
  applicant_phone,
  applicant_nik,
  dusun,
  letter_type,
  purpose,
  business_name,
  business_type,
  status,
  processed_by,
  officer_notes
)
values
  (
    'SRT-2026-001',
    'Bahrul Efendi',
    '081263451122',
    '1223021504850001',
    'Dusun I',
    'sku',
    'Syarat pengajuan pinjaman modal usaha perikanan di Bank Sumut',
    'Tangkahan Ikan Barokah',
    'Perikanan Tangkap Nelayan',
    'selesai',
    'Kaur Tata Usaha (Pak Ridwan)',
    'Berkas lengkap dan telah ditandatangani Kepala Desa Simandulang. Surat fisik siap diambil di Balai Desa.'
  ),
  (
    'SRT-2026-002',
    'Siti Rahmah',
    '085277889900',
    '1223024806900003',
    'Dusun II',
    'sktm',
    'Syarat beasiswa kuliah anak di Universitas Islam Negeri Sumatera Utara',
    null,
    null,
    'diproses',
    'Kasi Pelayanan Desa',
    'Verifikasi surat pengantar RT selesai. Draf surat sedang diproses untuk ditandatangani Kepala Desa.'
  ),
  (
    'SRT-2026-003',
    'Bahrul Efendi',
    '081263451122',
    '1223021504850001',
    'Dusun I',
    'domisili',
    'Keperluan pembukaan rekening tabungan nelayan Simandulang',
    null,
    null,
    'menunggu_verifikasi',
    null,
    null
  )
on conflict (ticket_number) do nothing;
