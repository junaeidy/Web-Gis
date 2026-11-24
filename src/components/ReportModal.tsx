'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Dusun, InfrastructureType, Report, UserProfile } from '@/types';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { MapPin, Navigation, AlertCircle, X, Shield, Upload, Image as ImageIcon } from 'lucide-react';
import { VILLAGE_CENTER } from '@/data/geo-simandulang';
import { useToast } from '@/components/ui/Toast';

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
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" zIndex="z-[9999]">
      {isOpen && (
        <ReportForm
          currentUser={currentUser}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </ModalWrapper>
  );
}

function ReportForm({
  currentUser,
  onClose,
  onSubmit,
}: {
  currentUser: UserProfile;
  onClose: () => void;
  onSubmit: (newReport: Omit<Report, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => void;
}) {
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

  const { error: toastError, success: toastSuccess } = useToast();

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Perangkat atau browser tidak mendukung fitur Geolocation.');
      toastError('GPS Tidak Didukung', 'Browser tidak mendukung pendeteksi lokasi otomatis.');
      return;
    }

    setIsGettingLocation(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setCoords({ lat, lng });
        setIsGettingLocation(false);
        toastSuccess('Koordinat Terdeteksi', `Titik GPS [${lat}, ${lng}] berhasil diambil.`);
      },
      () => {
        setIsGettingLocation(false);
        setErrorMsg('Gagal mengambil titik GPS. Silakan tentukan titik langsung di peta.');
        toastError('Gagal Mengambil GPS', 'Silakan pilih titik lokasi kerusakan langsung pada peta.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 5MB.');
      toastError('Ukuran File Terlalu Besar', 'Maksimal ukuran foto adalah 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhotoUrl(uploadEvent.target?.result as string);
      toastSuccess('Foto Berhasil Diunggah', 'Foto dokumentasi kerusakan berhasil dimuat.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setErrorMsg('Mohon lengkapi judul dan deskripsi kerusakan.');
      toastError('Data Belum Lengkap', 'Mohon lengkapi judul dan deskripsi kerusakan fasilitas.');
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
      latitude: coords.lat,
      longitude: coords.lng,
      addressDetail: addressDetail.trim() || undefined,
      photoUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    });

    onClose();
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-700" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Formulir Lapor Kerusakan Fasilitas Desa
            </h3>
            <p className="text-xs text-slate-500">
              Desa Simandulang • Akun Pelapor: <strong>{currentUser.name}</strong>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Info Pelapor & Privasi */}
        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-700" /> Identitas Pelapor Terverifikasi
            </span>
            <span className="text-[11px] bg-emerald-200/60 text-emerald-900 font-medium px-2 py-0.5 rounded">
              Warga {dusun}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">Nama:</span>
              <input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-emerald-300 rounded font-medium text-slate-800"
              />
            </div>
            <div>
              <span className="text-slate-500 block">No. HP / WA:</span>
              <input
                type="text"
                required
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-emerald-300 rounded font-medium text-slate-800"
              />
            </div>
            <div>
              <span className="text-slate-500 block">NIK KTP:</span>
              <input
                type="text"
                value={reporterNik}
                onChange={(e) => setReporterNik(e.target.value)}
                placeholder="16 digit NIK..."
                className="w-full px-2 py-1 bg-white border border-emerald-300 rounded font-medium text-slate-800"
              />
            </div>
          </div>
          <div className="pt-1 border-t border-emerald-200/50">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-emerald-950 font-medium">
              <input
                type="checkbox"
                checked={hideIdentity}
                onChange={(e) => setHideIdentity(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-600"
              />
              Samarkan Nama & Kontak Saya di Peta Publik (Rekomendasi Privasi)
            </label>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Identitas Anda hanya dapat dilihat oleh Perangkat Desa Simandulang untuk keperluan verifikasi. Pengunjung umum hanya akan melihat &ldquo;Warga {dusun} (Anonim)&rdquo;.
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
              <option value="Dusun I">Dusun I (Simandulang Pantai / Pesisir)</option>
              <option value="Dusun II">Dusun II (Pusat Balai Desa & Pasar)</option>
              <option value="Dusun III">Dusun III (Sei Puyuh)</option>
              <option value="Dusun IV">Dusun IV (Dusun Gori / Kebun Sawit)</option>
              <option value="Dusun V">Dusun V (Tambak & Rawa Pasang Surut)</option>
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
            placeholder="Contoh: Tanggul Parit Sei Puyuh Jebol Dihantam Pasang Rob Air Laut"
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
            placeholder="Jelaskan kondisi fisik kerusakan, apakah menghambat perahu nelayan, anak sekolah, atau memicu banjir air asin..."
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
            placeholder="Contoh: 100 meter dari tangkahan nelayan Simandulang Pantai"
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
            Klik pada peta wilayah Desa Simandulang untuk menancapkan pin koordinat kerusakan.
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

        {/* Upload Foto Bukti Kerusakan */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
          <label className="block font-semibold text-slate-700">
            Foto Bukti Kerusakan (Kamera / Unggah Foto)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg text-slate-700 font-medium text-xs transition shadow-xs">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Pilih Foto dari Galeri / Kamera</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-400">atau masukkan URL langsung:</span>
          </div>

          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://... (atau biarkan kosong untuk gambar standar)"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs"
          />

          {photoUrl && (
            <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
              <img
                src={photoUrl}
                alt="Preview Kerusakan"
                className="w-16 h-16 object-cover rounded-md border border-slate-100"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Foto Terlampir
                </span>
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-red-600 hover:underline text-[11px] mt-1"
                >
                  Hapus Foto
                </button>
              </div>
            </div>
          )}
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
    </>
  );
}
