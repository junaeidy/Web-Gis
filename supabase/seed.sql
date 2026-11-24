-- ==============================================================================
-- SEED DATA: 6 TITIK KERUSAKAN INFRASTRUKTUR DENGAN 6 PRIORITAS SAW BERBEDA
-- STUDI KASUS: DESA SIMANDULANG, KEC. KUALUH LEIDONG, KAB. LABUHANBATU UTARA
-- Siap dieksekusi langsung di SQL Editor Supabase
-- ==============================================================================

-- 1. BERSIHKAN DATA SEED LAMA JIKA ADA (BERDASARKAN TIKET SMD-2026-001 s/d 006)
delete from public.reports 
where ticket_number in (
  'SMD-2026-001',
  'SMD-2026-002',
  'SMD-2026-003',
  'SMD-2026-004',
  'SMD-2026-005',
  'SMD-2026-006'
);

-- 2. INSERT 6 LAPORAN INFRASTRUKTUR RIIL PESISIR
insert into public.reports (
  id,
  ticket_number,
  reporter_id,
  reporter_name,
  reporter_phone,
  reporter_nik,
  hide_reporter_identity,
  infrastructure_type,
  title,
  description,
  dusun,
  latitude,
  longitude,
  address_detail,
  photo_url,
  status,
  kades_decision,
  budget_source,
  approved_budget,
  disposition_notes,
  disposition_at,
  assigned_officer,
  assigned_department,
  created_at,
  updated_at
)
values
  -- ============================================================================
  -- DATA 1: PRIORITAS #1 (V = 1.0000) - TANGGAP DARURAT SEGERA
  -- ============================================================================
  (
    'a0000000-0000-0000-0000-000000000001',
    'SMD-2026-001',
    null,
    'Bahrul Efendi',
    '081263451122',
    '1223021504850001',
    true,
    'jembatan',
    'Jembatan Kayu Sei Puyuh Lapuk & Amblas Dihantam Air Pasang Rob',
    'Lantai kayu jembatan penghubung Simandulang Pantai sebagian besar sudah lapuk dan patah dihantam air pasang laut perbani. Mengancam keselamatan anak sekolah dan akses nelayan membawa hasil tangkapan ikan.',
    'Dusun I',
    2.8385000,
    99.9725000,
    'Dekat Tangkahan Nelayan Simandulang Pantai, Dusun I',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    'dalam_pengerjaan',
    'tanggap_darurat',
    'Dana Tanggap Darurat & Bencana Desa',
    4800000,
    'Disetujui untuk perbaikan segera dengan penggantian balok kayu damar laut mengingat akses harian anak sekolah dan jalur utama tangkahan nelayan.',
    now() - interval '3 days',
    'Tim Swakelola Dusun I (Koord: Pak Ilham)',
    'Seksi Kesejahteraan & Pembangunan Desa Simandulang',
    now() - interval '5 days',
    now() - interval '3 days'
  ),

  -- ============================================================================
  -- DATA 2: PRIORITAS #2 (V = 0.9000) - DISIKAPI APBDES
  -- ============================================================================
  (
    'a0000000-0000-0000-0000-000000000002',
    'SMD-2026-002',
    null,
    'Siti Rahmah',
    '085277123490',
    '1223024501930003',
    true,
    'drainase_tanggul_rob',
    'Tanggul Penahan Rob Parit Sei Nelayan Jebol Tergerus Pasang',
    'Tanggul tanah penahan air laut pasang jebol sepanjang 18 meter di muara parit. Air asin pasang perbani menggenangi permukiman puluhan kepala keluarga dan pekarangan rumah.',
    'Dusun III',
    2.8410000,
    99.9650000,
    'Bantaran Muara Parit Sei Dusun III Simandulang',
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    'disetujui_kades',
    'disetujui_apbdes',
    'APBDes T.A. 2026 (Bidang Pembangunan)',
    9500000,
    'Disetujui penanganan pemasangan tanggul karung pasir bertulang kayu gelam dan penguatan cerucuk tanah.',
    now() - interval '2 days',
    'Satgas Tanggap Bencana & TPK Desa',
    'Seksi Pembangunan Desa Simandulang',
    now() - interval '4 days',
    now() - interval '2 days'
  ),

  -- ============================================================================
  -- DATA 3: PRIORITAS #3 (V = 0.8083) - JALUR POROS UTAMA DESA
  -- ============================================================================
  (
    'a0000000-0000-0000-0000-000000000003',
    'SMD-2026-003',
    null,
    'Haji Ridwan Panjaitan',
    '082167894433',
    '1223021908720002',
    true,
    'jalan_poros',
    'Jalan Poros Utama Menuju Balai Desa Amblas Tergerus Erosi',
    'Badan jalan semen rabat beton amblas selebar 2,5 meter tergerus abrasi parit muara. Truk pengangkut kelapa sawit dan mobil pikap nelayan tidak dapat berpapasan.',
    'Dusun II',
    2.8335000,
    99.9690000,
    'Jalan Poros Utama Menuju Kantor Balai Desa Simandulang',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    'terverifikasi',
    null,
    null,
    0,
    null,
    null,
    null,
    null,
    now() - interval '3 days',
    now() - interval '2 days'
  ),

  -- ============================================================================
  -- DATA 4: PRIORITAS #4 (V = 0.7250) - DERMAGA TAMBATAN PERAHU
  -- ============================================================================
  (
    'a0000000-0000-0000-0000-000000000004',
    'SMD-2026-004',
    null,
    'M. Yusuf Siagian',
    '082211445588',
    '1223022207880005',
    true,
    'dermaga_tangkahan',
    'Tiang Pancang Tangkahan Nelayan Dusun V Rapuh Dihantam Ombak',
    'Dua tiang pancang dermaga kayu cerucuk tambatan perahu nelayan rapuh dan retak akibat hantaman ombak pasang dan benturan perahu pompong nelayan.',
    'Dusun V',
    2.8465000,
    99.9780000,
    'Pangkalan Kapal Nelayan & Tambak Simandulang, Dusun V',
    'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=800&q=80',
    'terverifikasi',
    null,
    null,
    0,
    null,
    null,
    null,
    null,
    now() - interval '2 days',
    now() - interval '1 day'
  ),

  -- ============================================================================
  -- DATA 5: PRIORITAS #5 (V = 0.5500) - SALURAN DRAINASE / GORONG-GORONG
  -- ============================================================================
  (
    'a0000000-0000-0000-0000-000000000005',
    'SMD-2026-005',
    null,
    'Khairul Amri',
    '081399887766',
    '1223021102900004',
    true,
    'drainase_tanggul_rob',
    'Gorong-Gorong Pembuangan Saluran Parit Dusun IV Ambles',
    'Pipa saluran gorong-gorong semen retak dan ambles akibat beban angkutan hasil kebun dan tersumbat sedimen lumpur tanah rawa.',
    'Dusun IV',
    2.8250000,
    99.9620000,
    'Saluran Pembuangan Parit Perkebunan Dusun IV',
    'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80',
    'terverifikasi',
    null,
    null,
    0,
    null,
    null,
    null,
    null,
    now() - interval '1 day',
    now() - interval '12 hours'
  ),

  -- ============================================================================
  -- DATA 6: PRIORITAS #6 (V = 0.3083) - JALAN LINGKUNGAN / GANG SWADAYA
  -- ============================================================================
  (
    'a0000000-0000-0000-0000-000000000006',
    'SMD-2026-006',
    null,
    'Darmansyah',
    '085388221199',
    '1223021803790006',
    true,
    'jalan_lingkungan',
    'Jalan Lingkungan Gang Nelayan Damai Becek Berlumpur',
    'Jalan tanah setapak pemukiman warga sepanjang 100 meter becek dan licin berlumpur saat hujan turun, dilalui sekitar 20 KK warga setempat.',
    'Dusun I',
    2.8360000,
    99.9750000,
    'Gang Damai Nelayan RT 02 Dusun I Simandulang',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
    'terverifikasi',
    null,
    null,
    0,
    null,
    null,
    null,
    null,
    now() - interval '18 hours',
    now() - interval '6 hours'
  )
