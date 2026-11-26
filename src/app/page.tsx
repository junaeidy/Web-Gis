'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  KadesDisposition,
  Report,
  ReportEvaluation,
  UserProfile,
  LetterRequest,
  LetterStatus,
} from '@/types';
import { MOCK_USERS, INITIAL_LETTERS } from '@/data/mock-data';
import { calculateSAW } from '@/lib/saw';
import {
  fetchReportsFromDb,
  insertReportToDb,
  updateReportInDb,
  toggleSupportInDb,
  insertEvaluationToDb,
  fetchUsersFromDb,
  insertUserToDb,
  getSavedSessionUser,
  saveSessionUser,
  insertLetterToDb,
  updateLetterInDb,
} from '@/lib/data-service';
import ReportModal from '@/components/ReportModal';
import VerificationModal from '@/components/VerificationModal';
import SawBreakdownModal from '@/components/SawBreakdownModal';
import ReportDetailModal from '@/components/ReportDetailModal';
import AuthModal from '@/components/AuthModal';
import KadesDispositionModal from '@/components/KadesDispositionModal';
import AssignmentModal from '@/components/AssignmentModal';
import AiAssistantWidget from '@/components/AiAssistantWidget';
import LandingPortal from '@/components/LandingPortal';
import AdministrasiModal from '@/components/AdministrasiModal';
import PerpajakanModal from '@/components/PerpajakanModal';
import BansosModal from '@/components/BansosModal';
import ProfilDesaModal from '@/components/ProfilDesaModal';
import { useToast } from '@/components/ui/Toast';
import {
  MapPin,
  Plus,
  TrendingUp,
  FileText,
  Filter,
  BarChart3,
  User,
  ThumbsUp,
  Printer,
  LogIn,
  LogOut,
  Database,
  RotateCcw,
  AlertTriangle,
  Navigation,
  X,
  ChevronDown,
  LayoutGrid,
  ArrowLeft,
  Mail,
  CheckCircle2,
  Clock,
  Check,
  XCircle,
  Send,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

const DynamicMapView = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] sm:h-[460px] lg:h-[560px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-xs sm:text-sm text-slate-500 font-medium">
      Memuat Peta Spasial Desa Simandulang...
    </div>
  ),
});

