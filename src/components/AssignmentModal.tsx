'use client';

import React, { useState } from 'react';
import { Report } from '@/types';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { X, UserCheck, CheckCircle2, Wrench, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

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
  const { error: toastError, success: toastSuccess } = useToast();
  const isAssignMode = report?.status === 'disetujui_kades';

  const [officer, setOfficer] = useState('Tim Swakelola Dusun & TPK Desa');
  const [department, setDepartment] = useState('Seksi Kesejahteraan & Pembangunan Desa');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80'
  );
  const [completionNotes, setCompletionNotes] = useState('');

  if (!report) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toastError('File Terlalu Besar', 'Maksimal ukuran foto adalah 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCompletionPhotoUrl(uploadEvent.target?.result as string);
      toastSuccess('Foto Berhasil Diunggah', 'Bukti foto penyelesaian berhasil dimuat.');
    };
    reader.readAsDataURL(file);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officer.trim() || !department.trim()) {
      toastError('Data Belum Lengkap', 'Mohon isi nama penanggung jawab dan seksi pelaksana.');
      return;
    }
    onAssignOfficer(report.id, officer, department);
    onClose();
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionPhotoUrl.trim()) {
      toastError('Foto Bukti Wajib Ada', 'Silakan unggah atau masukkan link foto bukti penyelesaian.');
      return;
    }
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
            <div className="text-slate-600">{report.assignedOfficer || 'TPK Desa Simandulang'}</div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Foto Bukti Fisik Selesai (After Proof) <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition text-emerald-800 font-medium">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Pilih Foto dari Galeri / Kamera Laptop</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Atau link foto:</span>
                <input
                  type="url"
                  value={completionPhotoUrl}
                  onChange={(e) => setCompletionPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Foto akan ditampilkan bersebelahan dengan foto kerusakan awal (Before vs After) pada peta dan akun warga.
            </span>
          </div>

          {completionPhotoUrl ? (
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
          ) : (
            <div className="h-28 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-1">
              <ImageIcon className="w-6 h-6" />
              <span>Belum ada foto yang dipilih</span>
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
