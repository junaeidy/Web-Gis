import { Report, SAWResult } from '@/types';

// ==============================================================================
// 1. TEXT PREPROCESSING & NLP UTILITIES (ALGORITMA MURNI INTERNAL)
// ==============================================================================

const INDONESIAN_STOPWORDS = new Set([
  'yang', 'untuk', 'pada', 'ke', 'para', 'namun', 'menurut', 'antara', 'dia', 'dua',
  'ia', 'seperti', 'jika', 'sehingga', 'kembali', 'dan', 'ini', 'karena', 'oleh',
  'saat', 'harus', 'kurang', 'saja', 'bisa', 'dapat', 'adalah', 'yaitu', 'ada',
  'saya', 'kami', 'kita', 'mereka', 'kamu', 'anda', 'dong', 'sih', 'ya', 'kah',
  'apa', 'apakah', 'bagaimana', 'dimana', 'kapan', 'siapa', 'kenapa', 'mengapa',
  'tolong', 'bantu', 'mau', 'ingin', 'tanya', 'mohon', 'info', 'tentang', 'hal',
]);

/**
 * Pembersihan teks: Case Folding, pembersihan tanda baca, tokenisasi kata
 */
export function tokenizeAndClean(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1);
}

/**
 * Filter stopword untuk ekstraksi kata kunci bermakna
 */
export function extractKeywords(text: string): string[] {
  const tokens = tokenizeAndClean(text);
  const filtered = tokens.filter((t) => !INDONESIAN_STOPWORDS.has(t));
  return filtered.length > 0 ? filtered : tokens;
}

/**
 * Algoritma Levenshtein Distance untuk menghitung jarak perbedaan kata (toleransi typo)
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Fuzzy word matching: Cek apakah kata memiliki kemiripan dengan target (maksimal 1-2 typo)
 */
export function fuzzyMatch(word: string, target: string, threshold = 0.75): boolean {
  if (word === target) return true;
  if (word.includes(target) || target.includes(word)) return true;
  const maxLen = Math.max(word.length, target.length);
  if (maxLen === 0) return true;
  const dist = levenshteinDistance(word, target);
  const similarity = 1 - dist / maxLen;
  return similarity >= threshold;
}

// ==============================================================================
// 2. KNOWLEDGE BASE DESA SIMANDULANG (DOKUMEN DASAR INFORMASI DESA TANPA EMOJI)
// ==============================================================================

export interface KnowledgeItem {
  id: string;
  category: 'surat' | 'layanan' | 'bansos' | 'rob' | 'lapor' | 'saw' | 'profil';
  title: string;
  keywords: string[];
  answer: string;
  actionType?: 'open_report' | 'open_saw' | 'open_map';
  actionLabel?: string;
}

