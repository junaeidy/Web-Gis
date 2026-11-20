# Web-GIS & SPK Prioritas Infrastruktur Desa Teluk Pulai Luar

Sistem Informasi Geografis (GIS) dan Sistem Pendukung Keputusan (SPK) berbasis metode **Simple Additive Weighting (SAW)** untuk pelaporan, verifikasi, dan rekomendasi urutan prioritas perbaikan infrastruktur di **Desa Teluk Pulai Luar**, Kecamatan Kualuh Leidong, Kabupaten Labuhanbatu Utara.

---

## 🏛️ Karakteristik Wilayah & Urgensi Kasus
Desa Teluk Pulai Luar terletak di kawasan pesisir muara Selat Malaka. Karakteristik wilayah meliputi:
- Sebagian besar masyarakat bermata pencaharian sebagai nelayan dan petani kebun kelapa/sawit.
- Kerentanan tinggi terhadap pasang surut air laut (rob), abrasi muara sungai, dan tanah gambut.
- Infrastruktur seperti jembatan kayu penghubung anak sungai, tanggul penahan rob, dan jalan poros desa sering mengalami kerusakan yang membutuhkan alokasi penanganan mendesak namun anggaran desa terbatas.

---

## 🚀 Fitur Utama Sistem

1. **Peta Spasial Interaktif (GIS Leaflet):**
   - Pemetaan titik kerusakan infrastruktur di 5 Dusun (Dusun I s/d Dusun V).
   - Layer poligon batas administrasi Desa Teluk Pulai Luar.
   - Penandaan warna pin interaktif sesuai status dan ranking prioritas SAW (#1 Merah, #2-#3 Oranye, #4+ Biru, Kuning untuk Menunggu Verifikasi).
2. **Formulir Lapor Kerusakan Warga (Crowdsourcing):**
   - Geotagging otomatis melalui sensor GPS browser/perangkat pintar.
   - Pilihan titik langsung dengan mengklik peta.
   - Upload foto bukti dan deskripsi dampak.
3. **Panel Verifikasi Perangkat Desa:**
   - Validasi data lapangan untuk mencegah laporan palsu/subjektif.
   - Penilaian kriteria objektif $C_1$ sampai $C_5$.
   - Input estimasi biaya perbaikan dan catatan teknis lapangan.
4. **Dashboard Eksekutif Kepala Desa & Algoritma SAW:**
   - Kalkulasi otomatis nilai preferensi $V_i$ dari yang tertinggi ke terendah.
   - Modal Transparansi Matematis yang menampilkan Matriks Keputusan ($X$), Matriks Normalisasi ($R$), dan Pembuktian Skor ($V$).
5. **Role Switcher Demo (Siap Ujian / Presentasi Sidang):**
   - Berpindah peran seketika antara **Warga**, **Perangkat Desa**, dan **Kepala Desa** tanpa hambatan autentikasi saat presentasi.

---

## 📐 Kriteria & Bobot Metode SAW

| Kode | Kriteria Penilaian | Sifat (Atribut) | Bobot ($W$) | Keterangan Skala |
| :--- | :--- | :--- | :--- | :--- |
| **$C_1$** | Tingkat Kerusakan Fisik | **Benefit** | **30% (0.30)** | 1: Ringan, 2: Sedang, 3: Berat, 4: Putus Total/Hancur |
| **$C_2$** | Nilai Strategis Akses | **Benefit** | **25% (0.25)** | 1: Gang Lingkungan, 2: Antar-Dusun/Kebun, 3: Jalan Utama/Tangkahan Nelayan/Faskes |
| **$C_3$** | Kerentanan Rob & Bahaya | **Benefit** | **20% (0.20)** | 1: Rendah, 2: Sedang, 3: Tinggi / Kerap Terendam Rob |
| **$C_4$** | Volume Pengguna / KK | **Benefit** | **15% (0.15)** | 1: <50 KK, 2: 50-150 KK, 3: >150 KK (Jalur Logistik Utama) |
| **$C_5$** | Estimasi Biaya Penanganan | **Cost** | **10% (0.10)** | 1: < Rp 5 Jt, 2: Rp 5-15 Jt, 3: > Rp 15 Jt (Semakin murah, semakin cepat dieksekusi) |

*Total Bobot $\sum W = 1.00$ (100%)*

---

## 🛠️ Tech Stack & Prinsip Desain

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS (Konsep *Anti-Slop*: Tipografi kontras tinggi, palet warna bertema maritim & pedesaan tanpa gradien ungu buatan AI)
- **GIS Engine:** Leaflet + OpenStreetMap + GeoJSON Boundary
- **Icons:** Lucide React
- **Database Backend:** Supabase (PostgreSQL 15+)
- **Hosting:** Siap deploy 1-klik gratis di **Vercel**

---

## 💻 Cara Menjalankan Project

### 1. Jalankan di Lokal (Development):
```bash
npm install
npm run dev
```
Buka browser di `http://localhost:3000`.

### 2. Setup Supabase (Opsional untuk Live Database):
1. Buka dashboard [Supabase](https://supabase.com) dan buat project baru.
2. Buka menu **SQL Editor**, salin dan jalankan seluruh isi file `supabase/schema.sql`.
3. Buat file `.env.local` dan isi kredensial:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Deploy Gratis ke Vercel untuk Presentasi:
1. Push repository ini ke GitHub.
2. Buka [Vercel](https://vercel.com) dan impor repository tersebut.
3. Klik **Deploy**. Website langsung aktif dengan domain HTTPS gratis!
