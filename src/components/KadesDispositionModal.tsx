'use client';

import React, { useState } from 'react';
import { KadesDecision, KadesDisposition, Report, SAWResult } from '@/types';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { X, FileCheck2, Building2 } from 'lucide-react';

interface KadesDispositionModalProps {
  report: Report | null;
  saw?: SAWResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (disposition: KadesDisposition) => void;
}

export default function KadesDispositionModal({
  report,
  saw,
  isOpen,
  onClose,
  onSubmit,
}: KadesDispositionModalProps) {
  const [decision, setDecision] = useState<KadesDecision>('disetujui_apbdes');
  const [budgetSource, setBudgetSource] = useState('Dana Desa (APBDes Bidang Pembangunan)');
  const [approvedBudget, setApprovedBudget] = useState(
    saw?.evaluation.verifiedCostRupiah || 10000000
  );
  const [notes, setNotes] = useState('');

  if (!report) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      decision,
      budgetSource,
      approvedBudget: Number(approvedBudget),
      notes: notes || 'Telah disetujui sesuai hasil musyawarah dan rekomendasi SAW.',
      decidedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl" zIndex="z-[9999]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-900 text-white">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              Lembar Disposisi Kepala Desa Simandulang
            </h3>
            <p className="text-xs text-emerald-200">
              Persetujuan Tindak Lanjut Infrastruktur Berdasarkan SPK SAW
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Ringkasan Skor SAW */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-slate-500 font-semibold">{report.ticketNumber} • {report.dusun}</span>
          {saw && (
            <span className="px-2 py-0.5 rounded font-bold bg-red-100 text-red-800">
              Prioritas Ke-{saw.rank} (Tingkat Mendesak: {(saw.score * 100).toFixed(0)}/100)
            </span>
          )}
        </div>
        <h4 className="font-bold text-slate-900 text-sm leading-snug">{report.title}</h4>
      </div>

      {/* Form Disposisi */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-800 mb-1">
            Keputusan Kepala Desa <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="kades_decision"
                value="disetujui_apbdes"
                checked={decision === 'disetujui_apbdes'}
                onChange={() => {
                  setDecision('disetujui_apbdes');
                  setBudgetSource('APBDes T.A. 2026 (Bidang Pembangunan & Infrastruktur)');
                }}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <div className="font-bold text-slate-900">Disetujui Masuk APBDes (Swakelola Desa)</div>
                <div className="text-[11px] text-slate-500">
                  Kewenangan desa penuh, dibiayai melalui Dana Desa reguler.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="kades_decision"
                value="tanggap_darurat"
                checked={decision === 'tanggap_darurat'}
                onChange={() => {
                  setDecision('tanggap_darurat');
                  setBudgetSource('Dana Tak Terduga / Tanggap Bencana Rob Desa');
                }}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <div className="font-bold text-emerald-800">Tanggap Darurat Segera (Siaga Rob / Bahaya)</div>
                <div className="text-[11px] text-slate-500">
                  Eksekusi cepat dalam 1-3 hari memakai alokasi keadaan darurat desa.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="kades_decision"
                value="diteruskan_kabupaten"
                checked={decision === 'diteruskan_kabupaten'}
                onChange={() => {
                  setDecision('diteruskan_kabupaten');
                  setBudgetSource('APBD Kabupaten Labuhanbatu Utara (Dinas PUPR)');
                }}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <div className="font-bold text-sky-800">Diteruskan ke Pemkab Labura (Dinas PUPR)</div>
                <div className="text-[11px] text-slate-500">
                  Ruas jalan/jembatan merupakan status jalan kabupaten/provinsi (Kewenangan Daerah).
                </div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="kades_decision"
                value="ditunda"
                checked={decision === 'ditunda'}
                onChange={() => {
                  setDecision('ditunda');
                  setBudgetSource('Menunggu Pembahasan Musrenbangdes Berikutnya');
                }}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <div className="font-bold text-amber-800">Ditunda Sementara / Dialihkan ke Musrenbangdes</div>
                <div className="text-[11px] text-slate-500">
                  Keterbatasan pagu anggaran tahun berjalan atau memerlukan survei ulang.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Sumber Anggaran
            </label>
            <input
              type="text"
              value={budgetSource}
              onChange={(e) => setBudgetSource(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Alokasi Pagu Anggaran (Rp)
            </label>
            <input
              type="number"
              value={approvedBudget}
              onChange={(e) => setApprovedBudget(Number(e.target.value))}
              step={500000}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-800 mb-1">
            Catatan & Instruksi Kepala Desa
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Segera koordinasikan dengan Kadus dan TPK desa agar pengerjaan selesai sebelum musim pasang perbani..."
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
          />
        </div>

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
            className="inline-flex items-center gap-1.5 px-5 py-2 font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition shadow-xs"
          >
            <FileCheck2 className="w-4 h-4" />
            Tetapkan Disposisi Kades
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
