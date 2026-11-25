'use client';

import React from 'react';
import {
  FileText,
  ClipboardList,
  Receipt,
  HeartHandshake,
  Bot,
  Globe,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface LandingPortalProps {
  onOpenAdministrasi: () => void;
  onOpenPelayanan: () => void;
  onOpenPerpajakan: () => void;
  onOpenBansos: () => void;
  onOpenResepsionis: () => void;
  onOpenProfilDesa: () => void;
  onGoToMap: () => void;
}

export default function LandingPortal({
  onOpenAdministrasi,
  onOpenPelayanan,
  onOpenPerpajakan,
  onOpenBansos,
  onOpenResepsionis,
  onOpenProfilDesa,
  onGoToMap,
}: LandingPortalProps) {
  const menuItems = [
    {
      id: 'administrasi',
      title: 'Administrasi Online',
      description: 'Layanan Mandiri Surat Keterangan Usaha, SKTM, Domisili & Pengantar',
      icon: FileText,
      onClick: onOpenAdministrasi,
    },
    {
      id: 'pelayanan',
      title: 'Pelayanan Online',
      description: 'Pengaduan & Aspirasi Warga Berbasis Web-GIS Terintegrasi',
      icon: ClipboardList,
      onClick: onOpenPelayanan,
    },
    {
      id: 'perpajakan',
      title: 'Perpajakan Online',
      description: 'Informasi PBB-P2 & Transparansi Anggaran APBDes Simandulang',
      icon: Receipt,
      onClick: onOpenPerpajakan,
    },
    {
      id: 'bansos',
      title: 'Bansos Online',
      description: 'Pengecekan Bantuan Sosial, DTKS & Kriteria BLT Dana Desa',
      icon: HeartHandshake,
      onClick: onOpenBansos,
    },
    {
      id: 'resepsionis',
      title: 'Resepsionis',
      description: 'Asisten Virtual Pelayanan Cerdas Desa Simandulang Siap 24 Jam',
      icon: Bot,
      onClick: onOpenResepsionis,
    },
    {
      id: 'profil',
      title: 'Profil Wilayah Desa',
      description: 'Karakteristik Kawasan, Demografi Warga & Potensi Maritim',
      icon: Globe,
      onClick: onOpenProfilDesa,
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      {/* 1. BACKGROUND CITRA ALAM PEDESAAN DENGAN OVERLAY BERSIH */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        {/* Soft natural gradient overlay: highlights the lush green nature while ensuring text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-950/75 backdrop-blur-[1px]" />
      </div>

      {/* 2. KONTEN UTAMA PORTAL */}
      <div className="relative z-10 max-w-5xl w-full mx-auto flex flex-col items-center text-center space-y-6">
        {/* LOGO LAMBANG DESA / DAERAH (PENTAGON SHIELD SEPERTI DI GAMBAR) */}
        <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          <div className="relative w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center drop-shadow-xl">
            {/* Vektor Lambang Pentagon Hijau & Emas */}
            <svg
              viewBox="0 0 100 115"
              className="w-full h-full filter drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Shield Outer */}
              <polygon
                points="50,5 95,38 78,110 22,110 5,38"
                fill="#065f46"
                stroke="#fbbf24"
                strokeWidth="4"
              />
              {/* Inner Shield */}
              <polygon
                points="50,15 85,42 70,100 30,100 15,42"
                fill="#047857"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Bintang Emas */}
              <polygon
                points="50,22 53,30 62,30 55,35 58,43 50,38 42,43 45,35 38,30 47,30"
                fill="#fde047"
              />
              {/* Padi & Kapas / Lambang Kemakmuran */}
              <circle cx="50" cy="58" r="14" fill="#ffffff" opacity="0.9" />
              <path
                d="M 36,75 Q 50,60 64,75"
                stroke="#f59e0b"
                strokeWidth="3"
                fill="none"
              />
              {/* Pita Desa */}
              <rect x="30" y="80" width="40" height="9" rx="2" fill="#dc2626" />
              <text
                x="50"
                y="87"
                fill="#ffffff"
                fontSize="6"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                SIMANDULANG
              </text>
            </svg>
          </div>

          {/* JUDUL PORTAL SEPERTI PADA GAMBAR REFERENSI */}
          <h1 className="mt-3 text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            DIGITAL DESA SIMANDULANG
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-emerald-100 font-medium max-w-2xl px-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Pengembangan Layanan Digital Terintegrasi untuk Meningkatkan Akses Informasi dan Pelayanan Masyarakat
          </p>
        </div>

        {/* 3. GRID 6 KARTU LAYANAN (PERSIS SEPERTI GAMBAR REFERENSI) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 w-full pt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="group relative bg-[#046a56]/95 hover:bg-[#035948] text-white rounded-2xl p-5 sm:p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl border border-emerald-400/30 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer select-none backdrop-blur-xs"
              >
                {/* Ikon Layanan Garis Putih Bersih (Lucide) */}
                <div className="h-14 w-14 rounded-2xl bg-white/10 group-hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors duration-300 shadow-inner">
                  <Icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Judul Menu Layanan */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide group-hover:text-amber-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Indikator Aksi Cepat */}
                <div className="pt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-200 group-hover:text-white transition-colors">
                  <span>Buka Layanan</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* 4. FOOTNOTE / TOMBOL AKSES LANGSUNG KE PETA GIS */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-emerald-100">
          <button
            type="button"
            onClick={onGoToMap}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white font-semibold border border-emerald-400/40 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-xs"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Jelajahi Peta Wilayah & Titik Pengaduan Desa</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
