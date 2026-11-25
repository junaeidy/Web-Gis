# Smart Desa: Pengembangan Layanan Digital Terintegrasi untuk Meningkatkan Akses Informasi dan Pelayanan Masyarakat

Platform digital terintegrasi untuk Desa Simandulang, Kecamatan Kualuh Leidong, Kabupaten Labuhanbatu Utara yang menggabungkan:
1. **Portal Hub 6 Layanan Digital Desa:** Tampilan utama ramah warga dengan akses langsung ke Administrasi Online (SKU, SKTM, Domisili, Pengantar KTP/KK), Pelayanan Pengaduan & Aspirasi, Perpajakan Online (PBB-P2 & APBDes), Bantuan Sosial (DTKS/BLT-DD), Pusat Bantuan Warga 24 Jam, dan Profil Potensi 5 Dusun Pesisir.
2. **Pusat Bantuan & Asisten Informasi Warga ("Tanya Desa"):** Layanan interaktif cerdas 24/7 yang menerima pertanyaan bebas warga seputar syarat administrasi surat, jam pelayanan balai desa, panduan bansos, mitigasi banjir pasang rob, hingga pengecekan status laporan tiket pengaduan secara instan.
3. **Layanan Pengaduan & Aspirasi Masyarakat:** Wadah aspirasi warga mencakup 6 kategori (Infrastruktur Desa, Kebersihan Lingkungan, Pelayanan Balai Desa, Bansos & BLT, Keamanan/Penerangan, dan Usulan Pembangunan) dilengkapi penanda lokasi peta serta fitur perlindungan identitas (lapor anonim).
4. **Peta Interaktif Desa & Panduan Arah:** Pemetaan sebaran laporan dan titik fasilitas penting di 5 Dusun wilayah pesisir muara Selat Malaka.
5. **Urutan Prioritas Penanganan Terbuka:** Penentuan skala urgensi perbaikan fasilitas desa secara adil, objektif, dan transparan tanpa unsur pilih kasih.

---

## 🏛️ Karakteristik Wilayah & Urgensi Kasus
Desa Simandulang terletak di kawasan pesisir muara Selat Malaka, Kecamatan Kualuh Leidong. Karakteristik wilayah meliputi:
- Sebagian besar masyarakat bermata pencaharian sebagai nelayan tangkap tradisional, pembudidaya tambak ikan/udang, serta petani kelapa dan sawit.
- Kawasan perumahan panggung pesisir dengan kerentanan tinggi terhadap pasang surut air laut (banjir rob), abrasi muara sungai, dan tanah rawa/gambut.
- Akses informasi administrasi kantor desa dan penanganan fasilitas fisik (jembatan kayu, tanggul rob, tangkahan nelayan) membutuhkan transparansi objektif dan kemudahan akses digital 24 jam bagi masyarakat.

---

## 🤖 Kecerdasan Buatan (AI) & Algoritma Internal

Sistem ini dirancang **100% mandiri tanpa ketergantungan LLM eksternal/API berbayar**, sehingga bebas biaya token, nol halusinasi (*zero hallucination*), dan dapat berjalan secara lokal/offline:

### 1. Asisten AI Interaktif "Tanya Desa AI" (Input Bebas Warga)
- **Text Preprocessing & Tokenization:** Pembersihan teks, *case-folding*, dan *Indonesian stopword filtering*.
- **Levenshtein Distance (Fuzzy Matching):** Toleransi kesalahan ketik (*typo*) warga saat memasukkan pertanyaan secara bebas.
- **TF-IDF Vectorizer & Cosine Similarity:** Menghitung derajat kemiripan antara pertanyaan warga dengan korpus basis pengetahuan desa seputar:
  - Syarat pengurusan administrasi surat: SKU (Usaha), SKTM (Tidak Mampu), Surat Keterangan Domisili, dan Pengantar KTP/KK.
  - Jam dan jadwal operasional Kantor Balai Desa di Dusun II.
  - Program bantuan sosial: BLT Dana Desa (BLT-DD), PKH, dan kriteria DTKS.
  - Panduan mitigasi dan tanggap darurat banjir pasang surut rob.
- **Rule-Based Inference Engine (Koneksi Data Live):**
  - Mampu mendeteksi nomor tiket laporan (contoh: `#INF-001`, `INF-002`) dan menampilkan status penanganan terkini.
  - Mampu mendeteksi nama wilayah (*Dusun I s/d V*) dan menyajikan rekap perbaikan di dusun tersebut secara instan.
  - Mampu menjelaskan urutan prioritas rekomendasi perbaikan desa.

