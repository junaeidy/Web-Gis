'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Dusun,
  InfrastructureType,
  KadesDisposition,
  Report,
  ReportEvaluation,
  ReportStatus,
  UserProfile,
  UserRole,
} from '@/types';
import { MOCK_USERS, INITIAL_REPORTS, INITIAL_EVALUATIONS } from '@/data/mock-data';
import { calculateSAW } from '@/lib/saw';
import ReportModal from '@/components/ReportModal';
import VerificationModal from '@/components/VerificationModal';
import SawBreakdownModal from '@/components/SawBreakdownModal';
import ReportDetailModal from '@/components/ReportDetailModal';
import AuthModal from '@/components/AuthModal';
import KadesDispositionModal from '@/components/KadesDispositionModal';
import AssignmentModal from '@/components/AssignmentModal';
import {
  MapPin,
  Plus,
  ShieldCheck,
  TrendingUp,
  FileText,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  BarChart3,
  ExternalLink,
  Info,
  User,
  Users,
  Building2,
  Wrench,
  ThumbsUp,
  Check,
  Printer,
  LogIn,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const DynamicMapView = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] sm:h-[460px] lg:h-[560px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-xs sm:text-sm text-slate-500 font-medium">
      Memuat Peta Spasial Desa Teluk Pulai Luar...
    </div>
  ),
});