export default function Home() {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  // State User & Auth Sistem (Default: Tidak Login / Guest)
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // State Laporan & Database Supabase
  const [reports, setReports] = useState<Report[]>([]);
  const [evaluations, setEvaluations] = useState<ReportEvaluation[]>([]);
  const [letters, setLetters] = useState<LetterRequest[]>(INITIAL_LETTERS);
  const [officerSubTab, setOfficerSubTab] = useState<'pengaduan' | 'surat'>('pengaduan');
  const [mySubTab, setMySubTab] = useState<'pengaduan' | 'surat'>('pengaduan');
  const [dbError, setDbError] = useState<string | null>(null);

  // Mode Tampilan Halaman: 'portal' (Landing Page seperti gambar) | 'layanan' (Dashboard Peta & Pengaduan)
  const [viewMode, setViewMode] = useState<'portal' | 'layanan'>('portal');

  // Modals Tambahan Layanan Portal Digital
  const [isAdministrasiModalOpen, setIsAdministrasiModalOpen] = useState(false);
  const [isPerpajakanModalOpen, setIsPerpajakanModalOpen] = useState(false);
  const [isBansosModalOpen, setIsBansosModalOpen] = useState(false);
  const [isProfilDesaModalOpen, setIsProfilDesaModalOpen] = useState(false);
  const [forceOpenAi, setForceOpenAi] = useState(false);

  const [activeTab, setActiveTab] = useState<'peta' | 'saw' | 'laporan' | 'riwayat_saya' | 'monitoring'>('peta');

  // Filter State
  const [selectedDusun, setSelectedDusun] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isSawModalOpen, setIsSawModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDispositionModalOpen, setIsDispositionModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeRouteReport, setActiveRouteReport] = useState<Report | null>(null);
  const [pendingSupportReportId, setPendingSupportReportId] = useState<string | null>(null);

  // 1. Fungsi Mengambil Data Murni dari Database Supabase
  const loadSupabaseData = useCallback(async () => {
    setDbError(null);

    // Ambil Profil Pengguna
    const { users: loadedUsers } = await fetchUsersFromDb();
    setUsers(loadedUsers);

    // Ambil Laporan, Evaluasi & Permohonan Surat MURNI dari Supabase
    const { reports: loadedReports, evaluations: loadedEvals, letters: loadedLetters, error: repErr } = await fetchReportsFromDb();
    if (repErr) {
      setDbError(repErr);
      setReports([]);
      setEvaluations([]);
    } else {
      setReports(loadedReports);
      setEvaluations(loadedEvals);
      if (loadedLetters && loadedLetters.length > 0) {
        setLetters(loadedLetters);
      }
      setDbError(null);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function init() {
      // Muat Sesi Pengguna: Hanya aktifkan jika user sebelumnya sudah pernah login
      const savedUser = getSavedSessionUser();
      if (!ignore) setCurrentUser(savedUser);

      // Ambil Profil Pengguna
      const { users: loadedUsers } = await fetchUsersFromDb();
      if (!ignore) setUsers(loadedUsers);

      // Ambil Laporan, Evaluasi & Surat MURNI dari Supabase
      const { reports: loadedReports, evaluations: loadedEvals, letters: loadedLetters, error: repErr } = await fetchReportsFromDb();
      if (!ignore) {
        if (repErr) {
          setDbError(repErr);
          setReports([]);
          setEvaluations([]);
        } else {
          setReports(loadedReports);
          setEvaluations(loadedEvals);
          if (loadedLetters && loadedLetters.length > 0) {
            setLetters(loadedLetters);
          }
          setDbError(null);
        }
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, []);

  // Status Modal Terbuka
  const isAnyModalOpen =
    isReportModalOpen ||
    isVerifyModalOpen ||
    isSawModalOpen ||
    isDetailModalOpen ||
    isDispositionModalOpen ||
    isAssignmentModalOpen ||
    isAuthModalOpen;

  // Kalkulasi Algoritma SAW Dinamis
  const sawResults = useMemo(() => {
    return calculateSAW(reports, evaluations);
  }, [reports, evaluations]);

  // Filter Laporan
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchDusun = selectedDusun === 'all' || r.dusun === selectedDusun;
      const matchType = selectedType === 'all' || r.infrastructureType === selectedType;
      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
      return matchDusun && matchType && matchStatus;
    });
  }, [reports, selectedDusun, selectedType, selectedStatus]);

  // Filter Hasil Perangkingan SAW
  const filteredSawResults = useMemo(() => {
    return sawResults.filter((s) => {
      const matchDusun = selectedDusun === 'all' || s.report.dusun === selectedDusun;
      const matchType = selectedType === 'all' || s.report.infrastructureType === selectedType;
      const matchStatus = selectedStatus === 'all' || s.report.status === selectedStatus;
      return matchDusun && matchType && matchStatus;
    });
  }, [sawResults, selectedDusun, selectedType, selectedStatus]);

  // Laporan Milik Warga yang Sedang Login
  const myReports = useMemo(() => {
    if (!currentUser) return [];
    return reports.filter(
      (r) =>
        (r.reporterId && r.reporterId === currentUser.id) ||
        (currentUser.phone && r.reporterPhone === currentUser.phone) ||
        (currentUser.nik && r.reporterNik && r.reporterNik === currentUser.nik) ||
        r.reporterName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()
    );
  }, [reports, currentUser]);

  // Permohonan Surat Milik Warga yang Sedang Login
  const myLetters = useMemo(() => {
    if (!currentUser) return [];
    return letters.filter(
      (l) =>
        (l.applicantId && l.applicantId === currentUser.id) ||
        (currentUser.phone && l.applicantPhone === currentUser.phone) ||
        (currentUser.nik && l.applicantNik === currentUser.nik) ||
        l.applicantName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()
    );
  }, [letters, currentUser]);

  // Statistik & Monitoring
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'menunggu_verifikasi').length;
    const verified = reports.filter((r) => r.status === 'terverifikasi').length;
    const inProgress = reports.filter((r) => r.status === 'dalam_pengerjaan').length;
    const completed = reports.filter((r) => r.status === 'selesai').length;
    const topPriority = sawResults.find((s) => s.rank === 1);
    const totalBudget = reports.reduce((acc, r) => acc + (r.disposition?.approvedBudget || 0), 0);

    return { total, pending, verified, inProgress, completed, topPriority, totalBudget };
  }, [reports, sawResults]);

  // HANDLERS AUTH (Sesi Tersimpan di Browser)
  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    saveSessionUser(user);
    toastSuccess(
      'Berhasil Masuk',
      `Selamat datang kembali, ${user.name} (${user.role.toUpperCase().replace('_', ' ')})`
    );

    if (pendingSupportReportId) {
      const targetId = pendingSupportReportId;
      setPendingSupportReportId(null);
      await handleToggleSupport(targetId);
    }
  };

  const handleRegisterSuccess = async (newUser: UserProfile) => {
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    saveSessionUser(newUser);
    const { success: regOk, error: regErr } = await insertUserToDb(newUser);
    if (!regOk && regErr) {
      toastError('Sinkronisasi Akun Cloud Terkendala', regErr);
    } else {
      toastSuccess(
        'Pendaftaran Berhasil!',
        `Akun atas nama ${newUser.name} telah aktif dan siap digunakan.`
      );
    }

    if (pendingSupportReportId) {
      const targetId = pendingSupportReportId;
      setPendingSupportReportId(null);
      await handleToggleSupport(targetId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveSessionUser(null);
    toastInfo('Berhasil Keluar', 'Sesi akun Anda telah diakhiri.');
  };

  // HANDLER DUKUNGAN WARGA (UPVOTE LANGSUNG KE SUPABASE)
  const handleToggleSupport = async (reportId: string) => {
    if (!currentUser) {
      setPendingSupportReportId(reportId);
      setIsDetailModalOpen(false);
      setIsAuthModalOpen(true);
      toastInfo('Perlu Masuk Akun', 'Silakan masuk atau daftar terlebih dahulu untuk memberikan dukungan.');
      return;
    }

    const currentRep = reports.find((r) => r.id === reportId);
    if (!currentRep) return;

    const alreadySupported = currentRep.supportedUserIds.includes(currentUser.id);
    const { success, error } = await toggleSupportInDb(reportId, currentUser.id, alreadySupported);

    if (!success) {
      toastError('Gagal Memproses Dukungan', error || 'Terjadi kesalahan sistem.');
      return;
    }

    if (alreadySupported) {
      toastInfo('Dukungan Dibatalkan', 'Dukungan Anda terhadap laporan ini telah ditarik.');
    } else {
      toastSuccess(
        'Dukungan Berhasil Ditambahkan!',
        'Partisipasi suara Anda memperkuat urgensi perbaikan fasilitas ini.'
      );
    }

    // Refresh data dari database
    await loadSupabaseData();
  };

  // Step 2 & 3: Warga Mengirim Laporan (INSERT LANGSUNG KE SUPABASE)
  const handleCreateReport = async (
    newReportData: Omit<Report, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    const { report: created, error } = await insertReportToDb(newReportData);
    if (error) {
      toastError('Gagal Mengirim Laporan', error);
      return;
    }

    if (created) {
      toastSuccess(
        'Laporan Berhasil Terkirim!',
        `Tiket ${created.ticketNumber} telah tersimpan di Sistem Desa dan siap ditinjau.`
      );
      await loadSupabaseData();
      setSelectedReport(created);
      setActiveTab('peta');
    }
  };

  // Step 5 & 6: Admin Verifikasi & Skoring SAW (UPSERT KE SUPABASE)
  const handleVerifyReport = async (evaluationData: Omit<ReportEvaluation, 'id' | 'verifiedAt'>) => {
    const { success, error } = await insertEvaluationToDb(evaluationData);
    if (!success) {
      toastError('Gagal Menyimpan Verifikasi', error || 'Terjadi kesalahan saat menyimpan data.');
      return;
    }
    toastSuccess(
      'Laporan Berhasil Diverifikasi',
      'Penilaian telah disimpan dan urutan prioritas telah diperbarui otomatis.'
    );
    await loadSupabaseData();
  };

  // Step 5: Tandai Laporan Duplikat (UPDATE KE SUPABASE)
  const handleMarkDuplicate = async (reportId: string, originalTicket: string) => {
    const { success, error } = await updateReportInDb(reportId, {
      status: 'duplikat',
      duplicateOfTicket: originalTicket,
    });
    if (!success) {
      toastError('Gagal Menandai Duplikat', error || 'Gagal memperbarui status laporan.');
      return;
    }
    toastSuccess(
      'Status Duplikat Berhasil Disimpan',
      `Laporan ditandai sebagai duplikat dari tiket ${originalTicket}.`
    );
    await loadSupabaseData();
  };

  // Step 8: Disposisi Kepala Desa (UPDATE KE SUPABASE)
  const handleKadesDisposition = async (disposition: KadesDisposition) => {
    if (!selectedReport) return;
    const { success, error } = await updateReportInDb(selectedReport.id, {
      status: 'disetujui_kades',
      disposition,
    });
    if (!success) {
      toastError('Gagal Menyimpan Disposisi', error || 'Gagal menyimpan disposisi kepala desa.');
      return;
    }
    toastSuccess(
      'Disposisi Kades Berhasil Diterbitkan',
      `Disetujui dengan alokasi anggaran Rp ${(disposition.approvedBudget || 0).toLocaleString('id-ID')}.`
    );
    await loadSupabaseData();
  };

  // Step 9: Penetapan Petugas Lapangan (UPDATE KE SUPABASE)
  const handleAssignOfficer = async (reportId: string, officer: string, department: string) => {
    const { success, error } = await updateReportInDb(reportId, {
      status: 'dalam_pengerjaan',
      assignedOfficer: officer,
      assignedDepartment: department,
    });
    if (!success) {
      toastError('Gagal Menugaskan Petugas', error || 'Gagal menyimpan data penugasan.');
      return;
    }
    toastSuccess(
      'Petugas Berhasil Ditugaskan',
      `${officer} (${department}) telah ditugaskan dan status pengerjaan aktif.`
    );
    await loadSupabaseData();
  };

  // Step 10: Unggah Dokumentasi & Tandai Selesai (UPDATE KE SUPABASE)
  const handleCompleteReport = async (reportId: string, completionPhotoUrl: string, notes: string) => {
    const { success, error } = await updateReportInDb(reportId, {
      status: 'selesai',
      completionPhotoUrl,
      completionNotes: notes,
      completedAt: new Date().toISOString(),
    });
    if (!success) {
      toastError('Gagal Menyelesaikan Laporan', error || 'Gagal memperbarui status selesai.');
      return;
    }
    toastSuccess(
      'Pekerjaan Selesai!',
      'Dokumentasi bukti fisik telah tersimpan dan status laporan ditandai selesai.'
    );
    await loadSupabaseData();
  };

  // HANDLERS PERMOHONAN SURAT ONLINE
  const handleCreateLetter = async (
    newLetterData: Omit<LetterRequest, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<string> => {
    const { letter: created, ticketNumber, error } = await insertLetterToDb(newLetterData);
    if (error && !created) {
      toastError('Gagal Mengirim Permohonan Surat', error);
      throw new Error(error);
    }

    const assignedTicket =
      created?.ticketNumber ||
      ticketNumber ||
      `SRT-2026-${Math.floor(100 + Math.random() * 900)}`;

    if (created) {
      setLetters((prev) => [created, ...prev]);
    } else {
      const localFallback: LetterRequest = {
        ...newLetterData,
        id: `local-${Date.now()}`,
        ticketNumber: assignedTicket,
        status: 'menunggu_verifikasi',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLetters((prev) => [localFallback, ...prev]);
    }

    toastSuccess(
      'Permohonan Surat Terkirim!',
      `Nomor Tiket #${assignedTicket} telah diterbitkan dan langsung masuk antrean petugas desa.`
    );
    await loadSupabaseData();
    return assignedTicket;
  };

  const handleUpdateLetterStatus = async (
    letterId: string,
    newStatus: LetterStatus,
    officerNotes?: string,
    pickupSchedule?: string
  ) => {
    const { success, error } = await updateLetterInDb(letterId, {
      status: newStatus,
      officerNotes,
      pickupSchedule,
    });
    if (!success) {
      toastError('Gagal Memperbarui Status Surat', error || 'Gagal mengubah status berkas.');
      return;
    }
    toastSuccess(
      'Status Permohonan Diperbarui',
      `Status berkas diperbarui menjadi: ${newStatus.replace(/_/g, ' ')}.`
    );
    setLetters((prev) =>
      prev.map((l) => (l.id === letterId ? { ...l, status: newStatus, officerNotes, pickupSchedule } : l))
    );
    await loadSupabaseData();
  };

  const openDetail = (report: Report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleNavigateRoute = (report: Report) => {
    setActiveRouteReport(report);
    setSelectedReport(report);
    setActiveTab('peta');
    setIsDetailModalOpen(false);
  };

  const handleFocusLocation = (report: Report) => {
    setSelectedReport(report);
    setActiveTab('peta');
    setIsDetailModalOpen(false);
  };

  const handleClearRoute = () => {
    setActiveRouteReport(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. TOP NAVBAR (RESPONSIF MOBILE-FIRST) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo & Identitas */}
            <div
              onClick={() => setViewMode('portal')}
              className="flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer group"
              title="Kembali ke Portal SIPANDAI Desa"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo SIPANDAI Desa"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-xl shrink-0 p-0.5 bg-white shadow-xs border border-slate-200 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 tracking-tight leading-tight truncate group-hover:text-emerald-800 transition">
                  SIPANDAI Desa Simandulang
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                  Sistem Informasi Pelayanan & Aspirasi Warga Desa • Kualuh Leidong
                </p>
              </div>
            </div>

            {/* Navigasi Switcher: Portal vs Layanan Peta */}
            <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('portal')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'portal'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Portal Layanan</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('layanan')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'layanan'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Peta & Pengaduan</span>
              </button>
            </div>

            {/* User Profile & Action Bar */}
            <div className="flex items-center gap-2 shrink-0">
              {currentUser ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left text-xs"
                  >
                    <div className="h-6 w-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden md:block">
                      <div className="font-bold text-slate-900 text-[11px] leading-tight truncate max-w-[120px]">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {currentUser.role.replace('_', ' ')}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    title="Keluar (Logout)"
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Masuk / Daftar
                </button>
              )}

              {/* Tombol Lapor / Pengaduan */}
              <button
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                  } else {
                    setIsReportModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Buat</span> Pengaduan
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. TAMPILAN LANDING PAGE UTAMA (PORTAL DIGITAL DESA SESUAI GAMBAR REFERENSI) */}
      {viewMode === 'portal' && (
        <main className="flex-1 flex flex-col">
          <LandingPortal
            onOpenAdministrasi={() => setIsAdministrasiModalOpen(true)}
            onOpenPelayanan={() => {
              setViewMode('layanan');
              setActiveTab('peta');
            }}
            onOpenPerpajakan={() => setIsPerpajakanModalOpen(true)}
            onOpenBansos={() => setIsBansosModalOpen(true)}
            onOpenResepsionis={() => setForceOpenAi((prev) => !prev)}
            onOpenProfilDesa={() => setIsProfilDesaModalOpen(true)}
            onGoToMap={() => {
              setViewMode('layanan');
              setActiveTab('peta');
            }}
          />
        </main>
      )}

      {/* 3. TAMPILAN DASHBOARD PETA & PENGADUAN MASYARAKAT */}
      {viewMode === 'layanan' && (
        <div className="flex-1 flex flex-col">
          {/* Bar Navigasi Cepat Kembali ke Portal */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3.5 w-full">
            <button
              type="button"
              onClick={() => setViewMode('portal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs hover:border-emerald-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kembali ke Halaman Utama Portal Digital</span>
            </button>
          </div>

          {/* PERINGATAN JIKA ADA KENDALA KONEKSI SUPABASE */}
          {dbError && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 w-full">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-bold text-amber-900 text-sm">
                  Sambungan Data Desa Perlu Diaktifkan
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Pemberitahuan sambungan: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold text-amber-950">{dbError}</code>
                </p>
                <p className="text-xs text-amber-700">
                  Untuk mengaktifkan penyimpanan data desa, jalankan instruksi berikut pada pengelola pusat data:
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto select-all leading-relaxed">
              grant usage on schema public to anon, authenticated, service_role;<br />
              grant all on all tables in schema public to anon, authenticated, service_role;<br />
              grant all on all sequences in schema public to anon, authenticated, service_role;<br />
              grant all on all routines in schema public to anon, authenticated, service_role;
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  toastInfo('Memeriksa Sambungan...', 'Menghubungi pusat data desa...');
                  const { reports: r, evaluations: ev, error: err } = await fetchReportsFromDb();
                  if (err) {
                    setDbError(err);
                    toastError('Sambungan Gagal', err);
                  } else {
                    setDbError(null);
                    setReports(r);
                    setEvaluations(ev);
                    toastSuccess('Sambungan Data Berhasil!', 'Pusat data desa aktif dan siap digunakan.');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Periksa Sambungan Data Kembali
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. STATISTIK MONITORING CEPAT */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Total Laporan Warga</span>
            <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">{stats.total}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-amber-600">Menunggu Survei</span>
            <div className="text-lg sm:text-xl font-bold text-amber-600 mt-0.5">{stats.pending}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-sky-700">Masuk Antrean</span>
            <div className="text-lg sm:text-xl font-bold text-sky-700 mt-0.5">{stats.verified}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-indigo-700">Sedang Dikerjakan</span>
            <div className="text-lg sm:text-xl font-bold text-indigo-700 mt-0.5">{stats.inProgress}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700">Tuntas Diperbaiki</span>
            <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">{stats.completed}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600">Total Alokasi Dana</span>
            <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono mt-1 truncate">
              Rp {stats.totalBudget.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </section>

      {/* 6. TABS NAVIGASI & FILTER DATA */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-2 w-full">
        {/* Row 1: Navigasi Tab Utama (Responsif, scroll horizontal mulus, tidak saling menumpuk) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('peta')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'peta'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Peta Sebaran Pengaduan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saw')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'saw'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Urutan Prioritas Penanganan</span>
            <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
              {filteredSawResults.length}
            </span>
          </button>

          {currentUser && currentUser.role !== 'warga' && (
            <button
              type="button"
              onClick={() => setActiveTab('laporan')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
                activeTab === 'laporan'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tindak Lanjut Petugas</span>
              {stats.pending > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          )}

          {currentUser && (
            <button
              type="button"
              onClick={() => setActiveTab('riwayat_saya')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
                activeTab === 'riwayat_saya'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Pengaduan Saya</span>
              <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded-full">
                {myReports.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('monitoring')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'monitoring'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Rekapitulasi Desa</span>
          </button>
        </div>

        {/* Row 2: Dedicated Filter Toolbar (Leluasa, tidak bertabrakan dengan tab navigasi) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 pb-1 text-xs">
          {/* Status & Ringkasan Data Terfilter */}
          <div className="flex items-center gap-2 text-slate-600">
            <span className="inline-flex items-center justify-center p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <Filter className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold text-slate-800">Filter Data:</span>
            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
              {filteredReports.length} dari {reports.length} laporan
            </span>
            {(selectedDusun !== 'all' || selectedType !== 'all' || selectedStatus !== 'all') && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Filter Aktif
              </span>
            )}
          </div>

          {/* Kontrol Dropdown Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Wilayah */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px]">
              <select
                value={selectedDusun}
                onChange={(e) => setSelectedDusun(e.target.value)}
                className={`w-full appearance-none pl-3 pr-8 py-1.5 bg-white border rounded-lg text-xs focus:outline-none transition shadow-2xs cursor-pointer ${
                  selectedDusun !== 'all'
                    ? 'border-emerald-600 font-semibold text-emerald-950 bg-emerald-50/50'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <option value="all">Semua Wilayah</option>
                <option value="Dusun I">Kawasan Pesisir Pantai</option>
                <option value="Dusun II">Kawasan Pusat Balai Desa</option>
                <option value="Dusun III">Kawasan Sei Puyuh</option>
                <option value="Dusun IV">Kawasan Pemukiman Gori</option>
                <option value="Dusun V">Kawasan Sentra Tambak</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Filter Kategori */}
            <div className="relative flex-1 sm:flex-initial min-w-[150px]">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`w-full appearance-none pl-3 pr-8 py-1.5 bg-white border rounded-lg text-xs focus:outline-none transition shadow-2xs cursor-pointer ${
                  selectedType !== 'all'
                    ? 'border-emerald-600 font-semibold text-emerald-950 bg-emerald-50/50'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <option value="all">Semua Kategori</option>
                <optgroup label="Infrastruktur & Lingkungan">
                  <option value="jalan_poros">Jalan Poros Utama</option>
                  <option value="jalan_lingkungan">Jalan Lingkungan / Gang</option>
                  <option value="jembatan">Jembatan Penyeberangan</option>
                  <option value="drainase_tanggul_rob">Tanggul Rob & Parit</option>
                  <option value="dermaga_tangkahan">Tangkahan Nelayan</option>
                  <option value="fasilitas_umum">Fasilitas Publik / Balai</option>
                </optgroup>
                <optgroup label="Pengaduan Pelayanan & Sosial">
                  <option value="kebersihan_sampah">Kebersihan & Sampah</option>
                  <option value="pelayanan_administrasi">Pelayanan Kantor Desa</option>
                  <option value="bantuan_sosial">Bantuan Sosial (BLT-DD)</option>
                  <option value="keamanan_ketertiban">Penerangan & Keamanan</option>
                  <option value="aspirasi_pembangunan">Aspirasi Pembangunan</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Filter Status */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full appearance-none pl-3 pr-8 py-1.5 bg-white border rounded-lg text-xs focus:outline-none transition shadow-2xs cursor-pointer ${
                  selectedStatus !== 'all'
                    ? 'border-emerald-600 font-semibold text-emerald-950 bg-emerald-50/50'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <option value="all">Semua Status</option>
                <option value="menunggu_verifikasi">Menunggu Survei</option>
                <option value="terverifikasi">Masuk Antrean</option>
                <option value="disetujui_kades">Disetujui Kades</option>
                <option value="dalam_pengerjaan">Dikerjakan</option>
                <option value="selesai">Selesai</option>
                <option value="duplikat">Laporan Duplikat</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Tombol Reset Filter */}
            {(selectedDusun !== 'all' || selectedType !== 'all' || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDusun('all');
                  setSelectedType('all');
                  setSelectedStatus('all');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold transition shadow-2xs"
                title="Reset semua filter ke kondisi awal"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 7. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 w-full flex-1">
        {/* TAB 1: PETA SPASIAL (GIS) */}
        {activeTab === 'peta' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <DynamicMapView
                reports={filteredReports}
                sawResults={sawResults}
                selectedReport={selectedReport}
                onSelectReport={openDetail}
                activeRouteReport={activeRouteReport}
                onClearRoute={handleClearRoute}
                onNavigateRoute={handleNavigateRoute}
                hideLegend={isAnyModalOpen}
                className="h-[360px] sm:h-[480px] lg:h-[560px] w-full rounded-2xl border border-slate-200 shadow-xs"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col h-[340px] sm:h-[480px] lg:h-[560px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Titik Infrastruktur ({filteredReports.length}{filteredReports.length !== reports.length ? ` / ${reports.length}` : ''})
                  </h3>
                  {filteredReports.length !== reports.length && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      Terfilter
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">Pilih titik untuk zoom</span>
              </div>

              {filteredReports.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-slate-400 space-y-2">
                  <Database className="w-8 h-8 text-slate-300" />
                  <p className="text-xs">
                    {reports.length === 0
                      ? 'Belum ada data titik infrastruktur yang terdaftar.'
                      : 'Tidak ada laporan yang sesuai dengan filter wilayah atau status yang dipilih.'}
                  </p>
                  {reports.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDusun('all');
                        setSelectedType('all');
                        setSelectedStatus('all');
                      }}
                      className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-900"
                    >
                      Reset Filter Sekarang
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-y-auto space-y-2 mt-3 pr-1 divide-y divide-slate-100">
                  {filteredReports.map((report) => {
                    const saw = sawResults.find((s) => s.reportId === report.id);
                    const isSelected = selectedReport?.id === report.id;

                    return (
                      <div
                        key={report.id}
                        onClick={() => openDetail(report)}
                        className={`pt-2 pb-2 px-2.5 rounded-xl cursor-pointer transition flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/80 border border-emerald-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {report.ticketNumber}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate">
                              {report.dusun}
                            </span>
                          </div>
                          <h4 className="font-semibold text-xs text-slate-900 leading-snug line-clamp-1">
                            {report.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1 text-slate-700 font-medium">
                              <ThumbsUp className="w-3 h-3 text-emerald-600" /> {report.upvotes || 0} Dukungan
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateRoute(report);
                              }}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[10px] transition border border-emerald-200"
                              title="Tampilkan rute jalan ke titik laporan ini di peta"
                            >
                              <Navigation className="w-2.5 h-2.5" />
                              <span>Rute</span>
                            </button>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {saw ? (
                            <div className="flex flex-col items-end">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  saw.rank === 1
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : saw.rank <= 3
                                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                    : 'bg-sky-100 text-sky-700 border border-sky-200'
                                }`}
                              >
                                Prioritas #{saw.rank}
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                                Skor: {(saw.score * 100).toFixed(0)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Menunggu Survei
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: URUTAN PRIORITAS PENANGANAN */}
        {activeTab === 'saw' && (
          <div className="space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Urutan Prioritas Penanganan Fasilitas & Pengaduan Warga
                </h3>
                <p className="text-xs text-slate-500">
                  Urutan penanganan transparan berdasarkan tingkat urgensi kerusakan dan kebutuhan masyarakat di seluruh kawasan Desa Simandulang.
                </p>
              </div>
              {currentUser && currentUser.role !== 'warga' && (
                <button
                  onClick={() => setIsSawModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-xs self-start sm:self-auto"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Rincian Penilaian Prioritas (Khusus Petugas)
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Prioritas</th>
                      <th className="py-3 px-4">No. Tiket & Judul</th>
                      <th className="py-3 px-4">Dusun</th>
                      <th className="py-3 px-4 text-center">Tingkat Kerusakan</th>
                      <th className="py-3 px-4 text-center">Skor Urgensi</th>
                      <th className="py-3 px-4">Keputusan Kepala Desa</th>
                      <th className="py-3 px-4 text-right">Rincian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSawResults.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 space-y-2">
                          <p>
                            {sawResults.length === 0
                              ? 'Belum ada laporan terverifikasi untuk masuk antrean prioritas.'
                              : 'Tidak ada antrean prioritas yang sesuai dengan kriteria filter saat ini.'}
                          </p>
                          {sawResults.length > 0 && (selectedDusun !== 'all' || selectedType !== 'all' || selectedStatus !== 'all') && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDusun('all');
                                setSelectedType('all');
                                setSelectedStatus('all');
                              }}
                              className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-900"
                            >
                              Reset Filter untuk melihat semua antrean
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredSawResults.map((item) => (
                        <tr key={item.reportId} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-sm">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-bold ${
                                item.rank === 1
                                  ? 'bg-red-600'
                                  : item.rank <= 3
                                  ? 'bg-orange-500'
                                  : 'bg-sky-600'
                              }`}
                            >
                              #{item.rank}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-[10px] text-slate-500 block font-semibold">
                              {item.report.ticketNumber}
                            </span>
                            <span className="font-bold text-slate-900 line-clamp-1">
                              {item.report.title}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {item.report.dusun}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
                              Level {item.evaluation.c1DamageLevel}/4
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-900 font-mono">
                            {(item.score * 100).toFixed(1)}%
                          </td>
                          <td className="py-3 px-4">
                            {item.report.disposition ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                                {item.report.disposition.decision.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Belum Ada Disposisi</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => openDetail(item.report)}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                            >
                              Lihat Dokumen
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PANEL ADMIN & VERIFIKASI */}
        {activeTab === 'laporan' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ruang Kerja Perangkat Desa
                </h3>
                <p className="text-xs text-slate-500">
                  Pemeriksaan laporan pengaduan warga, antrean permohonan surat administrasi, penetapan skala prioritas, dan penugasan tim kerja.
                </p>
              </div>

              {/* Sub-tab Switcher: Pengaduan vs Permohonan Surat */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setOfficerSubTab('pengaduan')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    officerSubTab === 'pengaduan'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pengaduan Fasilitas ({reports.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOfficerSubTab('surat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    officerSubTab === 'surat'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Antrean Surat Warga ({letters.length})</span>
                </button>
              </div>
            </div>

            {officerSubTab === 'pengaduan' ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">No. Tiket</th>
                        <th className="py-3 px-4">Judul & Kawasan</th>
                        <th className="py-3 px-4">Pelapor</th>
                        <th className="py-3 px-4">Status Alur</th>
                        <th className="py-3 px-4 text-right">Tindakan Petugas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReports.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 space-y-2">
                            <p>
                              {reports.length === 0
                                ? 'Belum ada data laporan pengaduan masuk.'
                                : 'Tidak ada laporan yang sesuai dengan filter yang dipilih.'}
                            </p>
                            {reports.length > 0 && (selectedDusun !== 'all' || selectedType !== 'all' || selectedStatus !== 'all') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDusun('all');
                                  setSelectedType('all');
                                  setSelectedStatus('all');
                                }}
                                className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-900"
                              >
                                Reset Filter untuk menampilkan semua
                              </button>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredReports.map((report) => (
                          <tr key={report.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                              {report.ticketNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{report.title}</div>
                              <div className="text-[11px] text-slate-500">{report.dusun}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-800">{report.reporterName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{report.reporterPhone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                                  report.status === 'selesai'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : report.status === 'dalam_pengerjaan'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : report.status === 'disetujui_kades'
                                    ? 'bg-sky-100 text-sky-800'
                                    : report.status === 'terverifikasi'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : report.status === 'duplikat'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {report.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => openDetail(report)}
                                className="px-2.5 py-1 font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              >
                                Periksa & Tindak Lanjut
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Tiket Surat</th>
                        <th className="py-3 px-4">Pemohon</th>
                        <th className="py-3 px-4">Jenis & Keperluan Surat</th>
                        <th className="py-3 px-4">Tanggal Pengajuan</th>
                        <th className="py-3 px-4">Status Berkas</th>
                        <th className="py-3 px-4 text-right">Aksi Alur Pelayanan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {letters.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            Belum ada permohonan surat administrasi yang diajukan oleh warga.
                          </td>
                        </tr>
                      ) : (
                        letters.map((letItem) => (
                          <tr key={letItem.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">
                              {letItem.ticketNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{letItem.applicantName}</div>
                              <div className="text-[11px] text-slate-500 font-mono">NIK: {letItem.applicantNik}</div>
                              <div className="text-[10px] text-slate-400">{letItem.dusun} • {letItem.applicantPhone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">{letItem.letterType}</div>
                              <div className="text-[11px] text-slate-500 line-clamp-1 italic">
                                &quot;{letItem.purpose}&quot;
                              </div>
                              {letItem.businessType && (
                                <div className="text-[10px] text-emerald-700 font-medium">
                                  Usaha: {letItem.businessType}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                              {new Date(letItem.createdAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  letItem.status === 'selesai'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : letItem.status === 'ditandatangani_kades'
                                    ? 'bg-purple-100 text-purple-800'
                                    : letItem.status === 'diproses'
                                    ? 'bg-blue-100 text-blue-800'
                                    : letItem.status === 'ditolak'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {letItem.status === 'menunggu_verifikasi' && <Clock className="w-3 h-3" />}
                                {letItem.status === 'diproses' && <FileText className="w-3 h-3" />}
                                {letItem.status === 'ditandatangani_kades' && <FileCheck className="w-3 h-3" />}
                                {letItem.status === 'selesai' && <CheckCircle2 className="w-3 h-3" />}
                                {letItem.status === 'ditolak' && <XCircle className="w-3 h-3" />}
                                <span>{letItem.status.replace(/_/g, ' ').toUpperCase()}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {letItem.status === 'menunggu_verifikasi' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateLetterStatus(
                                        letItem.id,
                                        'diproses',
                                        'Berkas persyaratan pemohon sedang diperiksa dan diverifikasi oleh petugas pelayanan desa.'
                                      )
                                    }
                                    className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                                  >
                                    Proses Berkas
                                  </button>
                                )}
                                {letItem.status === 'diproses' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateLetterStatus(
                                        letItem.id,
                                        'ditandatangani_kades',
                                        'Berkas lengkap dan telah diajukan ke meja Kepala Desa untuk penandatanganan dan cap resmi.'
                                      )
                                    }
                                    className="px-2.5 py-1 text-[11px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                                  >
                                    Naikkan TTD Kades
                                  </button>
                                )}
                                {letItem.status === 'ditandatangani_kades' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateLetterStatus(
                                        letItem.id,
                                        'selesai',
                                        'Surat telah selesai ditandatangani dan dicap resmi. Silakan pemohon datang ke Balai Desa membawa KTP/KK asli.',
                                        'Hari kerja Senin - Jumat pukul 08.00 - 15.00 WIB'
                                      )
                                    }
                                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition"
                                  >
                                    Selesai (Siap Diambil)
                                  </button>
                                )}
                                {letItem.status !== 'selesai' && letItem.status !== 'ditolak' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateLetterStatus(
                                        letItem.id,
                                        'ditolak',
                                        'Data atau persyaratan belum sesuai. Silakan menghubungi petugas kantor desa untuk melengkapi berkas.'
                                      )
                                    }
                                    className="px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                                  >
                                    Tolak
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LAPORAN SAYA (WARGA) */}
        {activeTab === 'riwayat_saya' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat Layanan Saya
                </h3>
                <p className="text-xs text-slate-500">
                  Pantau proses pengaduan fasilitas umum dan status berkas permohonan surat administrasi Anda secara transparan.
                </p>
              </div>

              {/* Sub-tab Switcher: Pengaduan Saya vs Surat Saya */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setMySubTab('pengaduan')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    mySubTab === 'pengaduan'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pengaduan Fasilitas ({myReports.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMySubTab('surat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    mySubTab === 'surat'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Permohonan Surat ({myLetters.length})</span>
                </button>
              </div>
            </div>

            {mySubTab === 'pengaduan' ? (
              myReports.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <p className="text-xs text-slate-500">
                    {currentUser
                      ? `Tidak ada laporan pengaduan fasilitas yang terdaftar atas nama ${currentUser.name}.`
                      : 'Silakan masuk terlebih dahulu untuk melihat riwayat laporan Anda.'}
                  </p>
                  {currentUser && (
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition"
                    >
                      Ajukan Pengaduan Sekarang
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => openDetail(report)}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {report.ticketNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 capitalize">
                          {report.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{report.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{report.description}</p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>{report.dusun}</span>
                        <span>{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              myLetters.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <p className="text-xs text-slate-500">
                    {currentUser
                      ? `Belum ada pengajuan permohonan surat administrasi atas nama ${currentUser.name}.`
                      : 'Silakan masuk terlebih dahulu untuk melihat riwayat surat administrasi Anda.'}
                  </p>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setIsAuthModalOpen(true);
                      } else {
                        setIsAdministrasiModalOpen(true);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition"
                  >
                    Ajukan Permohonan Surat Online
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myLetters.map((letItem) => (
                    <div
                      key={letItem.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                          {letItem.ticketNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            letItem.status === 'selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : letItem.status === 'ditandatangani_kades'
                              ? 'bg-purple-100 text-purple-800'
                              : letItem.status === 'diproses'
                              ? 'bg-blue-100 text-blue-800'
                              : letItem.status === 'ditolak'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {letItem.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{letItem.letterType}</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          <span className="text-slate-400 font-medium">Keperluan: </span>
                          {letItem.purpose}
                        </p>
                        {letItem.businessType && (
                          <p className="text-xs text-emerald-700 font-medium mt-0.5">
                            Bidang Usaha: {letItem.businessType}
                          </p>
                        )}
                      </div>

                      {letItem.pickupSchedule && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                          <div className="font-semibold flex items-center gap-1 text-emerald-800">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Jadwal Pengambilan Dokumen:</span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-emerald-700 font-medium">
                            {letItem.pickupSchedule} di Kantor Balai Desa Simandulang.
                          </p>
                        </div>
                      )}

                      {letItem.officerNotes && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                          <span className="font-semibold text-slate-900">Catatan Petugas: </span>
                          <span>{letItem.officerNotes}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{letItem.dusun}</span>
                        <span>{new Date(letItem.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 5: REKAP & MONITORING DESA */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Laporan Rekapitulasi & Monitoring Penanganan Infrastruktur
                </h3>
                <p className="text-xs text-slate-500">
                  Data statistik berkala untuk bahan evaluasi Musrenbangdes Desa Simandulang.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition shadow-xs self-start sm:self-auto"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Dokumen Rekap
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Sebaran Laporan & Progres Penanganan Per Dusun
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Kawasan Wilayah Desa</th>
                      <th className="py-3 px-4 text-center">Total Laporan</th>
                      <th className="py-3 px-4 text-center">Survei Lapangan</th>
                      <th className="py-3 px-4 text-center">Pengerjaan</th>
                      <th className="py-3 px-4 text-center">Selesai</th>
                      <th className="py-3 px-4 text-right">Alokasi Anggaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(['Dusun I', 'Dusun II', 'Dusun III', 'Dusun IV', 'Dusun V'] as const).map((dsn) => {
                      const dsnReports = reports.filter((r) => r.dusun === dsn);
                      const verified = dsnReports.filter((r) => r.status === 'terverifikasi' || r.status === 'disetujui_kades').length;
                      const inProg = dsnReports.filter((r) => r.status === 'dalam_pengerjaan').length;
                      const completed = dsnReports.filter((r) => r.status === 'selesai').length;
                      const budget = dsnReports.reduce((acc, r) => acc + (r.disposition?.approvedBudget || 0), 0);

                      let subName = '';
                      if (dsn === 'Dusun I') subName = 'Kawasan Pesisir Pantai';
                      if (dsn === 'Dusun II') subName = 'Kawasan Pusat Balai Desa';
                      if (dsn === 'Dusun III') subName = 'Kawasan Sei Puyuh';
                      if (dsn === 'Dusun IV') subName = 'Kawasan Pemukiman Gori';
                      if (dsn === 'Dusun V') subName = 'Kawasan Sentra Tambak & Rawa';

                      return (
                        <tr key={dsn} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {subName}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                            {dsnReports.length}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-sky-700 font-semibold">
                            {verified}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-indigo-700 font-semibold">
                            {inProg}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-800 font-bold">
                            {completed}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            Rp {budget.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-slate-900 uppercase tracking-wider text-xs">
                        TOTAL KESELURUHAN (SEMUA WILAYAH)
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 text-sm">
                        {reports.length}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sky-800 text-sm">
                        {reports.filter((r) => r.status === 'terverifikasi' || r.status === 'disetujui_kades').length}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-800 text-sm">
                        {reports.filter((r) => r.status === 'dalam_pengerjaan').length}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-800 text-sm">
                        {reports.filter((r) => r.status === 'selesai').length}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-950 text-sm">
                        Rp {reports.reduce((acc, r) => acc + (r.disposition?.approvedBudget || 0), 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )}

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 text-center sm:text-left">
          <div>
            <strong>SIPANDAI Desa:</strong> Sistem Informasi Pelayanan & Aspirasi Warga Desa Simandulang
          </div>
          <div>
            Kec. Kualuh Leidong, Kab. Labuhanbatu Utara • Layanan Administrasi, Pengaduan Terpadu & Asisten Pintar SiPandai
          </div>
        </div>
      </footer>

      {/* 9. PUSAT BANTUAN INFORMASI WARGA DESA (INPUT BEBAS WARGA) */}
      <AiAssistantWidget
        reports={reports}
        sawResults={sawResults}
        letters={letters}
        isOpenExternal={forceOpenAi}
        onOpenReportModal={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
          } else {
            setIsReportModalOpen(true);
          }
        }}
        onOpenSawModal={() => setIsSawModalOpen(true)}
        onNavigateToTab={(tab) => {
          setViewMode('layanan');
          setActiveTab(tab);
        }}
        onSelectReport={openDetail}
      />

      {/* MODALS LAYANAN DIGITAL PORTAL DESA */}
      <AdministrasiModal
        isOpen={isAdministrasiModalOpen}
        onClose={() => setIsAdministrasiModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSubmitLetter={handleCreateLetter}
      />

      <PerpajakanModal
        isOpen={isPerpajakanModalOpen}
        onClose={() => setIsPerpajakanModalOpen(false)}
        totalAllocatedBudget={stats.totalBudget}
      />

      <BansosModal
        isOpen={isBansosModalOpen}
        onClose={() => setIsBansosModalOpen(false)}
        onOpenPengaduanBansos={() => {
          setViewMode('layanan');
          if (!currentUser) {
            setIsAuthModalOpen(true);
          } else {
            setIsReportModalOpen(true);
          }
        }}
      />

      <ProfilDesaModal
        isOpen={isProfilDesaModalOpen}
        onClose={() => setIsProfilDesaModalOpen(false)}
        onGoToMap={() => {
          setViewMode('layanan');
          setActiveTab('peta');
        }}
      />

      {/* ALL MODALS */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        allUsers={users}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {currentUser && (
        <ReportModal
          isOpen={isReportModalOpen}
          currentUser={currentUser}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleCreateReport}
        />
      )}

      <VerificationModal
        report={selectedReport}
        allReports={reports}
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onSubmit={handleVerifyReport}
        onMarkDuplicate={handleMarkDuplicate}
      />

      <SawBreakdownModal
        isOpen={isSawModalOpen}
        onClose={() => setIsSawModalOpen(false)}
        sawResults={sawResults}
      />

      <KadesDispositionModal
        report={selectedReport}
        saw={sawResults.find((s) => s.reportId === selectedReport?.id) || null}
        isOpen={isDispositionModalOpen}
        onClose={() => setIsDispositionModalOpen(false)}
        onSubmit={handleKadesDisposition}
      />

      <AssignmentModal
        report={selectedReport}
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onAssignOfficer={handleAssignOfficer}
        onCompleteReport={handleCompleteReport}
      />

      <ReportDetailModal
        report={selectedReport}
        saw={sawResults.find((s) => s.reportId === selectedReport?.id) || null}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        currentUser={currentUser}
        userRole={currentUser?.role || 'warga'}
        onToggleSupport={handleToggleSupport}
        onNavigateRoute={handleNavigateRoute}
        onFocusLocation={handleFocusLocation}
        onOpenVerification={(rep) => {
          setSelectedReport(rep);
          setIsVerifyModalOpen(true);
        }}
        onOpenDisposition={(rep) => {
          setSelectedReport(rep);
          setIsDispositionModalOpen(true);
        }}
        onOpenAssignment={(rep) => {
          setSelectedReport(rep);
          setIsAssignmentModalOpen(true);
        }}
      />
    </div>
  );
}