### 2. Algoritma SPK Simple Additive Weighting (SAW)
Menghitung nilai preferensi ($V_i$) secara objektif dari matriks ternormalisasi ($R$) dan bobot kriteria ($W$):

| Kode | Kriteria Penilaian | Sifat (Atribut) | Bobot ($W$) | Keterangan Skala |
| :--- | :--- | :--- | :--- | :--- |
| **$C_1$** | Tingkat Kerusakan Fisik | **Benefit** | **30% (0.30)** | 1: Ringan, 2: Sedang, 3: Berat, 4: Putus Total/Hancur |
| **$C_2$** | Nilai Strategis Akses | **Benefit** | **25% (0.25)** | 1: Gang Lingkungan, 2: Antar-Dusun/Kebun, 3: Jalan Utama/Tangkahan Nelayan/Faskes |
| **$C_3$** | Kerentanan Rob & Bahaya | **Benefit** | **20% (0.20)** | 1: Rendah, 2: Sedang, 3: Tinggi / Kerap Terendam Rob |
| **$C_4$** | Volume Pengguna / KK | **Benefit** | **15% (0.15)** | 1: <50 KK, 2: 50-150 KK, 3: >150 KK (Jalur Logistik Utama) |
| **$C_5$** | Estimasi Biaya Penanganan | **Cost** | **10% (0.10)** | 1: < Rp 5 Jt, 2: Rp 5-15 Jt, 3: > Rp 15 Jt (Semakin murah, semakin cepat dieksekusi) |

*Total Bobot $\sum W = 1.00$ (100%)*

---

## 🚀 Fitur Utama Layanan Digital Terintegrasi

1. **Widget Asisten AI 24 Jam ("Tanya Desa AI"):**
   - Warga dapat mengetik bebas pertanyaan apa saja tanpa dipaksa tombol template.
   - Jawaban dilengkapi kartu aksi langsung (*deep-link action buttons*) untuk membuka peta, form lapor, atau tabel SAW.
2. **Peta Spasial Interaktif (GIS Leaflet):**
   - Pemetaan titik kondisi fasilitas di 5 Dusun pesisir (Simandulang Pantai, Balai Desa, Sei Puyuh, Dusun Gori, Tambak & Rawa).
   - Penandaan warna pin interaktif sesuai status dan ranking SAW.
3. **Formulir Lapor Kerusakan Fasilitas (Crowdsourcing):**
   - Geotagging otomatis melalui sensor GPS browser/HP dan upload foto kondisi fisik.
4. **Alur Verifikasi Perangkat Desa & Disposisi Kepala Desa:**
   - Validasi lapangan untuk mencegah laporan duplikat/palsu.
   - Penerbitan disposisi APBDes, tanggap darurat, atau rekomendasi ke tingkat kabupaten.
5. **Role Switcher Demo (Siap Presentasi / Ujian Sidang):**
   - Berpindah peran seketika antara **Warga**, **Perangkat Desa**, dan **Kepala Desa**.

---

## 🛠️ Tech Stack & Prinsip Desain

- **Framework:** Next.js 16 (App Router) + TypeScript + React 19
- **Kecerdasan Buatan:** In-House NLP Engine (TF-IDF, Cosine Similarity, Levenshtein Distance, Rule-Based)
- **SPK Engine:** Algoritma Simple Additive Weighting (SAW)
- **Styling:** Tailwind CSS (Konsep *High-Contrast Maritime & Rural Design*)
- **GIS Engine:** Leaflet + OpenStreetMap + GeoJSON Boundary
- **Icons:** Lucide React
- **Database Backend:** Supabase (PostgreSQL 15+) dengan fallback otomatis data lokal
- **Hosting:** Siap deploy 1-klik gratis di **Vercel**

---

## 💻 Cara Menjalankan Project

### 1. Jalankan di Lokal (Development):
```bash
npm install
npm run dev
```
Buka browser di `http://localhost:3000`.

### 2. Setup Supabase (Opsional untuk Live Cloud Database):
1. Buka dashboard [Supabase](https://supabase.com) dan buat project baru.
2. Buka menu **SQL Editor**, salin dan jalankan seluruh isi file `supabase/schema.sql`.
3. Buat file `.env.local` dan isi kredensial:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Deploy Gratis ke Vercel:
1. Push repository ini ke GitHub.
2. Impor ke Vercel dan klik **Deploy**. Website langsung aktif dengan HTTPS gratis!