export const DESA_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // --- LAYANAN SURAT ADMINISTRASI DESA ---
  {
    id: 'sku',
    category: 'surat',
    title: 'Surat Keterangan Usaha (SKU)',
    keywords: ['sku', 'usaha', 'dagang', 'toko', 'warung', 'tambak', 'nelayan', 'kredit', 'bank', 'umkm'],
    answer: `**Syarat Pembuatan Surat Keterangan Usaha (SKU):**
1. Fotokopi KTP Pemohon (warga Desa Simandulang).
2. Fotokopi Kartu Keluarga (KK).
3. Surat Pengantar dari Kepala Dusun setempat (Dusun I sampai Dusun V).
4. Foto tempat atau lokasi usaha (warung, tambak udang/ikan, kebun kelapa/sawit, perahu nelayan).
5. Keterangan jenis usaha dan lama usaha berjalan.

**Proses Pengurusan:**
Dapat diajukan langsung ke Kantor Balai Desa Simandulang (Dusun II). Waktu pengerjaan rata-rata **1 hari kerja**, tanpa dipungut biaya (Gratis).`,
  },
  {
    id: 'sktm',
    category: 'surat',
    title: 'Surat Keterangan Tidak Mampu (SKTM)',
    keywords: ['sktm', 'tidak', 'mampu', 'miskin', 'beasiswa', 'sekolah', 'kuliah', 'keringanan', 'bpjs', 'kip'],
    answer: `**Syarat Pembuatan Surat Keterangan Tidak Mampu (SKTM):**
1. Fotokopi KTP dan KK orang tua atau kepala keluarga.
2. Surat Pengantar RT/Kepala Dusun yang menyatakan kondisi ekonomi keluarga.
3. Surat pernyataan penghasilan orang tua bermaterai (jika diminta lembaga terkait).
4. Kartu Pelajar/Mahasiswa atau Surat Keterangan Sekolah/Kampus (khusus permohonan beasiswa atau bantuan pendidikan).

**Catatan Verifikasi:**
Petugas desa akan memverifikasi kesesuaian data dengan Data Terpadu Kesejahteraan Sosial (DTKS) desa. Pelayanan gratis di Balai Desa Simandulang.`,
  },
  {
    id: 'domisili',
    category: 'surat',
    title: 'Surat Keterangan Domisili',
    keywords: ['domisili', 'tinggal', 'tempat', 'menetap', 'alamat', 'pindah', 'keterangan'],
    answer: `**Syarat Surat Keterangan Domisili (Warga / Tempat Usaha):**
1. Fotokopi KTP dan KK pemohon.
2. Surat Pengantar dari Kepala Dusun setempat.
3. Bukti kepemilikan atau bukti sewa tempat tinggal di Desa Simandulang.
4. Pasfoto ukuran 3x4 (1 lembar).

**Estimasi Waktu:**
Selesai dalam 1 hari kerja di Kantor Balai Desa Simandulang.`,
  },
  {
    id: 'ktp_kk',
    category: 'surat',
    title: 'Surat Pengantar KTP-el / Kartu Keluarga (KK)',
    keywords: ['ktp', 'kk', 'kartu', 'keluarga', 'pengantar', 'nik', 'ektp', 'baru', 'hilang'],
    answer: `**Syarat Surat Pengantar KTP / KK Baru / Perubahan:**
1. Pengantar dari Kepala Dusun setempat.
2. Untuk KTP pemula: Fotokopi KK dan Akta Kelahiran (usia minimal 17 tahun).
3. Untuk KTP atau KK hilang: Surat Keterangan Kehilangan dari Polsek terdekat.
4. Untuk penambahan anggota KK: Surat Nikah dan Surat Keterangan Lahir.

**Alur Pengurusan:**
Surat pengantar dari Balai Desa Simandulang selanjutnya dibawa ke Kantor Camat Kualuh Leidong atau Disdukcapil Labuhanbatu Utara.`,
  },
  {
    id: 'kematian_kelahiran',
    category: 'surat',
    title: 'Surat Keterangan Kelahiran / Kematian',
    keywords: ['kematian', 'meninggal', 'kelahiran', 'lahir', 'akta', 'bayi'],
    answer: `**Syarat Surat Keterangan Kelahiran / Kematian:**
- **Kelahiran:** Surat keterangan lahir dari bidan atau fasilitas kesehatan, fotokopi KTP kedua orang tua, fotokopi KK, dan fotokopi buku nikah.
- **Kematian:** Surat pengantar Kadus, fotokopi KTP almarhum/almarhumah, fotokopi KK, dan fotokopi KTP pelapor atau ahli waris.

Petugas desa akan menerbitkan surat keterangan resmi untuk kebutuhan penerbitan Akta di Disdukcapil.`,
  },

  // --- JADWAL & LOKASI PELAYANAN KANTOR DESA ---
  {
    id: 'jadwal_kantor',
    category: 'layanan',
    title: 'Jam & Jadwal Pelayanan Kantor Desa',
    keywords: ['jadwal', 'jam', 'buka', 'tutup', 'kantor', 'balai', 'hari', 'operasional', 'kerja', 'kades', 'perangkat'],
    answer: `**Jadwal Pelayanan Kantor Balai Desa Simandulang:**
- **Senin sampai Kamis:** Pukul 08.00 - 15.30 WIB (Waktu Istirahat 12.00 - 13.30 WIB)
- **Jumat:** Pukul 08.00 - 11.30 WIB dan 13.30 - 15.00 WIB
- **Sabtu, Minggu dan Hari Libur Nasional:** Kantor Tutup (Layanan darurat bencana pasang rob tetap siaga melalui Kepala Dusun).

**Lokasi Kantor:**
Balai Desa Simandulang, Dusun II (Pusat Balai Desa), Kecamatan Kualuh Leidong, Kabupaten Labuhanbatu Utara.`,
  },

  // --- PROGRAM BANTUAN SOSIAL (BANSOS) ---
  {
    id: 'bansos_blt',
    category: 'bansos',
    title: 'Informasi Bantuan Sosial (BLT Dana Desa & PKH)',
    keywords: ['bansos', 'blt', 'bantuan', 'dana', 'desa', 'pkh', 'bpnt', 'sembako', 'uang', 'dtks', 'penerima'],
    answer: `**Program Bantuan Sosial di Desa Simandulang:**
1. **BLT Dana Desa (BLT-DD):** Diprioritaskan untuk keluarga miskin ekstrem, lansia tunggal, penyandang disabilitas, atau warga yang kehilangan mata pencaharian nelayan/tani akibat bencana pesisir.
2. **PKH dan BPNT:** Bersumber dari Kementerian Sosial RI berdasarkan basis data DTKS.

**Cara Pengusulan:**
Warga yang belum terdaftar dapat melapor kepada Kepala Dusun masing-masing untuk diajukan dalam forum Musyawarah Desa (Musdes) penetapan penerima bantuan.`,
  },

  // --- PENANGANAN BANJIR ROB & MITIGASI PESISIR ---
  {
    id: 'rob_mitigasi',
    category: 'rob',
    title: 'Mitigasi Pasang Rob & Wilayah Pesisir',
    keywords: ['rob', 'banjir', 'pasang', 'laut', 'air', 'abrasi', 'tanggul', 'pesisir', 'muara', 'surut', 'tenggelam', 'bahaya'],
    answer: `**Panduan Tanggap Darurat Banjir Pasang Rob Desa Simandulang:**
1. **Wilayah Paling Rawan:** Dusun I (Simandulang Pantai) dan Dusun V (Tambak & Rawa).
2. **Waktu Pasang:** Puncak pasang sering terjadi pada fase bulan purnama atau bulan mati, air pasang naik antara pukul 10.00 - 14.00 WIB.
3. **Langkah Siaga:**
   - Amankan perahu nelayan pada tambatan muara yang kokoh.
   - Pindahkan perlengkapan elektronik dan dokumen keluarga ke bagian rumah panggung yang lebih tinggi.
   - Hindari melintasi jembatan kayu muara yang terendam air pasang karena licin dan arus deras.
   - Jika tanggul parit jebol, segera laporkan melalui sistem ini agar segera disurvei oleh perangkat desa.`,
    actionType: 'open_report',
    actionLabel: 'Laporkan Tanggul / Jembatan Rusak',
  },

  // --- LAYANAN PENGADUAN & ASPIRASI MASYARAKAT ---
  {
    id: 'pengaduan_masyarakat',
    category: 'lapor',
    title: 'Layanan Pengaduan & Aspirasi Masyarakat Desa',
    keywords: ['pengaduan', 'keluhan', 'aspirasi', 'lapor', 'aduan', 'mengadu', 'komplain', 'kritik', 'saran', 'pelayanan', 'sampah', 'bansos', 'cara'],
    answer: `**Layanan Pengaduan & Aspirasi Masyarakat Desa Simandulang:**
Warga dapat menyampaikan pengaduan atau aspirasi secara langsung melalui sistem ini untuk berbagai kategori:
1. **Fasilitas & Infrastruktur:** Jalan poros/gang rusak, jembatan lapuk, tanggul parit jebol, dan dermaga tangkahan nelayan.
2. **Kebersihan & Lingkungan:** Tumpukan sampah liar, drainase tersumbat, atau pencemaran saluran air.
3. **Pelayanan Kantor Balai Desa:** Keterlambatan pengurusan surat, kritik pelayanan, atau ketidaksesuaian berkas.
4. **Bantuan Sosial (Bansos / BLT):** Laporan warga yang belum terdata, ketepatan sasaran penerima bantuan.
5. **Keamanan & Fasilitas Umum:** Lampu penerangan jalan padam atau gangguan ketertiban dusun.
6. **Aspirasi Pembangunan:** Usulan program kerja warga untuk bahan Musrenbangdes.

**Cara Menyampaikan Pengaduan:**
1. Klik tombol **"+ Buat Pengaduan / Laporan"** di bagian atas halaman.
2. Pilih Kategori Pengaduan dan Wilayah Dusun Anda.
3. Tuliskan judul serta deskripsi keluhan secara jelas.
4. Anda dapat melampirkan foto bukti kondisi lapangan dan titik lokasi pada peta.
5. **Jaminan Privasi:** Warga dapat mencentang opsi **"Samarkan Identitas"** agar nama tidak ditampilkan kepada publik.`,
    actionType: 'open_report',
    actionLabel: 'Buat Pengaduan Sekarang',
  },

  // --- PROFIL 5 DUSUN DESA SIMANDULANG ---
  {
    id: 'profil_dusun',
    category: 'profil',
    title: 'Profil Wilayah 5 Dusun Desa Simandulang',
    keywords: ['dusun', 'wilayah', 'simandulang', 'pantai', 'gori', 'puyuh', 'balai', 'tambak', 'rawa', 'luas', 'peta'],
    answer: `**Karakteristik 5 Dusun di Desa Simandulang:**
- **Dusun I (Simandulang Pantai):** Pemukiman nelayan panggung, tangkahan perahu, sangat rentan abrasi dan pasang surut Selat Malaka.
- **Dusun II (Pusat Balai Desa):** Pusat pemerintahan desa, sekolah, balai pertemuan, dan fasilitas umum utama.
- **Dusun III (Sei Puyuh):** Kawasan perkebunan rakyat, jembatan penyeberangan anak sungai, dan jalur logistik hasil bumi.
- **Dusun IV (Dusun Gori):** Pemukiman warga, gang lingkungan penghubung antar-dusun.
- **Dusun V (Tambak & Rawa):** Sentra budidaya tambak udang/ikan dan parit drainase penahan banjir pasang rob.`,
    actionType: 'open_map',
    actionLabel: 'Tampilkan Peta Wilayah 5 Dusun',
  },
];

