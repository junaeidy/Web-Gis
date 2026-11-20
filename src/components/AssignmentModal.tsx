'use client';

import React, { useState } from 'react';
import { Report } from '@/types';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { X, UserCheck, CheckCircle2, Wrench, Upload, Image as ImageIcon } from 'lucide-react';

interface AssignmentModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignOfficer: (reportId: string, officer: string, department: string) => void;
  onCompleteReport: (reportId: string, completionPhotoUrl: string, notes: string) => void;
}

export default function AssignmentModal({
  report,
  isOpen,
  onClose,
  onAssignOfficer,
  onCompleteReport,
}: AssignmentModalProps) {
  const isAssignMode = report?.status === 'disetujui_kades';

  const [officer, setOfficer] = useState('Tim Swakelola Dusun & TPK Desa');
  const [department, setDepartment] = useState('Seksi Kesejahteraan & Pembangunan Desa');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80'
  );
  const [completionNotes, setCompletionNotes] = useState('');

  if (!report) return null;

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssignOfficer(report.id, officer, department);
    onClose();
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompleteReport(
      report.id,
      completionPhotoUrl,
      completionNotes || 'Pekerjaan perbaikan fisik telah diselesaikan dan diperiksa bersama perangkat desa.'
    );
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg" zIndex="z-[9999]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          {isAssignMode ? (
            <UserCheck className="w-5 h-5 text-sky-700" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          )}
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isAssignMode ? 'Penetapan Penanggung Jawab Lapangan' : 'Dokumentasi & Konfirmasi Penyelesaian'}
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

      {/* Content */}
      {isAssignMode ? (
        <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg text-slate-700">
            <span className="font-semibold text-sky-900">Arahan Kades: </span>
            <span>{report.disposition?.notes || 'Segera tindak lanjuti di lapangan.'}</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Petugas / Penanggung Jawab Lapangan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              placeholder="Misal: Tim Swakelola Dusun I (Pak Ilham)"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Seksi / Departemen Pelaksana
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Misal: Tim Pengelola Kegiatan (TPK) Desa"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition shadow-xs"
            >
              <Wrench className="w-4 h-4" />
              Mulai Pengerjaan Lapangan
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
            <div className="font-semibold text-slate-900 mb-1">Petugas Pelaksana:</div>
            <div className="text-slate-600">{report.assignedOfficer || 'TPK Desa Teluk Pulai Luar'}</div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Foto Bukti Fisik Selesai (After Proof) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={completionPhotoUrl}
              onChange={(e) => setCompletionPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Foto akan ditampilkan bersebelahan dengan foto kerusakan awal (Before vs After) pada peta dan akun warga.
            </span>
          </div>

          {completionPhotoUrl && (
            <div className="h-40 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
              <img
                src={completionPhotoUrl}
                alt="Bukti Selesai"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-bold">
                Hasil Selesai
              </span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Catatan Hasil Pengerjaan
            </label>
            <textarea
              rows={3}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Misal: Perbaikan bantalan dan papan jembatan telah selesai. Arus kendaraan warga nelayan sudah kembali normal..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tandai Laporan Selesai
            </button>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
}
