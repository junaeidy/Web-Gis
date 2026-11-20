'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Dusun, InfrastructureType, Report, UserProfile } from '@/types';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { MapPin, Navigation, AlertCircle, X, Shield, Lock } from 'lucide-react';
import { VILLAGE_CENTER } from '@/data/geo-teluk-pulai-luar';

const DynamicMapPicker = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-44 w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
      Memuat peta penunjuk lokasi...
    </div>
  ),
});

interface ReportModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onSubmit: (newReport: Omit<Report, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => void;
}

export default function ReportModal({
  isOpen,
  currentUser,
  onClose,
  onSubmit,
}: ReportModalProps) {
  const [reporterName, setReporterName] = useState(currentUser.name);
  const [reporterPhone, setReporterPhone] = useState(currentUser.phone);
  const [reporterNik, setReporterNik] = useState(currentUser.nik || '');
  const [hideIdentity, setHideIdentity] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [infrastructureType, setInfrastructureType] = useState<InfrastructureType>('jalan_poros');
  const [dusun, setDusun] = useState<Dusun>(currentUser.dusun);
  const [addressDetail, setAddressDetail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: VILLAGE_CENTER[0],
    lng: VILLAGE_CENTER[1],
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sinkronisasi data user saat modal terbuka
  useEffect(() => {
    setReporterName(currentUser.name);
    setReporterPhone(currentUser.phone);
    setReporterNik(currentUser.nik || '');
    setDusun(currentUser.dusun);
  }, [currentUser, isOpen]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Perangkat atau browser tidak mendukung fitur Geolocation.');
      return;
    }

    setIsGettingLocation(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
        setErrorMsg('Gagal mengambil titik GPS. Silakan tentukan titik langsung di peta.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setErrorMsg('Mohon lengkapi judul dan deskripsi kerusakan.');
      return;
    }

    onSubmit({
      reporterId: currentUser.id,
      reporterName,
      reporterPhone,
      reporterNik,
      hideReporterIdentity: hideIdentity,
      supportedUserIds: [currentUser.id],
      upvotes: 1,
      title,
      description,
      infrastructureType,
      dusun,
      addressDetail,
      photoUrl:
        photoUrl ||
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      latitude: coords.lat,
      longitude: coords.lng,
    });

    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" zIndex="z-[9999]">
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Formulir Lapor Kerusakan Infrastruktur Desa
          </h3>
          <p className="text-xs text-slate-500">
            Desa Teluk Pulai Luar • Akun Pelapor: <strong>{currentUser.name}</strong>
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Opsi Perlindungan Privasi */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
          <div>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
              <input
                type="checkbox"
                checked={hideIdentity}
                onChange={(e) => setHideIdentity(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-600"
              />
              Samarkan Nama & Kontak Saya di Peta Publik (Rekomendasi Privasi)
            </label>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Identitas Anda hanya dapat dilihat oleh Perangkat Desa untuk keperluan verifikasi. Pengunjung umum hanya akan melihat &ldquo;Warga {dusun} (Anonim)&rdquo;.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kategori Infrastruktur <span className="text-red-500">*</span>
            </label>
            <select
              value={infrastructureType}
              onChange={(e) => setInfrastructureType(e.target.value as InfrastructureType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            >
              <option value="jalan_poros">Jalan Poros Utama Desa</option>
              <option value="jalan_lingkungan">Jalan Lingkungan / Gang</option>
              <option value="jembatan">Jembatan Kayu / Beton</option>
              <option value="drainase_tanggul_rob">Tanggul Penahan Rob / Drainase</option>
              <option value="dermaga_tangkahan">Dermaga / Tangkahan Nelayan</option>
              <option value="fasilitas_umum">Fasilitas Umum Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Wilayah Dusun <span className="text-red-500">*</span>
            </label>
            <select
              value={dusun}
              onChange={(e) => setDusun(e.target.value as Dusun)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            >
              <option value="Dusun I">Dusun I (Pesisir Nelayan)</option>
              <option value="Dusun II">Dusun II (Pusat Balai Desa & Pasar)</option>
              <option value="Dusun III">Dusun III (Bantaran Muara & Rob)</option>
              <option value="Dusun IV">Dusun IV (Kawasan Perkebunan Sawit/Kelapa)</option>
              <option value="Dusun V">Dusun V (Tanjung Leidong Pesisir)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Judul Kerusakan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Tanggul Muara Parit Busuk Jebol Terkena Pasang Air Laut"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Deskripsi Kerusakan & Dampak Terhadap Warga <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan kondisi fisik kerusakan, apakah menghambat perahu nelayan, akses anak sekolah, atau memicu banjir air asin..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Patokan Alamat / Lokasi Spesifik
          </label>
          <input
            type="text"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            placeholder="Contoh: 100 meter di utara tangkahan ikan Dusun I"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        {/* Pemilihan Titik Spasial GIS */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" /> Tentukan Titik Kerusakan di Peta GIS
            </span>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-md transition shadow-xs disabled:opacity-50"
            >
              <Navigation className="w-3 h-3" />
              {isGettingLocation ? 'Mencari Titik GPS...' : 'Gunakan GPS HP'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Klik pada peta untuk menancapkan pin koordinat kerusakan.
          </p>
          <div className="h-44 w-full rounded-lg overflow-hidden border border-slate-200">
            <DynamicMapPicker
              isPickerMode={true}
              pickedLocation={coords}
              onPickLocation={setCoords}
              className="h-full w-full"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 font-mono bg-white px-2.5 py-1 rounded border border-slate-200">
            <span>Lat: {coords.lat.toFixed(6)}</span>
            <span>Lng: {coords.lng.toFixed(6)}</span>
          </div>
        </div>

        {/* URL Foto Bukti */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Foto Bukti Kerusakan (URL / Kamera)
          </label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://... (atau biarkan kosong untuk foto standar)"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        {/* Actions */}
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
            className="px-5 py-2 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-sm"
          >
            Kirim Laporan Kerusakan
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