// ==============================================================================
// 3. TF-IDF VECTORIZER & COSINE SIMILARITY ENGINE (ALGORITMA INFORMATION RETRIEVAL)
// ==============================================================================

interface DocumentVector {
  item: KnowledgeItem;
  termFrequency: Map<string, number>;
  vectorMagnitude: number;
}

class TfIdfKnowledgeEngine {
  private documents: KnowledgeItem[] = [];
  private idfMap: Map<string, number> = new Map();
  private docVectors: DocumentVector[] = [];

  constructor(items: KnowledgeItem[]) {
    this.documents = items;
    this.buildIndex();
  }

  private buildIndex() {
    const totalDocs = this.documents.length;
    const docFrequency: Map<string, number> = new Map();

    const docTokensList = this.documents.map((doc) => {
      const combinedText = `${doc.title} ${doc.keywords.join(' ')} ${doc.keywords.join(' ')} ${doc.answer}`;
      const tokens = extractKeywords(combinedText);
      const uniqueTokens = new Set(tokens);
      for (const token of uniqueTokens) {
        docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
      }
      return { doc, tokens };
    });

    for (const [term, freq] of docFrequency.entries()) {
      this.idfMap.set(term, Math.log(1 + totalDocs / freq));
    }

    this.docVectors = docTokensList.map(({ doc, tokens }) => {
      const tfMap: Map<string, number> = new Map();
      for (const t of tokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }

      let sumSquared = 0;
      for (const [term, count] of tfMap.entries()) {
        const tf = count / tokens.length;
        const idf = this.idfMap.get(term) || 1;
        const weight = tf * idf;
        sumSquared += weight * weight;
      }

      return {
        item: doc,
        termFrequency: tfMap,
        vectorMagnitude: Math.sqrt(sumSquared) || 1,
      };
    });
  }

