'use client';

import React from 'react';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { Receipt, X, Landmark, Calculator, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';

interface PerpajakanModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAllocatedBudget: number;
}

export default function PerpajakanModal({
  isOpen,
  onClose,
  totalAllocatedBudget,
}: PerpajakanModalProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" zIndex="z-[9999]">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Perpajakan & Transparansi APBDes
              </h3>
              <p className="text-xs text-emerald-200">
                Pajak Bumi dan Bangunan (PBB-P2) & Realisasi Keuangan Desa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Card Transparansi APBDes Riil */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-700" />
                Alokasi Pembangunan & Penanganan Masalah
              </span>
              <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-semibold px-2 py-0.5 rounded">
                T.A. 2026
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-900">
              Rp {totalAllocatedBudget.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Total dana penanganan infrastruktur, tanggul rob, dan bantuan darurat yang telah disetujui Kepala Desa Simandulang bersumber dari Pendapatan Asli Desa (PADes), Dana Desa (DD), dan Bagi Hasil Pajak/Retribusi Daerah.
            </p>
          </div>

          {/* Informasi PBB-P2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-700" />
              Layanan PBB-P2 (Pajak Bumi & Bangunan)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Kolektif Balai Desa:</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Warga dapat menyerahkan SPPT PBB ke Kantor Balai Desa (Dusun II) melalui Kaur Keuangan pada hari kerja.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Pembayaran Bank / POS:</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Dapat disetorkan via Bank Sumut, Kantor POS Kualuh Leidong, ATM, atau QRIS Bank Sumut resmi Pemkab Labuhanbatu Utara.
                </p>
              </div>
            </div>
          </div>

          {/* Alur Pelayanan PBB */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-xs text-slate-800">
              Alur Pengajuan Mutasi / Pembaruan SPPT PBB Desa:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1">
              <li>Membawa fotokopi KTP, KK, dan bukti surat tanah / sertifikat ke Balai Desa.</li>
              <li>Petugas desa memeriksa luas tanah dan bangunan objek pajak di dusun setempat.</li>
              <li>Surat pengantar mutasi diterbitkan untuk diproses ke Bapenda Kabupaten Labuhanbatu Utara.</li>
            </ol>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
