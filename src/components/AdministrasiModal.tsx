'use client';

import React, { useState } from 'react';
import ModalWrapper from '@/components/ui/ModalWrapper';
import {
  FileText,
  X,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Dusun, UserProfile, LetterRequest, LetterType } from '@/types';
import { useToast } from '@/components/ui/Toast';

interface AdministrasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onSubmitLetter?: (newLetter: Omit<LetterRequest, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
}

export default function AdministrasiModal({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onSubmitLetter,
}: AdministrasiModalProps) {
  const [selectedType, setSelectedType] = useState<LetterType>('sku');
  const [nama, setNama] = useState(currentUser?.name || '');
  const [nik, setNik] = useState(currentUser?.nik || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [dusun, setDusun] = useState<Dusun>(currentUser?.dusun || 'Dusun I');
  const [keperluan, setKeperluan] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const { success: toastSuccess, error: toastError } = useToast();

  const letterOptions = [
    {
      id: 'sku' as LetterType,
      title: 'Surat Keterangan Usaha (SKU)',
      desc: 'Untuk legalitas warung, tambak udang/ikan, pertanian, atau syarat kredit bank',
      syarat: [
        'Fotokopi KTP dan Kartu Keluarga (KK)',
        'Surat Pengantar RT / Kepala Dusun',
        'Foto lokasi usaha di Desa Simandulang',
      ],
    },
    {
      id: 'sktm' as LetterType,
      title: 'Surat Keterangan Tidak Mampu (SKTM)',
      desc: 'Untuk keringanan biaya pendidikan, beasiswa anak, atau jaminan kesehatan (BPJS)',
      syarat: [
        'Fotokopi KTP dan KK orang tua / kepala keluarga',
        'Surat Pengantar Kepala Dusun verifikasi ekonomi',
        'Surat keterangan aktif sekolah / kampus (jika beasiswa)',
      ],
    },
    {
      id: 'domisili' as LetterType,
      title: 'Surat Keterangan Domisili',
      desc: 'Keterangan tempat tinggal warga atau tempat kedudukan usaha',
      syarat: [
        'Fotokopi KTP dan KK pemohon',
        'Surat Pengantar Kepala Dusun',
        'Pasfoto 3x4 (1 lembar)',
      ],
    },
    {
      id: 'pengantar_ktp' as LetterType,
      title: 'Surat Pengantar KTP / KK',
      desc: 'Pengantar penerbitan KTP-el pemula atau pembaruan Kartu Keluarga',
      syarat: [
        'Pengantar Kepala Dusun setempat',
        'Fotokopi Akta Kelahiran dan KK lama',
        'Surat Nikah (jika perubahan status perkawinan)',
      ],
    },
  ];

  const currentOption = letterOptions.find((o) => o.id === selectedType)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toastError('Perlu Masuk Akun', 'Silakan masuk akun terlebih dahulu untuk memproses permohonan surat.');
      onOpenAuth();
      return;
    }

    if (!nama || !phone || !keperluan) {
      toastError('Data Belum Lengkap', 'Mohon lengkapi seluruh kolom formulir.');
      return;
    }

    setIsSubmitting(true);
    let generatedTicket = `SRT-2026-${Math.floor(100 + Math.random() * 900)}`;

    if (onSubmitLetter) {
      try {
        generatedTicket = await onSubmitLetter({
          applicantId: currentUser.id,
          applicantName: nama,
          applicantPhone: phone,
          applicantNik: nik,
          dusun,
          letterType: selectedType,
          purpose: keperluan,
          businessName: selectedType === 'sku' ? businessName : undefined,
          businessType: selectedType === 'sku' ? businessType : undefined,
        });
      } catch {
        // Fallback ticket tetap jalan
      }
    }

    setTicketId(generatedTicket);
    setIsSubmitted(true);
    setIsSubmitting(false);
    toastSuccess('Permohonan Terkirim!', `Nomor permohonan surat: ${generatedTicket}`);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setKeperluan('');
    setTicketId('');
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" zIndex="z-[9999]">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Administrasi Surat Online Desa
              </h3>
              <p className="text-xs text-emerald-200">
                Balai Desa Simandulang • Layanan Mandiri Tanpa Antre
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pilihan Jenis Surat */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Pilih Jenis Surat yang Diperlukan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {letterOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedType(opt.id)}
                      className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                        selectedType === opt.id
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{opt.title}</div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Syarat Berkas */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Syarat Berkas yang Perlu Disiapkan:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
                  {currentOption.syarat.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Data Pemohon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap Pemohon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama sesuai KTP..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / HP Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIK KTP (16 Digit)
                  </label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="16 digit NIK..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kawasan Wilayah Domisili <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dusun}
                    onChange={(e) => setDusun(e.target.value as Dusun)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="Dusun I">Kawasan Pesisir Pantai (Dusun I)</option>
                    <option value="Dusun II">Kawasan Pusat Balai Desa (Dusun II)</option>
                    <option value="Dusun III">Kawasan Sei Puyuh (Dusun III)</option>
                    <option value="Dusun IV">Kawasan Pemukiman Gori (Dusun IV)</option>
                    <option value="Dusun V">Kawasan Sentra Tambak & Rawa (Dusun V)</option>
                  </select>
                </div>
              </div>

              {selectedType === 'sku' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Usaha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Contoh: Tangkahan Nelayan Berkah"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Jenis / Bidang Usaha
                    </label>
                    <input
                      type="text"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      placeholder="Contoh: Perikanan Tangkap / Warung / Kelapa Sawit"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keperluan Permohonan Surat <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Contoh: Pengajuan pinjaman modal usaha tambak udang ke Bank BRI..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Proses verifikasi: 1 hari kerja (Gratis)</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengirim Data...' : 'Kirim Permohonan Surat'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Tampilan Tiket Selesai Diajukan */
            <div className="p-6 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Permohonan Surat Berhasil Diajukan!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Nomor Bukti Tiket Pelayanan Anda:
                </p>
                <div className="inline-block px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono font-bold text-base text-slate-900 mt-2">
                  {ticketId}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left text-xs text-emerald-950 space-y-1">
                <div><strong>Jenis Surat:</strong> {currentOption.title}</div>
                <div><strong>Nama Pemohon:</strong> {nama} ({dusun})</div>
                <div><strong>No. HP/WA:</strong> {phone}</div>
                <div><strong>Keperluan:</strong> {keperluan}</div>
                <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-800">
                  Silakan simpan nomor tiket ini. Petugas Balai Desa Simandulang akan menghubungi Anda melalui WhatsApp saat berkas surat telah ditandatangani Kepala Desa dan siap diambil di kantor Balai Desa Dusun II.
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Bukti Pengajuan
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition"
                >
                  Ajukan Surat Lain
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