  public search(query: string): { item: KnowledgeItem; score: number } | null {
    const queryTokens = extractKeywords(query);
    if (queryTokens.length === 0) return null;

    const queryTf: Map<string, number> = new Map();
    for (const t of queryTokens) {
      queryTf.set(t, (queryTf.get(t) || 0) + 1);
    }

    let queryMagnitudeSquared = 0;
    const queryWeights: Map<string, number> = new Map();

    for (const [term, count] of queryTf.entries()) {
      const tf = count / queryTokens.length;
      const idf = this.idfMap.get(term) || Math.log(1 + this.documents.length);
      const weight = tf * idf;
      queryWeights.set(term, weight);
      queryMagnitudeSquared += weight * weight;
    }

    const queryMagnitude = Math.sqrt(queryMagnitudeSquared) || 1;

    let bestDoc: KnowledgeItem | null = null;
    let maxCosineScore = 0;

    for (const docVec of this.docVectors) {
      let dotProduct = 0;

      for (const [qTerm, qWeight] of queryWeights.entries()) {
        let matchedCount = docVec.termFrequency.get(qTerm) || 0;

        if (matchedCount === 0 && qTerm.length >= 4) {
          for (const [dTerm, dCount] of docVec.termFrequency.entries()) {
            if (fuzzyMatch(qTerm, dTerm, 0.8)) {
              matchedCount = dCount;
              break;
            }
          }
        }

        if (matchedCount > 0) {
          const docTf = matchedCount / docVec.item.keywords.length;
          const idf = this.idfMap.get(qTerm) || 1;
          const docWeight = docTf * idf;
          dotProduct += qWeight * docWeight;
        }
      }

      let keywordBonus = 0;
      for (const kw of docVec.item.keywords) {
        for (const qt of queryTokens) {
          if (fuzzyMatch(qt, kw, 0.8)) {
            keywordBonus += 0.15;
            break;
          }
        }
      }

      const cosineSimilarity = dotProduct / (queryMagnitude * docVec.vectorMagnitude);
      const finalScore = cosineSimilarity + keywordBonus;

      if (finalScore > maxCosineScore) {
        maxCosineScore = finalScore;
        bestDoc = docVec.item;
      }
    }

    if (maxCosineScore > 0.12 && bestDoc) {
      return { item: bestDoc, score: maxCosineScore };
    }

    return null;
  }
}

