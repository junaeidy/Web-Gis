import { Criteria, Report, ReportEvaluation, SAWResult } from '@/types';

export const DEFAULT_CRITERIA: Criteria[] = [
  {
    code: 'C1',
    name: 'Tingkat Kerusakan Fisik',
    attribute: 'benefit',
    weight: 0.30,
    scaleDescription: '1: Ringan, 2: Sedang, 3: Berat, 4: Putus Total / Hancur',
  },
  {
    code: 'C2',
    name: 'Nilai Strategis Akses',
    attribute: 'benefit',
    weight: 0.25,
    scaleDescription: '1: Gang Lingkungan, 2: Penghubung Dusun/Kebun, 3: Akses Utama Tangkahan Nelayan / Faskes',
  },
  {
    code: 'C3',
    name: 'Kerentanan Pasang Rob / Keselamatan',
    attribute: 'benefit',
    weight: 0.20,
    scaleDescription: '1: Rendah, 2: Sedang, 3: Tinggi / Kerap Terendam Rob & Berisiko Kecelakaan',
  },
  {
    code: 'C4',
    name: 'Volume Pengguna / KK Terdampak',
    attribute: 'benefit',
    weight: 0.15,
    scaleDescription: '1: <50 KK, 2: 50-150 KK, 3: >150 KK (Jalur Logistik Utama)',
  },
  {
    code: 'C5',
    name: 'Estimasi Biaya Penanganan',
    attribute: 'cost',
    weight: 0.10,
    scaleDescription: '1: < Rp 5 Jt, 2: Rp 5-15 Jt, 3: > Rp 15 Jt (Semakin murah semakin cepat dieksekusi)',
  },
];

export function calculateSAW(
  reports: Report[],
  evaluations: ReportEvaluation[],
  criteria: Criteria[] = DEFAULT_CRITERIA
): SAWResult[] {
  // Hanya proses laporan yang berstatus terverifikasi, dalam_pengerjaan, atau selesai yang memiliki data evaluasi
  const validPairs = evaluations
    .map((evaluation) => {
      const report = reports.find((r) => r.id === evaluation.reportId);
      return { report, evaluation };
    })
    .filter(
      (pair): pair is { report: Report; evaluation: ReportEvaluation } =>
        Boolean(pair.report) && pair.report!.status !== 'menunggu_verifikasi' && pair.report!.status !== 'ditolak'
    );

  if (validPairs.length === 0) {
    return [];
  }

  // 1. Ekstraksi Nilai Maksimum (Benefit) dan Minimum (Cost)
  const maxC1 = Math.max(...validPairs.map((p) => p.evaluation.c1DamageLevel), 1);
  const maxC2 = Math.max(...validPairs.map((p) => p.evaluation.c2AccessUrgency), 1);
  const maxC3 = Math.max(...validPairs.map((p) => p.evaluation.c3HazardRisk), 1);
  const maxC4 = Math.max(...validPairs.map((p) => p.evaluation.c4Beneficiaries), 1);
  const minC5 = Math.min(...validPairs.map((p) => p.evaluation.c5EstimatedCost), 1);

  // Cari bobot untuk tiap kriteria
  const w1 = criteria.find((c) => c.code === 'C1')?.weight ?? 0.30;
  const w2 = criteria.find((c) => c.code === 'C2')?.weight ?? 0.25;
  const w3 = criteria.find((c) => c.code === 'C3')?.weight ?? 0.20;
  const w4 = criteria.find((c) => c.code === 'C4')?.weight ?? 0.15;
  const w5 = criteria.find((c) => c.code === 'C5')?.weight ?? 0.10;

  // 2. Normalisasi Matriks (R) dan Perhitungan Nilai Preferensi (V)
  const results = validPairs.map(({ report, evaluation }) => {
    // Normalisasi Benefit: Nilai / Max
    const r1 = Number((evaluation.c1DamageLevel / maxC1).toFixed(4));
    const r2 = Number((evaluation.c2AccessUrgency / maxC2).toFixed(4));
    const r3 = Number((evaluation.c3HazardRisk / maxC3).toFixed(4));
    const r4 = Number((evaluation.c4Beneficiaries / maxC4).toFixed(4));

    // Normalisasi Cost: Min / Nilai
    const r5 = Number((minC5 / (evaluation.c5EstimatedCost || 1)).toFixed(4));

    // Nilai Preferensi V = sum(w_j * r_ij)
    const score = Number(
      (r1 * w1 + r2 * w2 + r3 * w3 + r4 * w4 + r5 * w5).toFixed(4)
    );

    return {
      reportId: report.id,
      report,
      evaluation,
      normalized: {
        c1: r1,
        c2: r2,
        c3: r3,
        c4: r4,
        c5: r5,
      },
      score,
      rank: 0, // diisi setelah sorting
    };
  });

  // 3. Urutkan berdasarkan Skor Preferensi tertinggi ke terendah
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Jika skor seri, prioritaskan kerusakan fisik C1 tertinggi
    return b.evaluation.c1DamageLevel - a.evaluation.c1DamageLevel;
  });

  // Berikan ranking
  return results.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