on conflict (id) do nothing;

-- 3. INSERT HASIL EVALUASI SAW (C1 - C5) UNTUK KE-6 DATA
insert into public.report_evaluations (
  id,
  report_id,
  evaluator_id,
  c1_damage_level,
  c2_access_urgency,
  c3_hazard_risk,
  c4_beneficiaries,
  c5_estimated_cost,
  verified_cost_rupiah,
  verification_notes,
  verified_at
)
values
  -- Evaluasi Data 1 -> V = 1.0000 (Rank #1)
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    null,
    4, -- C1: Putus Total/Hancur (Max: 4)
    3, -- C2: Jalan Utama / Tangkahan Nelayan (Max: 3)
    3, -- C3: Kerentanan Rob Sangat Tinggi (Max: 3)
    3, -- C4: >150 KK (Max: 3)
    1, -- C5: < Rp 5 Jt (Min Cost: 1 -> R5 = 1/1 = 1)
    4800000,
    'Hasil verifikasi lapangan: Gelagar kayu jembatan patah terbelah. Penanganan darurat kayu damar laut mendesak dieksekusi demi mobilitas anak sekolah dan nelayan.',
    now() - interval '4 days'
  ),

  -- Evaluasi Data 2 -> V = 0.9000 (Rank #2)
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    null,
    4, -- C1: Tanggul Jebol / Hancur
    3, -- C2: Perlindungan Pemukiman Warga
    3, -- C3: Sangat Rawan Banjir Rob Perbani
    2, -- C4: 50-150 KK
    2, -- C5: Rp 5-15 Jt (Cost: 2 -> R5 = 1/2 = 0.5)
    9500000,
    'Pemasangan cerucuk kayu gelam dan 400 karung pasir penahan rembesan air pasang asin laut sebelum puncak air pasang perbani.',
    now() - interval '3 days'
  ),

  -- Evaluasi Data 3 -> V = 0.8083 (Rank #3)
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    null,
    3, -- C1: Berat (3/4 = 0.75)
    3, -- C2: Jalan Poros Utama Desa
    2, -- C3: Sedang
    3, -- C4: >150 KK (Jalur Logistik Sawit & Ikan)
    2, -- C5: Rp 5-15 Jt
    14500000,
    'Perlu cerucuk kayu nibung penahan erosi tebing parit dan pengecoran rabat beton bertulang.',
    now() - interval '2 days'
  ),

  -- Evaluasi Data 4 -> V = 0.7250 (Rank #4)
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000004',
    null,
    3, -- C1: Berat (3/4 = 0.75)
    2, -- C2: Antar-Dusun / Pangkalan Tambatan (2/3)
    2, -- C3: Sedang (2/3)
    2, -- C4: 50-150 KK (2/3)
    1, -- C5: < Rp 5 Jt (R5 = 1/1 = 1)
    4200000,
    'Penggantian 4 tiang pancang nibung dan balok bantalan tambatan perahu nelayan Dusun V.',
    now() - interval '1 day'
  ),

  -- Evaluasi Data 5 -> V = 0.5500 (Rank #5)
  (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000005',
    null,
    2, -- C1: Sedang (2/4 = 0.5)
    2, -- C2: Akses Kebun & Saluran Parit (2/3)
    2, -- C3: Sedang (2/3)
    1, -- C4: <50 KK (1/3)
    2, -- C5: Rp 5-15 Jt (R5 = 1/2 = 0.5)
    6500000,
    'Pemasangan gorong-gorong baru diameter 60 cm dan pembersihan sedimen lumpur parit.',
    now() - interval '12 hours'
  ),

  -- Evaluasi Data 6 -> V = 0.3083 (Rank #6)
  (
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000006',
    null,
    1, -- C1: Ringan (1/4 = 0.25)
    1, -- C2: Gang Lingkungan Kecil (1/3)
    1, -- C3: Rendah (1/3)
    1, -- C4: <50 KK (1/3)
    3, -- C5: > Rp 15 Jt (R5 = 1/3)
    16500000,
    'Kondisi becek musiman. Direkomendasikan penimbunan sirtu gotong royong swadaya sebelum diusulkan semenisasi permanen.',
    now() - interval '6 hours'
  )
on conflict (report_id) do update set
  c1_damage_level = excluded.c1_damage_level,
  c2_access_urgency = excluded.c2_access_urgency,
  c3_hazard_risk = excluded.c3_hazard_risk,
  c4_beneficiaries = excluded.c4_beneficiaries,
  c5_estimated_cost = excluded.c5_estimated_cost,
  verified_cost_rupiah = excluded.verified_cost_rupiah,
  verification_notes = excluded.verification_notes,
  verified_at = excluded.verified_at;

-- 4. VERIFIKASI PERANGKINGAN SAW DI SUPABASE
-- Jalankan query berikut untuk memastikan ranking 1 sampai 6 terbentuk sempurna:
select 
  priority_rank, 
  ticket_number, 
  title, 
  dusun, 
  saw_score, 
  status 
from public.v_saw_rankings 
order by priority_rank asc;