const knowledgeEngine = new TfIdfKnowledgeEngine(DESA_KNOWLEDGE_BASE);

// ==============================================================================
// 4. LIVE INFERENCE ENGINE (KONEKSI REAL-TIME KE DATA SISTEM LAPANGAN)
// ==============================================================================

export interface AssistantResponse {
  answer: string;
  source: 'database_live' | 'knowledge_base' | 'general_guide';
  actionType?: 'open_report' | 'open_saw' | 'open_map' | 'focus_report';
  actionLabel?: string;
  targetReportId?: string;
}

/**
 * Pemroses Pesan Utama: Menganalisis teks bebas dari warga, mendeteksi entitas (tiket, dusun, kades),
 * dan mencocokkan dengan data laporan nyata serta basis pengetahuan desa.
 */
export function processUserQuery(
  rawQuery: string,
  reports: Report[],
  sawResults: SAWResult[]
): AssistantResponse {
  const query = rawQuery.trim();
  if (!query) {
    return {
      answer: 'Halo! Saya Asisten Pintar Pelayanan Desa Simandulang. Silakan ketikkan pertanyaan Anda seputar syarat surat administrasi, jadwal balai desa, bansos, mitigasi pasang rob, atau tanyakan status perbaikan infrastruktur di dusun Anda.',
      source: 'general_guide',
    };
  }

  const queryLower = query.toLowerCase();

  // ----------------------------------------------------------------------------
  // DETEKSI ENTITAS 1: PENGECEKAN NOMOR TIKET SPESIFIK (e.g., #SMD-2026-001, SMD-001, 001)
  // ----------------------------------------------------------------------------
  let matchedReport: Report | undefined = undefined;

  // 1. Cek kecocokan langsung dengan nomor tiket yang tersimpan di database
  for (const rep of reports) {
    const rawTicket = rep.ticketNumber.toLowerCase(); // e.g. "smd-2026-001"
    if (queryLower.includes(rawTicket)) {
      matchedReport = rep;
      break;
    }
  }

  // 2. Jika belum cocok langsung, periksa pola tiket umum (#SMD-..., tiket #..., SMD-...)
  if (!matchedReport) {
    // Cari pola tiket di dalam query
    const ticketPattern = /(?:tiket\s*#?|#|smd-?)\s*([a-z0-9-]+)/i;
    const ticketMatch = query.match(ticketPattern);

    if (ticketMatch) {
      const extractedKey = ticketMatch[1].toLowerCase().replace(/^#/, '');

      matchedReport = reports.find((r) => {
        const t = r.ticketNumber.toLowerCase();
        return (
          t === extractedKey ||
          t.includes(extractedKey) ||
          t.endsWith(extractedKey) ||
          t.replace(/[^a-z0-9]/g, '').includes(extractedKey.replace(/[^a-z0-9]/g, ''))
        );
      });

      // Jika pengguna secara spesifik mencari tiket tapi tidak ada di database
      if (!matchedReport && (queryLower.includes('tiket') || queryLower.includes('#') || queryLower.includes('smd-'))) {
        return {
          answer: `Nomor tiket yang Anda tanyakan (${ticketMatch[0].trim()}) tidak ditemukan dalam daftar laporan Desa Simandulang.\n\nPastikan format nomor tiket sesuai (contoh: **#SMD-2026-001** atau **SMD-2026-002**), atau Anda dapat melihat daftar seluruh laporan pada tab Urutan Prioritas.`,
          source: 'database_live',
          actionType: 'open_saw',
          actionLabel: 'Cek Antrean Semua Laporan',
        };
      }
    }
  }

  // JIKA TIKET DITEMUKAN: Tampilkan data real-time dari database
  if (matchedReport) {
    const saw = sawResults.find((s) => s.reportId === matchedReport!.id);
    const statusIndo = matchedReport.status.replace(/_/g, ' ').toUpperCase();
    
    let kadesText = 'Belum ada disposisi anggaran.';
    if (matchedReport.disposition) {
      kadesText = `Telah disetujui Kepala Desa (${matchedReport.disposition.decision.replace(/_/g, ' ')}) dengan alokasi APBDes **Rp ${(matchedReport.disposition.approvedBudget || 0).toLocaleString('id-ID')}**. Catatan: "${matchedReport.disposition.notes}"`;
    }

    const sawRankText = saw
      ? `Prioritas #${saw.rank} (Berdasarkan tingkat urgensi dan dampak kebutuhan masyarakat)`
      : 'Sedang dalam antrean peninjauan tingkat urgensi.';

    return {
      answer: `**Data Status Laporan ${matchedReport.ticketNumber}:**
- **Judul Fasilitas / Aduan:** ${matchedReport.title}
- **Wilayah Dusun:** ${matchedReport.dusun}
- **Status Alur Penanganan:** **${statusIndo}**
- **Dukungan Warga:** ${matchedReport.upvotes || 0} dukungan suara
- **Urutan Prioritas Penanganan:** ${sawRankText}
- **Keputusan Kepala Desa:** ${kadesText}
${matchedReport.assignedOfficer ? `- **Petugas Lapangan:** Ditugaskan kepada **${matchedReport.assignedOfficer}** (${matchedReport.assignedDepartment || 'Tim Teknis'}).` : ''}
${matchedReport.completionNotes ? `- **Catatan Penyelesaian:** ${matchedReport.completionNotes}` : ''}

Anda dapat melihat posisi titik laporan ini langsung pada peta desa.`,
      source: 'database_live',
      actionType: 'focus_report',
      actionLabel: `Lihat Titik ${matchedReport.ticketNumber} di Peta`,
      targetReportId: matchedReport.id,
    };
  }

  // ----------------------------------------------------------------------------
  // DETEKSI ENTITAS 2: PERTANYAAN TENTANG STATUS PERBAIKAN DI WILAYAH DUSUN TERTENTU
  // ----------------------------------------------------------------------------
  const dusunMatch = queryLower.match(/dusun\s*([1-5]|i{1,3}|iv|v)\b/);
  const isAskingStatus = queryLower.includes('status') || queryLower.includes('perbaikan') ||
    queryLower.includes('laporan') || queryLower.includes('rusak') || queryLower.includes('kondisi') || queryLower.includes('ada apa');

  if (dusunMatch && isAskingStatus) {
    const rawNum = dusunMatch[1];
    let normDusun = 'Dusun I';
    if (rawNum === '1' || rawNum === 'i') normDusun = 'Dusun I';
    if (rawNum === '2' || rawNum === 'ii') normDusun = 'Dusun II';
    if (rawNum === '3' || rawNum === 'iii') normDusun = 'Dusun III';
    if (rawNum === '4' || rawNum === 'iv') normDusun = 'Dusun IV';
    if (rawNum === '5' || rawNum === 'v') normDusun = 'Dusun V';

    const dusunReports = reports.filter((r) => r.dusun === normDusun);

    if (dusunReports.length === 0) {
      return {
        answer: `Saat ini belum ada laporan kerusakan infrastruktur yang tercatat di **${normDusun}**. Jika terdapat jalan, jembatan, tangkahan nelayan, atau tanggul rob yang mengalami kerusakan di wilayah ini, warga dipersilakan mengajukan laporan secara mandiri.`,
        source: 'database_live',
        actionType: 'open_report',
        actionLabel: `Laporkan Kerusakan di ${normDusun}`,
      };
    }

    const inProgress = dusunReports.filter((r) => r.status === 'dalam_pengerjaan');
    const completed = dusunReports.filter((r) => r.status === 'selesai');
    const waiting = dusunReports.filter((r) => r.status === 'menunggu_verifikasi');

    let summaryText = `**Rekapitulasi Laporan di ${normDusun} (Total ${dusunReports.length} Titik):**\n`;
    summaryText += `- Sedang dalam pengerjaan: **${inProgress.length}** titik\n`;
    summaryText += `- Tuntas diperbaiki: **${completed.length}** titik\n`;
    summaryText += `- Menunggu survei perangkat desa: **${waiting.length}** titik\n\n`;
    summaryText += `**Fasilitas di ${normDusun}:**\n`;

    dusunReports.slice(0, 3).forEach((r, idx) => {
      const saw = sawResults.find((s) => s.reportId === r.id);
      const rankBadge = saw ? `[Prioritas #${saw.rank}]` : `[Menunggu Survei]`;
      summaryText += `${idx + 1}. **${r.title}** (${r.ticketNumber}) - ${rankBadge} - Status: *${r.status.replace(/_/g, ' ')}*\n`;
    });

    return {
      answer: summaryText,
      source: 'database_live',
      actionType: 'open_map',
      actionLabel: `Lihat Sebaran Titik ${normDusun} di Peta`,
    };
  }

  // ----------------------------------------------------------------------------
  // DETEKSI ENTITAS 3: SIAPA PRIORITAS #1 ATAU PRIORITAS TERTINGGI SAAT INI
  // ----------------------------------------------------------------------------
  if (
    (queryLower.includes('prioritas') || queryLower.includes('peringkat') || queryLower.includes('tertinggi') || queryLower.includes('utama')) &&
    (queryLower.includes('siapa') || queryLower.includes('mana') || queryLower.includes('nomor 1') || queryLower.includes('#1') || queryLower.includes('pertama'))
  ) {
    const topSaw = sawResults.find((s) => s.rank === 1);
    if (topSaw) {
      return {
        answer: `**Prioritas #1 Penanganan Desa Simandulang Saat Ini:**
- **Fasilitas / Aduan:** ${topSaw.report.title} (${topSaw.report.ticketNumber})
- **Lokasi Dusun:** ${topSaw.report.dusun}
- **Tingkat Urgensi:** Prioritas Utama (#1) berdasarkan tingkat kebutuhan dan dampak langsung bagi warga
- **Alasan Objektif:** Kerusakan fisik mencapai tingkat tertinggi, merupakan akses vital bagi masyarakat dan nelayan, serta berada di zona rawan pasang rob.
- **Status Alur:** ${topSaw.report.status.replace(/_/g, ' ').toUpperCase()}`,
        source: 'database_live',
        actionType: 'open_saw',
        actionLabel: 'Lihat Urutan Prioritas Penanganan',
        targetReportId: topSaw.report.id,
      };
    }
  }

  // ----------------------------------------------------------------------------
  // TAHAP 4: PENCARIAN KNOWLEDGE BASE MENGGUNAKAN ALGORITMA TF-IDF & COSINE SIMILARITY
  // ----------------------------------------------------------------------------
  const searchResult = knowledgeEngine.search(query);

  if (searchResult && searchResult.score >= 0.12) {
    const item = searchResult.item;
    return {
      answer: item.answer,
      source: 'knowledge_base',
      actionType: item.actionType,
      actionLabel: item.actionLabel,
    };
  }

  // ----------------------------------------------------------------------------
  // TAHAP 5: PANDUAN DEFAULT JIKA TIDAK DITEMUKAN PENCAPAIAN AMBANG BATAS SKOR
  // ----------------------------------------------------------------------------
  return {
    answer: `Maaf, saya belum menemukan jawaban yang tepat untuk pertanyaan tersebut.

Sebagai Asisten Pelayanan Desa Simandulang, Anda dapat menanyakan hal-hal berikut:
1. **Layanan Administrasi Surat:** Syarat pembuatan SKU, SKTM, Surat Domisili, atau Pengantar KTP/KK.
2. **Jam Kerja Kantor:** Jam operasional Balai Desa di Dusun II.
3. **Status Perbaikan & Laporan:** Ketikkan nomor tiket (contoh: **#SMD-2026-001**) atau ketik *status perbaikan di Dusun I*.
4. **Bantuan Sosial & Mitigasi Rob:** Info syarat BLT Dana Desa, PKH, atau panduan keselamatan pasang rob pesisir.

Silakan ketikkan kembali pertanyaan Anda dengan kata kunci yang lebih spesifik.`,
    source: 'general_guide',
  };
}