export default function Home() {
  // State User & Auth Sistem
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(MOCK_USERS[0]); // Default login sebagai Warga 1
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // State Laporan & SAW
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [evaluations, setEvaluations] = useState<ReportEvaluation[]>(INITIAL_EVALUATIONS);
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
  const [pendingSupportReportId, setPendingSupportReportId] = useState<string | null>(null);

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

  // Laporan Milik Warga yang Sedang Login
  const myReports = useMemo(() => {
    if (!currentUser) return [];
    return reports.filter((r) => r.reporterId === currentUser.id);
  }, [reports, currentUser]);

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

  // HANDLERS AUTH
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (pendingSupportReportId) {
      const targetId = pendingSupportReportId;
      setPendingSupportReportId(null);
      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== targetId) return r;
          const currentSupportList = r.supportedUserIds || [];
          if (currentSupportList.includes(user.id)) return r;
          const updated = [...currentSupportList, user.id];
          return {
            ...r,
            supportedUserIds: updated,
            upvotes: updated.length,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      const targetReport = reports.find((r) => r.id === targetId);
      if (targetReport) {
        setSelectedReport({
          ...targetReport,
          supportedUserIds: [...(targetReport.supportedUserIds || []), user.id],
          upvotes: (targetReport.upvotes || 0) + 1,
        });
        setIsDetailModalOpen(true);
      }
    }
  };

  const handleRegisterSuccess = (newUser: UserProfile) => {
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    if (pendingSupportReportId) {
      const targetId = pendingSupportReportId;
      setPendingSupportReportId(null);
      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== targetId) return r;
          const currentSupportList = r.supportedUserIds || [];
          const updated = [...currentSupportList, newUser.id];
          return {
            ...r,
            supportedUserIds: updated,
            upvotes: updated.length,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      const targetReport = reports.find((r) => r.id === targetId);
      if (targetReport) {
        setSelectedReport({
          ...targetReport,
          supportedUserIds: [...(targetReport.supportedUserIds || []), newUser.id],
          upvotes: (targetReport.upvotes || 0) + 1,
        });
        setIsDetailModalOpen(true);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // HANDLERS DUKUNGAN (1 ORANG 1 DUKUNGAN + BISA UNDO)
  const handleToggleSupport = (reportId: string) => {
    if (!currentUser) {
      setPendingSupportReportId(reportId);
      setIsDetailModalOpen(false); // Tutup modal detail agar tidak bertumpuk
      setIsAuthModalOpen(true);
      return;
    }

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;

        const currentSupportList = r.supportedUserIds || [];
        const alreadySupported = currentSupportList.includes(currentUser.id);

        const updatedUserIds = alreadySupported
          ? currentSupportList.filter((id) => id !== currentUser.id)
          : [...currentSupportList, currentUser.id];

        const updatedReport = {
          ...r,
          supportedUserIds: updatedUserIds,
          upvotes: updatedUserIds.length,
          updatedAt: new Date().toISOString(),
        };

        if (selectedReport?.id === reportId) {
          setSelectedReport(updatedReport);
        }

        return updatedReport;
      })
    );
  };

  // Step 2 & 3: Warga Mengirim Laporan
  const handleCreateReport = (
    newReportData: Omit<Report, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    const newId = `rpt-${Date.now()}`;
    const nextNum = (reports.length + 1).toString().padStart(3, '0');
    const newReport: Report = {
      ...newReportData,
      id: newId,
      ticketNumber: `TPL-2026-${nextNum}`,
      status: 'menunggu_verifikasi',
      supportedUserIds: currentUser ? [currentUser.id] : [],
      upvotes: currentUser ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
    setActiveTab('peta');
  };

  // Step 5 & 6: Admin Verifikasi & Skoring SAW
  const handleVerifyReport = (evaluationData: Omit<ReportEvaluation, 'id' | 'verifiedAt'>) => {
    const newEval: ReportEvaluation = {
      ...evaluationData,
      id: `eval-${Date.now()}`,
      verifiedAt: new Date().toISOString(),
    };

    setEvaluations((prev) => [
      ...prev.filter((e) => e.reportId !== evaluationData.reportId),
      newEval,
    ]);
    setReports((prev) =>
      prev.map((r) =>
        r.id === evaluationData.reportId
          ? { ...r, status: 'terverifikasi' as ReportStatus, updatedAt: new Date().toISOString() }
          : r
      )
    );
  };

  // Step 5: Tandai Laporan Duplikat
  const handleMarkDuplicate = (reportId: string, originalTicket: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'duplikat' as ReportStatus,
              duplicateOfTicket: originalTicket,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  // Step 8: Disposisi Kepala Desa
  const handleKadesDisposition = (disposition: KadesDisposition) => {
    if (!selectedReport) return;
    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReport.id
          ? {
              ...r,
              status: 'disetujui_kades' as ReportStatus,
              disposition,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  // Step 9: Penetapan Petugas Lapangan
  const handleAssignOfficer = (reportId: string, officer: string, department: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'dalam_pengerjaan' as ReportStatus,
              assignedOfficer: officer,
              assignedDepartment: department,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  // Step 10: Unggah Dokumentasi & Tandai Selesai
  const handleCompleteReport = (reportId: string, completionPhotoUrl: string, notes: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'selesai' as ReportStatus,
              completionPhotoUrl,
              completionNotes: notes,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const openDetail = (report: Report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. TOP NAVBAR (RESPONSIF MOBILE-FIRST) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo & Identitas */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-2xs">
                SIP
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
                  Lapor & Prioritas Perbaikan Fasilitas Desa
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                  Desa Teluk Pulai Luar • Kec. Kualuh Leidong
                </p>
              </div>
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
                    {/* <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded hidden sm:inline-block">
                      Ganti Akun
                    </span> */}
                  </button>

                  <button
                    onClick={handleLogout}
                    title="Keluar"
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Masuk / Daftar
                </button>
              )}

              {/* Tombol Lapor */}
              <button
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                  } else {
                    setIsReportModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Lapor</span> Kerusakan
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. STATISTIK MONITORING CEPAT (BAHASA AWAM & JELAS) */}
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

      {/* 3. TABS NAVIGASI (HORIZONTAL SCROLL DI MOBILE) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-2 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          {/* Scrollable Tab Container */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('peta')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                activeTab === 'peta'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Peta Fasilitas Desa
            </button>

            <button
              onClick={() => setActiveTab('saw')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                activeTab === 'saw'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Antrean Prioritas Perbaikan
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] rounded-full">
                {sawResults.length}
              </span>
            </button>

            {currentUser && currentUser.role !== 'warga' && (
              <button
                onClick={() => setActiveTab('laporan')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                  activeTab === 'laporan'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Pemeriksaan Petugas
                {stats.pending > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full">
                    {stats.pending}
                  </span>
                )}
              </button>
            )}

            {currentUser && (
              <button
                onClick={() => setActiveTab('riwayat_saya')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                  activeTab === 'riwayat_saya'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Laporan Saya ({myReports.length})
              </button>
            )}

            <button
              onClick={() => setActiveTab('monitoring')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                activeTab === 'monitoring'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Rekapitulasi Desa
            </button>
          </div>

          {/* Filter Wilayah */}
          <div className="flex items-center gap-2 text-xs self-end md:self-auto w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDusun}
              onChange={(e) => setSelectedDusun(e.target.value)}
              className="flex-1 md:flex-initial px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Semua Dusun</option>
              <option value="Dusun I">Dusun I</option>
              <option value="Dusun II">Dusun II</option>
              <option value="Dusun III">Dusun III</option>
              <option value="Dusun IV">Dusun IV</option>
              <option value="Dusun V">Dusun V</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 md:flex-initial px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              <option value="jalan_poros">Jalan Poros</option>
              <option value="jalan_lingkungan">Jalan Lingkungan</option>
              <option value="jembatan">Jembatan</option>
              <option value="drainase_tanggul_rob">Tanggul Rob</option>
              <option value="dermaga_tangkahan">Tangkahan Nelayan</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. MAIN CONTENT */}
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
                hideLegend={isAnyModalOpen}
                className="h-[360px] sm:h-[480px] lg:h-[560px] w-full rounded-2xl border border-slate-200 shadow-xs"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col h-[340px] sm:h-[480px] lg:h-[560px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Titik Infrastruktur ({filteredReports.length})
                </h3>
                <span className="text-[11px] text-slate-400">Pilih titik untuk zoom</span>
              </div>

              <div className="overflow-y-auto divide-y divide-slate-100 flex-1 pr-1 mt-2 space-y-1">
                {filteredReports.map((report) => {
                  const saw = sawResults.find((s) => s.reportId === report.id);
                  const isSelected = selectedReport?.id === report.id;
                  const hasSupported = Boolean(
                    currentUser && report.supportedUserIds?.includes(currentUser.id)
                  );

                  return (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-2.5 rounded-xl cursor-pointer transition text-xs ${
                        isSelected
                          ? 'bg-slate-100 ring-1 ring-slate-300'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-[11px] text-slate-500 font-semibold">
                          {report.ticketNumber}
                        </span>
                        {saw ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              saw.rank === 1
                                ? 'bg-red-100 text-red-700'
                                : saw.rank <= 3
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            Prioritas #{saw.rank}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 capitalize">
                            {report.status.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 leading-snug line-clamp-1">
                        {report.title}
                      </h4>
                      <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                        {report.dusun} • {report.addressDetail || 'Lokasi terdata GPS'}
                      </p>
                      <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100/60">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(report);
                          }}
                          className="text-[11px] text-sky-700 font-semibold hover:underline"
                        >
                          Lihat Rincian
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSupport(report.id);
                          }}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded transition flex items-center gap-1 ${
                            hasSupported
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                          title={hasSupported ? 'Klik untuk batalkan dukungan' : 'Dukung laporan ini'}
                        >
                          <ThumbsUp className={`w-3 h-3 ${hasSupported ? 'fill-current' : ''}`} />
                          <span>{report.upvotes} {hasSupported ? 'Didukung' : 'Dukungan'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REKOMENDASI PRIORITAS SAW */}
        {activeTab === 'saw' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Daftar Urutan Prioritas Perbaikan Fasilitas Desa
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ditentukan secara adil & objektif berdasarkan tingkat kerusakan fisik, akses utama nelayan/warga, bahaya banjir pasang rob, dan efisiensi biaya.
                </p>
              </div>
              <button
                onClick={() => setIsSawModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition shadow-xs shrink-0"
              >
                <Layers className="w-3.5 h-3.5" />
                Lihat Transparansi & Bukti Hitungan
              </button>
            </div>

            {/* Versi Card untuk Layar Kecil / Mobile */}
            <div className="block lg:hidden space-y-3">
              {sawResults.map((item) => (
                <div
                  key={item.reportId}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        item.rank === 1
                          ? 'bg-red-600 text-white'
                          : item.rank <= 3
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Prioritas Ke-{item.rank}
                    </span>
                    <span className="font-mono text-slate-500 font-semibold">{item.report.ticketNumber}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.report.title}</h4>
                  <div className="text-slate-500 text-[11px]">{item.report.dusun}</div>
                  
                  <div className="flex items-center justify-between bg-emerald-50 p-2 rounded-lg text-emerald-950">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Kebutuhan Mendesak:</span>
                      <strong className="text-sm font-bold text-emerald-900">{(item.score * 100).toFixed(0)} / 100</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Taksiran Biaya:</span>
                      <span className="font-mono font-bold text-xs">Rp {item.evaluation.verifiedCostRupiah.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 capitalize">
                      {item.report.disposition ? item.report.disposition.decision.replace(/_/g, ' ') : 'Menunggu Keputusan Kades'}
                    </span>
                    <button
                      onClick={() => openDetail(item.report)}
                      className="text-sky-700 font-bold hover:underline"
                    >
                      Rincian
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Versi Tabel untuk Layar Desktop */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Urutan Antrean</th>
                      <th className="py-3 px-4">Kode Tiket</th>
                      <th className="py-3 px-4">Fasilitas Rusak & Dusun</th>
                      <th className="py-3 px-4">Tingkat Mendesak</th>
                      <th className="py-3 px-4">Taksiran Biaya</th>
                      <th className="py-3 px-4">Keputusan Kepala Desa</th>
                      <th className="py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sawResults.map((item) => (
                      <tr
                        key={item.reportId}
                        className={item.rank === 1 ? 'bg-emerald-50/70 font-medium' : 'hover:bg-slate-50'}
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                              item.rank === 1
                                ? 'bg-red-600 text-white shadow-xs'
                                : item.rank === 2
                                ? 'bg-orange-600 text-white shadow-xs'
                                : item.rank === 3
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            #{item.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 font-semibold">
                          {item.report.ticketNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.report.title}</div>
                          <div className="text-[11px] text-slate-500">{item.report.dusun}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-emerald-900 text-sm">
                            {(item.score * 100).toFixed(0)} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Nilai hitung: {item.score.toFixed(4)}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-900 font-semibold">
                          Rp {item.evaluation.verifiedCostRupiah.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4">
                          {item.report.disposition ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 capitalize">
                              {item.report.disposition.decision.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                              Menunggu Keputusan Kades
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {currentUser && currentUser.role === 'kepala_desa' && !item.report.disposition ? (
                            <button
                              onClick={() => {
                                setSelectedReport(item.report);
                                setIsDispositionModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition"
                            >
                              Disposisi
                            </button>
                          ) : (
                            <button
                              onClick={() => openDetail(item.report)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition"
                            >
                              Detail
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PANEL ADMIN & VERIFIKASI (STEP 5, 6, 9) */}
        {activeTab === 'laporan' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Panel Kerja Perangkat Desa & Verifikator
                </h3>
                <p className="text-xs text-slate-500">
                  Pemeriksaan laporan, deteksi duplikasi, skoring SAW, dan penugasan tim pengerjaan.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">No. Tiket</th>
                      <th className="py-3 px-4">Judul & Dusun</th>
                      <th className="py-3 px-4">Pelapor</th>
                      <th className="py-3 px-4">Status Alur</th>
                      <th className="py-3 px-4 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((report) => (
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
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openDetail(report)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                          >
                            Detail
                          </button>

                          {report.status === 'menunggu_verifikasi' && (
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setIsVerifyModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-md transition"
                            >
                              Verifikasi
                            </button>
                          )}

                          {report.status === 'disetujui_kades' && (
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setIsAssignmentModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-md transition"
                            >
                              Tugaskan
                            </button>
                          )}

                          {report.status === 'dalam_pengerjaan' && (
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setIsAssignmentModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition"
                            >
                              Bukti Selesai
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RIWAYAT LAPORAN SAYA (STEP 11) */}
        {activeTab === 'riwayat_saya' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat & Status Laporan Saya
                </h3>
                <p className="text-xs text-slate-500">
                  Pantau perkembangan tindak lanjut dari laporan infrastruktur Anda.
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" /> Lapor Baru
              </button>
            </div>

            {myReports.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Belum ada laporan dari akun Anda.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Kirimkan laporan kerusakan pertama Anda untuk memantau prosesnya di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                            {report.ticketNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {report.dusun}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900">{report.title}</h4>
                      </div>
                      <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 capitalize">
                        {report.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Progress Timeline Stepper */}
                    <div className="py-1">
                      <div className="grid grid-cols-5 text-center text-[9px] sm:text-[11px] font-semibold text-slate-500 gap-1">
                        <div className="text-emerald-700">1. Diterima</div>
                        <div className={report.status !== 'menunggu_verifikasi' ? 'text-emerald-700' : 'text-slate-400'}>
                          2. Diverifikasi
                        </div>
                        <div
                          className={
                            ['disetujui_kades', 'dalam_pengerjaan', 'selesai'].includes(report.status)
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }
                        >
                          3. Disetujui
                        </div>
                        <div
                          className={
                            ['dalam_pengerjaan', 'selesai'].includes(report.status)
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }
                        >
                          4. Pengerjaan
                        </div>
                        <div className={report.status === 'selesai' ? 'text-emerald-700' : 'text-slate-400'}>
                          5. Selesai
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden flex">
                        <div
                          className={`h-full bg-emerald-600 transition-all ${
                            report.status === 'selesai'
                              ? 'w-full'
                              : report.status === 'dalam_pengerjaan'
                              ? 'w-4/5'
                              : report.status === 'disetujui_kades'
                              ? 'w-3/5'
                              : report.status === 'terverifikasi'
                              ? 'w-2/5'
                              : 'w-1/5'
                          }`}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {report.description}
                    </p>

                    {/* Tampilkan Foto Sebelum & Sesudah jika Selesai */}
                    {report.status === 'selesai' && report.completionPhotoUrl && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="font-bold text-xs text-emerald-950 mb-2">
                          Foto Bukti Hasil Pengerjaan:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <img
                            src={report.photoUrl}
                            alt="Sebelum"
                            className="h-28 sm:h-36 w-full object-cover rounded-lg border border-slate-200"
                          />
                          <img
                            src={report.completionPhotoUrl}
                            alt="Sesudah"
                            className="h-28 sm:h-36 w-full object-cover rounded-lg border border-emerald-300"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
                  Data statistik berkala untuk bahan evaluasi Musrenbangdes Desa Teluk Pulai Luar.
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
                      <th className="py-2.5 px-4">Wilayah Dusun</th>
                      <th className="py-2.5 px-4 text-center">Total</th>
                      <th className="py-2.5 px-4 text-center">Menunggu</th>
                      <th className="py-2.5 px-4 text-center">Pengerjaan</th>
                      <th className="py-2.5 px-4 text-center">Selesai</th>
                      <th className="py-2.5 px-4 text-right">Pagu Teralokasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {['Dusun I', 'Dusun II', 'Dusun III', 'Dusun IV', 'Dusun V'].map((dsn) => {
                      const dsnReports = reports.filter((r) => r.dusun === dsn);
                      const pending = dsnReports.filter((r) => r.status === 'menunggu_verifikasi').length;
                      const inProgress = dsnReports.filter((r) => r.status === 'dalam_pengerjaan').length;
                      const completed = dsnReports.filter((r) => r.status === 'selesai').length;
                      const budget = dsnReports.reduce(
                        (acc, curr) => acc + (curr.disposition?.approvedBudget || 0),
                        0
                      );

                      return (
                        <tr key={dsn} className="hover:bg-slate-50 font-sans">
                          <td className="py-3 px-4 font-bold text-slate-900">{dsn}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                            {dsnReports.length}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-amber-700 font-semibold">
                            {pending}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-sky-800 font-semibold">
                            {inProgress}
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
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 text-center sm:text-left">
          <div>
            Proyek Riset Smart Village: <strong>Web-GIS & SPK Prioritas Infrastruktur</strong>
          </div>
          <div>
            Studi Kasus: <strong>Desa Teluk Pulai Luar</strong>, Kec. Kualuh Leidong, Kab. Labuhanbatu Utara
          </div>
        </div>
      </footer>

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
