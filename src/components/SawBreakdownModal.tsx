'use client';

import React from 'react';
import { SAWResult } from '@/types';
import { DEFAULT_CRITERIA } from '@/lib/saw';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { X, Calculator, HelpCircle } from 'lucide-react';

interface SawBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  sawResults: SAWResult[];
}

export default function SawBreakdownModal({
  isOpen,
  onClose,
  sawResults,
}: SawBreakdownModalProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl" zIndex="z-[9999]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-700" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Transparansi Penilaian Prioritas Desa
            </h3>
            <p className="text-xs text-slate-500">
              Urutan Kepentingan Penanganan Lapangan • Desa Simandulang
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

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
        {/* Penjelasan Awam Ramah Warga */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
          <div className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0" /> Penjelasan Penilaian Objektif Desa:
          </div>
          <p className="text-emerald-900 leading-relaxed text-xs">
            Sistem ini menentukan antrean perbaikan fasilitas desa secara <strong>terbuka, adil, dan objektif</strong> tanpa unsur pilih kasih. Titik yang didahulukan adalah titik yang kerusakannya paling parah (30%), berada di jalan utama atau dermaga nelayan (25%), rawan terendam banjir pasang rob (20%), paling banyak dilalui keluarga warga (15%), serta efisien anggarannya (10%).
          </p>
        </div>

        {/* 1. Bobot Kriteria */}
        <div>
          <h4 className="font-bold text-sm text-slate-900 mb-2">
            1. Pedoman Penilaian & Pembobotan Adil
          </h4>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Kode</th>
                  <th className="py-2 px-3">Nama Kriteria</th>
                  <th className="py-2 px-3">Sifat (Atribut)</th>
                  <th className="py-2 px-3">Bobot (W)</th>
                  <th className="py-2 px-3">Deskripsi Skala</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {DEFAULT_CRITERIA.map((crit) => (
                  <tr key={crit.code} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{crit.code}</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">{crit.name}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          crit.attribute === 'benefit'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {crit.attribute}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">{crit.weight} ({crit.weight * 100}%)</td>
                    <td className="py-2 px-3 font-sans text-slate-500 text-[11px]">{crit.scaleDescription}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Nilai Hasil Pengamatan Lapangan */}
        <div>
          <h4 className="font-bold text-sm text-slate-900 mb-2">
            2. Nilai Hasil Pengamatan Lapangan
          </h4>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-sans">Laporan Warga</th>
                  <th className="py-2 px-3">C1 (Kerusakan)</th>
                  <th className="py-2 px-3">C2 (Akses)</th>
                  <th className="py-2 px-3">C3 (Rob/Bahaya)</th>
                  <th className="py-2 px-3">C4 (KK)</th>
                  <th className="py-2 px-3">C5 (Biaya)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sawResults.map((item) => (
                  <tr key={item.reportId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans">
                      <span className="font-semibold text-slate-900">{item.report.ticketNumber}</span>
                      <div className="text-[10px] text-slate-400 font-normal">{item.report.title}</div>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-800">{item.evaluation.c1DamageLevel}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{item.evaluation.c2AccessUrgency}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{item.evaluation.c3HazardRisk}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{item.evaluation.c4Beneficiaries}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{item.evaluation.c5EstimatedCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Penyesuaian Nilai Standar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm text-slate-900">
              3. Penyesuaian Nilai Standar
            </h4>
            <span className="text-[11px] text-slate-500 italic">
              Perbandingan adil antar-kondisi laporan
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-sans">Laporan</th>
                  <th className="py-2 px-3">R1 (C1)</th>
                  <th className="py-2 px-3">R2 (C2)</th>
                  <th className="py-2 px-3">R3 (C3)</th>
                  <th className="py-2 px-3">R4 (C4)</th>
                  <th className="py-2 px-3">R5 (C5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sawResults.map((item) => (
                  <tr key={item.reportId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">{item.report.ticketNumber}</td>
                    <td className="py-2 px-3 text-sky-800 font-semibold">{item.normalized.c1.toFixed(4)}</td>
                    <td className="py-2 px-3 text-sky-800 font-semibold">{item.normalized.c2.toFixed(4)}</td>
                    <td className="py-2 px-3 text-sky-800 font-semibold">{item.normalized.c3.toFixed(4)}</td>
                    <td className="py-2 px-3 text-sky-800 font-semibold">{item.normalized.c4.toFixed(4)}</td>
                    <td className="py-2 px-3 text-sky-800 font-semibold">{item.normalized.c5.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Hasil Akhir Urutan Prioritas Penanganan */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm text-slate-900">
              4. Hasil Akhir Urutan Prioritas Penanganan
            </h4>
            <span className="text-[11px] text-slate-500 italic">
              Perhitungan total urgensi dan skala prioritas
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white font-semibold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Tiket</th>
                  <th className="py-2.5 px-3">Nama Infrastruktur & Dusun</th>
                  <th className="py-2.5 px-3 font-mono">Skor Prioritas</th>
                  <th className="py-2.5 px-3 font-sans">Estimasi Biaya</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sawResults.map((item) => (
                  <tr
                    key={item.reportId}
                    className={
                      item.rank === 1
                        ? 'bg-emerald-50/70 font-semibold'
                        : 'hover:bg-slate-50'
                    }
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          item.rank === 1
                            ? 'bg-red-600 text-white'
                            : item.rank === 2
                            ? 'bg-orange-600 text-white'
                            : item.rank === 3
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{item.report.ticketNumber}</td>
                    <td className="py-2.5 px-3 text-slate-800">
                      <div>{item.report.title}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.report.dusun}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 text-sm">
                      {item.score.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-mono text-xs">
                      Rp {item.evaluation.verifiedCostRupiah.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {item.report.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50">
        <div className="text-[11px] text-slate-500">
          Penetapan prioritas dilakukan secara terbuka dan adil demi kepentingan bersama seluruh masyarakat.
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition shadow-xs"
        >
          Tutup Rincian
        </button>
      </div>
    </ModalWrapper>
  );
}
