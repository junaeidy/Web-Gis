'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Dusun, InfrastructureType, Report, UserProfile, ComplaintClassification, PrivacyLevel } from '@/types';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { MapPin, Navigation, AlertCircle, X, Shield, Upload, Image as ImageIcon, MessageSquare, Lightbulb, Info, Calendar, Lock, Eye, EyeOff } from 'lucide-react';
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
  const [classification, setClassification] = useState<ComplaintClassification>('pengaduan');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('anonim');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);

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
      setErrorMsg('Perangkat atau browser tidak mendukung pendeteksi lokasi otomatis.');
      toastError('Lokasi Tidak Didukung', 'Perangkat tidak mendukung pendeteksi lokasi otomatis.');
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
        toastSuccess('Lokasi Ditemukan', 'Titik lokasi Anda berhasil dicatat.');
      },
      () => {
        setIsGettingLocation(false);
        setErrorMsg('Gagal mendeteksi lokasi otomatis. Silakan tentukan titik langsung di peta.');
        toastError('Gagal Mengambil Lokasi', 'Silakan sentuh atau klik titik lokasi langsung pada peta.');
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
      classification,
      incidentDate,
      privacyLevel,
      hideReporterIdentity: privacyLevel !== 'publik',
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
              Formulir Pengaduan & Aspirasi Masyarakat Desa
            </h3>
            <p className="text-xs text-slate-500">
              Desa Simandulang • Layanan Pengaduan Digital Terpadu • Akun Pelapor: <strong>{currentUser.name}</strong>
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

        {/* 1. KLASIFIKASI LAPORAN (SEPERTI HALO TABALONG / SP4N LAPOR) */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5 text-xs uppercase tracking-wider">
            Jenis Laporan / Klasifikasi
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setClassification('pengaduan')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-center ${
                classification === 'pengaduan'
                  ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold shadow-xs ring-2 ring-rose-400/30'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${classification === 'pengaduan' ? 'text-rose-600' : 'text-slate-400'}`} />
              <span className="text-xs">Pengaduan</span>
              <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">Keluhan Fasilitas / Layanan</span>
            </button>

            <button
              type="button"
              onClick={() => setClassification('aspirasi')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-center ${
                classification === 'aspirasi'
                  ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold shadow-xs ring-2 ring-sky-400/30'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Lightbulb className={`w-4 h-4 ${classification === 'aspirasi' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="text-xs">Aspirasi</span>
              <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">Usulan & Ide Warga</span>
            </button>

            <button
              type="button"
              onClick={() => setClassification('informasi')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-center ${
                classification === 'informasi'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs ring-2 ring-emerald-400/30'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Info className={`w-4 h-4 ${classification === 'informasi' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-xs">Permintaan Info</span>
              <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">Tanya Syarat / Regulasi</span>
            </button>
          </div>
        </div>

        {/* 2. PENGATURAN PRIVASI & KERAHASIAAN IDENTITAS (HALO TABALONG STYLE) */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-700" /> Pengaturan Privasi & Kerahasiaan
            </span>
            <span className="text-[11px] text-slate-500">Pilih visibilitas laporan</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className={`p-2 rounded-lg border cursor-pointer flex items-center gap-1.5 text-xs transition ${
              privacyLevel === 'publik'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-400'
                : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <input
                type="radio"
                name="privacy"
                value="publik"
                checked={privacyLevel === 'publik'}
                onChange={() => setPrivacyLevel('publik')}
                className="text-emerald-700 focus:ring-emerald-600"
              />
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-500" /> Publik</span>
            </label>

            <label className={`p-2 rounded-lg border cursor-pointer flex items-center gap-1.5 text-xs transition ${
              privacyLevel === 'anonim'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-400'
                : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <input
                type="radio"
                name="privacy"
                value="anonim"
                checked={privacyLevel === 'anonim'}
                onChange={() => setPrivacyLevel('anonim')}
                className="text-emerald-700 focus:ring-emerald-600"
              />
              <span className="flex items-center gap-1"><EyeOff className="w-3.5 h-3.5 text-emerald-700" /> Anonim</span>
            </label>

            <label className={`p-2 rounded-lg border cursor-pointer flex items-center gap-1.5 text-xs transition ${
              privacyLevel === 'rahasia'
                ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-1 ring-rose-400'
                : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <input
                type="radio"
                name="privacy"
                value="rahasia"
                checked={privacyLevel === 'rahasia'}
                onChange={() => setPrivacyLevel('rahasia')}
                className="text-rose-700 focus:ring-rose-600"
              />
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-rose-600" /> Rahasia</span>
            </label>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {privacyLevel === 'publik' && 'Nama Anda ditampilkan pada laporan publik agar dapat dibaca dan didukung oleh sesama warga desa.'}
            {privacyLevel === 'anonim' && 'Nama Anda disamarkan sebagai "Warga Simandulang (Anonim)" pada tampilan peta publik demi kenyamanan.'}
            {privacyLevel === 'rahasia' && 'Laporan bersifat tertutup/privat dan hanya dapat dilihat oleh Anda serta Kepala Desa / Petugas Desa.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Nama Lengkap:</span>
              <input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
              />
            </div>
            <div>
              <span className="text-slate-500 block">No. WhatsApp / HP:</span>
              <input
                type="text"
                required
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="08xxxxxxxx"
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
              />
            </div>
            <div>
              <span className="text-slate-500 block">NIK KTP (Verifikasi):</span>
              <input
                type="text"
                value={reporterNik}
                onChange={(e) => setReporterNik(e.target.value)}
                placeholder="16 digit NIK..."
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* 3. KATEGORI & WILAYAH KAWASAN KEJADIAN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block font-semibold text-slate-700 mb-1">
              Kategori Laporan <span className="text-red-500">*</span>
            </label>
            <select
              value={infrastructureType}
              onChange={(e) => setInfrastructureType(e.target.value as InfrastructureType)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs"
            >
              <optgroup label="Fasilitas & Infrastruktur Fisik">
                <option value="jalan_poros">Jalan Poros Utama Desa</option>
                <option value="jalan_lingkungan">Jalan Lingkungan / Gang</option>
                <option value="jembatan">Jembatan Kayu / Beton</option>
                <option value="drainase_tanggul_rob">Tanggul Penahan Rob / Saluran Air</option>
                <option value="dermaga_tangkahan">Dermaga / Tangkahan Nelayan</option>
                <option value="fasilitas_umum">Fasilitas Publik / Balai Warga</option>
              </optgroup>
              <optgroup label="Kebersihan, Pelayanan & Sosial">
                <option value="kebersihan_sampah">Kebersihan Lingkungan & Sampah</option>
                <option value="pelayanan_administrasi">Pelayanan Kantor Balai Desa</option>
                <option value="bantuan_sosial">Bantuan Sosial (Bansos / BLT)</option>
                <option value="keamanan_ketertiban">Penerangan Jalan & Ketertiban</option>
                <option value="aspirasi_pembangunan">Aspirasi & Usulan Pembangunan</option>
              </optgroup>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="block font-semibold text-slate-700 mb-1">
              Kawasan Wilayah <span className="text-red-500">*</span>
            </label>
            <select
              value={dusun}
              onChange={(e) => setDusun(e.target.value as Dusun)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs"
            >
              <option value="Dusun I">Kawasan Pesisir & Muara Pantai (Dusun I)</option>
              <option value="Dusun II">Kawasan Pusat Balai Desa & Pasar (Dusun II)</option>
              <option value="Dusun III">Kawasan Sei Puyuh (Dusun III)</option>
              <option value="Dusun IV">Kawasan Pemukiman Gori (Dusun IV)</option>
              <option value="Dusun V">Kawasan Sentra Tambak & Rawa (Dusun V)</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="block font-semibold text-slate-700 mb-1">
              Tanggal Kejadian
            </label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Judul Pengaduan / Keluhan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Tumpukan sampah liar di muara / Jembatan Sei Puyuh lapuk / Keterlambatan pelayanan"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Deskripsi Pengaduan & Dampak Terhadap Warga <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan rincian keluhan, lokasi kejadian, dampak bagi masyarakat luas, atau usulan solusi..."
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

        {/* Pemilihan Titik Lokasi Pada Peta */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" /> Tentukan Titik Lokasi di Peta
            </span>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-md transition shadow-xs disabled:opacity-50"
            >
              <Navigation className="w-3 h-3" />
              {isGettingLocation ? 'Mencari Lokasi...' : 'Lokasi Saya'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Sentuh atau klik pada peta Desa Simandulang untuk menandai lokasi kejadian.
          </p>
          <div className="h-44 w-full rounded-lg overflow-hidden border border-slate-200">
            <DynamicMapPicker
              isPickerMode={true}
              pickedLocation={coords}
              onPickLocation={setCoords}
              className="h-full w-full"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
            <span className="text-emerald-800 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> Titik Lokasi Terpilih
            </span>
            <span className="font-mono text-slate-400 text-[10px]">({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})</span>
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
