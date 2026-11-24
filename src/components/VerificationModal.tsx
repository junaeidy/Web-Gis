'use client';

import React, { useState } from 'react';
import { Report, ReportEvaluation } from '@/types';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { X, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface VerificationModalProps {
  report: Report | null;
  allReports?: Report[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evaluation: Omit<ReportEvaluation, 'id' | 'verifiedAt'>) => void;
  onMarkDuplicate?: (reportId: string, originalTicket: string) => void;
}

export default function VerificationModal({
  report,
  allReports = [],
  isOpen,
  onClose,
  onSubmit,
  onMarkDuplicate,
}: VerificationModalProps) {
  const [c1, setC1] = useState<number>(3);
  const [c2, setC2] = useState<number>(2);
  const [c3, setC3] = useState<number>(2);
  const [c4, setC4] = useState<number>(2);
  const [c5, setC5] = useState<number>(2);
  const [costRupiah, setCostRupiah] = useState<number>(10000000);
  const [notes, setNotes] = useState<string>('');

  if (!report) return null;

  // Cek potensi laporan duplikat (kategori sama di dusun yang sama)
  const potentialDuplicates = allReports.filter(
    (r) =>
      r.id !== report.id &&
      r.infrastructureType === report.infrastructureType &&
      r.dusun === report.dusun &&
      r.status !== 'ditolak' &&
      r.status !== 'duplikat'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      reportId: report.id,
      c1DamageLevel: c1,
      c2AccessUrgency: c2,
      c3HazardRisk: c3,
      c4Beneficiaries: c4,
      c5EstimatedCost: c5,
      verifiedCostRupiah: Number(costRupiah),
      verificationNotes: notes || 'Telah diverifikasi sesuai survei lapangan perangkat desa.',
    });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl" zIndex="z-[9999]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-700" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Verifikasi Lapangan & Skoring SAW
            </h3>
            <p className="text-xs text-slate-500">
              Tiket: {report.ticketNumber} • {report.dusun}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Ringkasan Laporan & Deteksi Laporan Ganda */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-700 space-y-2">
        <div>
          <div className="font-semibold text-slate-950">{report.title}</div>
          <div className="line-clamp-2 text-slate-600 mt-0.5">{report.description}</div>
        </div>

        {/* Alert Pengecekan Laporan Ganda */}
        {potentialDuplicates.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Deteksi Laporan Serupa / Potensi Laporan Ganda:
            </div>
            <p className="text-[11px] text-amber-800 mt-1">
              Ditemukan {potentialDuplicates.length} laporan dengan kategori dan dusun yang sama:
            </p>
            <div className="mt-1 space-y-1">
              {potentialDuplicates.map((dup) => (
                <div
                  key={dup.id}
                  className="flex items-center justify-between bg-white/80 px-2 py-1 rounded border border-amber-200 text-[11px]"
                >
                  <span className="font-medium text-slate-800 truncate max-w-[280px]">
                    {dup.ticketNumber}: {dup.title}
                  </span>
                  {onMarkDuplicate && (
                    <button
                      type="button"
                      onClick={() => {
                        onMarkDuplicate(report.id, dup.ticketNumber);
                        onClose();
                      }}
                      className="text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded transition shrink-0"
                    >
                      Tandai Duplikat #{dup.ticketNumber}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Skoring SAW */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
        {/* C1: Tingkat Kerusakan Fisik */}
        <div>
          <label className="block font-semibold text-slate-800 mb-1">
            C1: Tingkat Kerusakan Fisik (Bobot 30% • Benefit)
          </label>
          <select
            value={c1}
            onChange={(e) => setC1(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value={1}>Nilai 1: Kerusakan Ringan (masih aman dilalui)</option>
            <option value={2}>Nilai 2: Kerusakan Sedang (lubang permukaan jalan/baut jembatan kendor)</option>
            <option value={3}>Nilai 3: Kerusakan Berat (amblas sebagian, kendaraan berat tidak bisa lewat)</option>
            <option value={4}>Nilai 4: Putus Total / Hancur (membahayakan keselamatan warga)</option>
          </select>
        </div>

        {/* C2: Nilai Strategis Akses */}
        <div>
          <label className="block font-semibold text-slate-800 mb-1">
            C2: Nilai Strategis Akses (Bobot 25% • Benefit)
          </label>
          <select
            value={c2}
            onChange={(e) => setC2(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value={1}>Nilai 1: Gang Lingkungan Pemukiman Lokal</option>
            <option value={2}>Nilai 2: Jalur Penghubung Antar-Dusun / Kebun Rakyat</option>
            <option value={3}>Nilai 3: Akses Utama Tangkahan Nelayan / Balai Desa / Sekolah / Faskes</option>
          </select>
        </div>

        {/* C3: Kerentanan Rob / Keselamatan */}
        <div>
          <label className="block font-semibold text-slate-800 mb-1">
            C3: Kerentanan Pasang Rob & Bahaya (Bobot 20% • Benefit)
          </label>
          <select
            value={c3}
            onChange={(e) => setC3(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value={1}>Nilai 1: Rendah (Bebas genangan rob pasang laut)</option>
            <option value={2}>Nilai 2: Sedang (Kadang tergenang pasang tinggi perbani)</option>
            <option value={3}>Nilai 3: Tinggi (Kerap terendam rob / rawan korban jatuh ke muara)</option>
          </select>
        </div>

        {/* C4: Jumlah Penerima Manfaat */}
        <div>
          <label className="block font-semibold text-slate-800 mb-1">
            C4: Volume Pengguna / KK Terdampak (Bobot 15% • Benefit)
          </label>
          <select
            value={c4}
            onChange={(e) => setC4(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value={1}>Nilai 1: Sedikit (&lt; 50 Kepala Keluarga)</option>
            <option value={2}>Nilai 2: Sedang (50 - 150 Kepala Keluarga)</option>
            <option value={3}>Nilai 3: Padat (&gt; 150 Kepala Keluarga / Armada Nelayan Ramai)</option>
          </select>
        </div>

        {/* C5: Estimasi Biaya */}
        <div>
          <label className="block font-semibold text-slate-800 mb-1">
            C5: Estimasi Biaya Penanganan Cepat (Bobot 10% • Cost)
          </label>
          <select
            value={c5}
            onChange={(e) => setC5(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value={1}>Nilai 1: &lt; Rp 5 Juta (Penanganan cepat tanggap darurat)</option>
            <option value={2}>Nilai 2: Rp 5 Juta - Rp 15 Juta (Perbaikan skala sedang)</option>
            <option value={3}>Nilai 3: &gt; Rp 15 Juta (Membutuhkan pagu APBDes besar / tender)</option>
          </select>
        </div>

        {/* Rincian Anggaran & Catatan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Estimasi Anggaran Riil (Rupiah)
            </label>
            <input
              type="number"
              value={costRupiah}
              onChange={(e) => setCostRupiah(Number(e.target.value))}
              step={500000}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Catatan Lapangan Verifikator
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Hasil survei lapangan..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simpan & Terbitkan Skor SAW
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
