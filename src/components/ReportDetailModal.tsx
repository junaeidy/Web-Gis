'use client';

import React from 'react';
import { Report, SAWResult, UserProfile, UserRole } from '@/types';
import ModalWrapper from '@/components/ui/ModalWrapper';
import {
  X,
  MapPin,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  ThumbsUp,
  Building2,
  Wrench,
  Navigation,
  LocateFixed,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface ReportDetailModalProps {
  report: Report | null;
  saw?: SAWResult | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  userRole: UserRole;
  onToggleSupport?: (reportId: string) => void;
  onOpenVerification?: (report: Report) => void;
  onOpenDisposition?: (report: Report) => void;
  onOpenAssignment?: (report: Report) => void;
  onNavigateRoute?: (report: Report) => void;
  onFocusLocation?: (report: Report) => void;
}

export default function ReportDetailModal({
  report,
  saw,
  isOpen,
  onClose,
  currentUser,
  userRole,
  onToggleSupport,
  onOpenVerification,
  onOpenDisposition,
  onOpenAssignment,
  onNavigateRoute,
  onFocusLocation,
}: ReportDetailModalProps) {
  if (!report) return null;

  const hasSupported = Boolean(currentUser && report.supportedUserIds?.includes(currentUser.id));

  // Nama pelapor aman di publik jika privasi diaktifkan
  const displayName =
    report.hideReporterIdentity && userRole === 'warga'
      ? `Warga ${report.dusun}`
      : report.reporterName;

  const displayPhone =
    report.hideReporterIdentity && userRole === 'warga'
      ? '0812-xxxx-xxxx'
      : report.reporterPhone;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" zIndex="z-[9999]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
              {report.ticketNumber}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 capitalize">
              {report.infrastructureType.replace(/_/g, ' ')}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
              {report.status.replace(/_/g, ' ')}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {report.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
        {/* Foto Sebelum vs Sesudah (Step 10 - Before vs After) */}
        {report.status === 'selesai' && report.completionPhotoUrl ? (
          <div>
            <div className="font-bold text-slate-900 mb-1.5 flex items-center justify-between">
              <span>Dokumentasi Penanganan Fisik (Sebelum vs Sesudah):</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                ✓ Penanganan Selesai
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl overflow-hidden border border-slate-200 h-40 sm:h-44 relative bg-slate-100">
                <img
                  src={report.photoUrl}
                  alt="Sebelum"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-700 text-white rounded text-[10px] font-bold">
                  Kondisi Awal Kerusakan
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-emerald-300 h-40 sm:h-44 relative bg-emerald-50">
                <img
                  src={report.completionPhotoUrl}
                  alt="Sesudah"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-bold">
                  Hasil Pengerjaan Selesai
                </div>
              </div>
            </div>
            {report.completionNotes && (
              <div className="mt-2 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950 text-[11px]">
                <strong>Catatan Hasil Pengerjaan:</strong> {report.completionNotes}
              </div>
            )}
          </div>
        ) : report.photoUrl ? (
          <div className="rounded-xl overflow-hidden border border-slate-200 h-44 sm:h-52 w-full bg-slate-100 relative">
            <img
              src={report.photoUrl}
              alt={report.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white rounded text-[10px] font-mono">
              {report.dusun}
            </div>
          </div>
        ) : null}

        {/* Dukungan Warga (1 Orang 1 Dukungan + Bisa Undo) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="font-bold text-slate-800">
              {report.upvotes} Warga
            </span>{' '}
            <span className="text-slate-500">mendukung percepatan penanganan laporan ini.</span>
            {hasSupported && (
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                ✓ Anda telah memberikan dukungan untuk laporan ini.
              </div>
            )}
          </div>
          {onToggleSupport && (
            <button
              onClick={() => onToggleSupport(report.id)}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition shadow-2xs ${
                hasSupported
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-white border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 text-slate-700'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasSupported ? 'fill-current' : ''}`} />
              {hasSupported ? 'Batalkan Dukungan' : 'Dukung Laporan Ini (+1)'}
            </button>
          )}
        </div>

        {/* Skor Rekomendasi jika sudah diverifikasi */}
        {saw && (
          <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
                Urutan Rekomendasi Perbaikan Desa
              </div>
              <div className="text-lg sm:text-xl font-bold text-emerald-950 mt-0.5">
                Prioritas Ke-{saw.rank}
              </div>
              <div className="text-[11px] text-emerald-800 mt-0.5">
                Tingkat Kebutuhan Mendesak: <strong>{(saw.score * 100).toFixed(0)} dari 100</strong>{' '}
                <span className="text-slate-400 font-mono text-[10px]">({saw.score.toFixed(4)})</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Estimasi Kebutuhan:</div>
              <div className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                Rp {saw.evaluation.verifiedCostRupiah.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        )}

        {/* Blok Disposisi Kepala Desa jika ada (Step 8) */}
        {report.disposition && (
          <div className="p-3.5 bg-emerald-900 text-white rounded-xl border border-emerald-950">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-emerald-300" />
              <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-200">
                Disposisi Kepala Desa Simandulang
              </span>
            </div>
            <div className="font-bold text-xs sm:text-sm text-white">
              Status: {report.disposition.decision.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div className="text-[11px] text-emerald-100 mt-1">
              Sumber Pagu: <strong>{report.disposition.budgetSource}</strong> (Rp {report.disposition.approvedBudget.toLocaleString('id-ID')})
            </div>
            <div className="text-[11px] text-emerald-200 italic mt-1 bg-emerald-950/40 p-2 rounded">
              &ldquo;{report.disposition.notes}&rdquo;
            </div>
          </div>
        )}

        {/* Petugas Penanggung Jawab jika ada (Step 9) */}
        {report.assignedOfficer && (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-sky-950">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-sky-700 shrink-0" />
              <div>
                <div className="font-bold">Penanggung Jawab Lapangan:</div>
                <div className="text-[11px] text-sky-800">{report.assignedOfficer} ({report.assignedDepartment})</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-200 text-sky-900 font-bold text-[10px] self-start sm:self-auto capitalize">
              {report.status.replace(/_/g, ' ')}
            </span>
          </div>
        )}

        {/* Deskripsi Laporan */}
        <div>
          <h4 className="font-bold text-slate-900 mb-1">Deskripsi Kerusakan:</h4>
          <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {report.description}
          </p>
        </div>

        {/* Informasi Lokasi & Privasi Pelapor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 pt-2 border-t border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Lokasi:</strong> {report.dusun}
              </span>
            </div>
            {report.addressDetail && (
              <div className="text-[11px] text-slate-500 pl-5 leading-relaxed">
                {report.addressDetail}
              </div>
            )}

            {/* Aksi Spasial / Rute GIS (Menggantikan koordinat mentah) */}
            <div className="pl-5 pt-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {onNavigateRoute && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateRoute(report);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] transition shadow-xs group"
                    title="Kalkulasi rute jalan & jarak menuju titik kerusakan di Peta Desa"
                  >
                    <Navigation className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
                    <span>Rute ke Lokasi</span>
                  </button>
                )}

                {onFocusLocation && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onFocusLocation(report);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-[11px] transition border border-slate-200 shadow-2xs"
                    title="Arahkan dan pusatkan kamera peta ke titik koordinat ini"
                  >
                    <LocateFixed className="w-3.5 h-3.5 text-slate-500" />
                    <span>Arahkan ke Titik</span>
                  </button>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1.5 text-sky-700 hover:text-sky-800 hover:underline text-[11px] font-medium"
                  title="Buka rute navigasi di Google Maps"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  <strong>Pelapor:</strong> {displayName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                <strong>Kontak:</strong> {displayPhone}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                <strong>Tanggal:</strong> {new Date(report.createdAt).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50">
        <button
          onClick={onClose}
          className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
        >
          Tutup
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {userRole === 'perangkat_desa' &&
            report.status === 'menunggu_verifikasi' &&
            onOpenVerification && (
              <button
                onClick={() => {
                  onClose();
                  onOpenVerification(report);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition text-xs shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verifikasi Lapangan
              </button>
            )}

          {userRole === 'kepala_desa' &&
            report.status === 'terverifikasi' &&
            onOpenDisposition && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDisposition(report);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition text-xs shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5" />
                Buat Disposisi Kades
              </button>
            )}

          {userRole === 'perangkat_desa' &&
            report.status === 'disetujui_kades' &&
            onOpenAssignment && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAssignment(report);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition text-xs shadow-xs"
              >
                <Wrench className="w-3.5 h-3.5" />
                Tugaskan Petugas
              </button>
            )}

          {userRole === 'perangkat_desa' &&
            report.status === 'dalam_pengerjaan' &&
            onOpenAssignment && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAssignment(report);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition text-xs shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Upload Bukti Selesai
              </button>
            )}
        </div>
      </div>
    </ModalWrapper>
  );
}
