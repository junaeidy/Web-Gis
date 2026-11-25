'use client';

import React from 'react';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { HeartHandshake, X, Users, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface BansosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPengaduanBansos: () => void;
}

export default function BansosModal({
  isOpen,
  onClose,
  onOpenPengaduanBansos,
}: BansosModalProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" zIndex="z-[9999]">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Bansos Online Desa Simandulang
              </h3>
              <p className="text-xs text-emerald-200">
                Pusat Informasi & Penyaluran Bantuan Sosial Warga
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700">
          {/* Program Bansos Aktif */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900">
              Program Bantuan Sosial Resmi di Desa Simandulang
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-900 text-xs block">
                  1. BLT Dana Desa (BLT-DD)
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Bantuan langsung tunai bersumber dari APBDes untuk keluarga miskin ekstrem, lansia tunggal, atau nelayan/petani terdampak bencana abrasi rob.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 text-xs block">
                  2. PKH & BPNT (Kemensos)
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Program Keluarga Harapan & Bantuan Sembako bersumber dari APBN Kemensos RI berbasis Data Terpadu Kesejahteraan Sosial (DTKS).
                </p>
              </div>
            </div>
          </div>

          {/* Kriteria Penerima BLT-DD */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Kriteria Penerima BLT Dana Desa Simandulang:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
              <li>Warga ber-KTP dan berdomisili sah di Desa Simandulang (Dusun I s/d V).</li>
              <li>Kehilangan mata pencaharian utama akibat kondisi pesisir / rob.</li>
              <li>Mempunyai anggota keluarga yang rentan sakit menahun atau disabilitas.</li>
              <li>Tidak sedang menerima bantuan ganda PKH atau BPNT.</li>
            </ul>
          </div>

          {/* Aksi Pengaduan Bansos */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Ada Warga Kurang Mampu Belum Terdata?</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Jika di lingkungan dusun Anda terdapat lansia tunggal atau keluarga sangat rentan yang belum terdata mendapatkan bantuan sosial, Anda dapat mengajukan usulan pengaduan langsung ke perangkat desa.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPengaduanBansos();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition shadow-xs mt-1"
            >
              <FileText className="w-3.5 h-3.5" />
              Ajukan Pengaduan / Usulan Bansos
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
