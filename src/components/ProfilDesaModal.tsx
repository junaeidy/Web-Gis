'use client';

import React from 'react';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { Globe, X, MapPin, Users, Fish, TreePine, ShieldCheck } from 'lucide-react';

interface ProfilDesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToMap: () => void;
}

export default function ProfilDesaModal({
  isOpen,
  onClose,
  onGoToMap,
}: ProfilDesaModalProps) {
  const dusunList = [
    {
      nama: 'Kawasan Pesisir & Muara Pantai',
      icon: Fish,
      karakter: 'Pemukiman panggung pesisir Selat Malaka, pangkalan perahu & tangkahan nelayan tangkap tradisional. Zona paling rentan pasang rob.',
      kk: '± 280 KK',
    },
    {
      nama: 'Kawasan Pusat Balai Desa',
      icon: Users,
      karakter: 'Pusat administrasi desa, kantor kepala desa, sekolah dasar, pasar harian, dan pertokoan kelontong warga.',
      kk: '± 340 KK',
    },
    {
      nama: 'Kawasan Perkebunan Sei Puyuh',
      icon: TreePine,
      karakter: 'Kawasan perkebunan kelapa dan sawit rakyat, anak sungai muara, serta jalur logistik darat antar-wilayah.',
      kk: '± 210 KK',
    },
    {
      nama: 'Kawasan Pemukiman Gori',
      icon: TreePine,
      karakter: 'Area perkampungan dan perkebunan swadaya masyarakat dengan akses jalan tanah dan gang penghubung lingkungan.',
      kk: '± 195 KK',
    },
    {
      nama: 'Kawasan Sentra Tambak & Rawa',
      icon: Fish,
      karakter: 'Sentra budidaya tambak udang vaname dan ikan air payau, didukung jaringan parit drainase utama penahan pasang.',
      kk: '± 165 KK',
    },
  ];

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" zIndex="z-[9999]">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <Globe className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Profil & Karakteristik Desa Simandulang
              </h3>
              <p className="text-xs text-emerald-200">
                Kec. Kualuh Leidong, Kab. Labuhanbatu Utara, Sumatera Utara
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700">
          {/* Ringkasan Geografis */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <div className="font-bold text-xs text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Karakteristik Wilayah Pesisir Maritim
            </div>
            <p className="text-emerald-900 leading-relaxed text-xs">
              Desa Simandulang terletak di muara perairan Selat Malaka, Kecamatan Kualuh Leidong. Mayoritas penduduk bermata pencaharian sebagai <strong>nelayan tangkap tradisional, petambak udang/ikan, serta petani kelapa dan sawit</strong>. Wilayah ini memiliki karakteristik tanah rawa/gambut dengan tantangan pasang surut air laut (banjir rob).
            </p>
          </div>

          {/* Karakteristik Kawasan Wilayah Desa */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-2">
              Kawasan Lingkungan & Potensi Wilayah Desa
            </h4>
            <div className="space-y-2.5">
              {dusunList.map((d, idx) => {
                const Icon = d.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3"
                  >
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{d.nama}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                          {d.kk}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {d.karakter}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tombol Lihat Peta */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Lihat sebaran seluruh kawasan wilayah langsung pada peta interaktif desa.
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToMap();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              Buka Peta Wilayah Desa
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
