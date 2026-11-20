'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Report, SAWResult } from '@/types';
import { TELUK_PULAI_LUAR_BOUNDARY, VILLAGE_CENTER } from '@/data/geo-teluk-pulai-luar';

interface MapViewProps {
  reports?: Report[];
  sawResults?: SAWResult[];
  selectedReport?: Report | null;
  onSelectReport?: (report: Report) => void;
  // Picker mode props
  isPickerMode?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
  hideLegend?: boolean;
  className?: string;
}

export default function MapView({
  reports = [],
  sawResults = [],
  selectedReport,
  onSelectReport,
  isPickerMode = false,
  pickedLocation,
  onPickLocation,
  hideLegend = false,
  className = 'h-[500px] w-full rounded-xl border border-slate-200 shadow-sm overflow-hidden',
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Inisialisasi peta
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: VILLAGE_CENTER,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Basemap: OpenStreetMap dengan rendering tajam
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | GIS Desa Teluk Pulai Luar',
      maxZoom: 19,
    }).addTo(map);

    // Tambahkan layer poligon batas administrasi Desa Teluk Pulai Luar
    L.geoJSON(TELUK_PULAI_LUAR_BOUNDARY, {
      style: {
        color: '#0284c7', // Sky-600
        weight: 2,
        opacity: 0.85,
        fillColor: '#0ea5e9',
        fillOpacity: 0.08,
        dashArray: '4, 4',
      },
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handler klik peta untuk Picker Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isPickerMode || !onPickLocation) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPickerMode, onPickLocation]);

  // Update marker picker saat user memilih titik
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isPickerMode) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }

    if (pickedLocation) {
      const pickerIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg border-2 border-white font-bold text-xs">
              📍
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      pickerMarkerRef.current = L.marker([pickedLocation.lat, pickedLocation.lng], {
        icon: pickerIcon,
      }).addTo(map);

      map.panTo([pickedLocation.lat, pickedLocation.lng], { animate: true });
    }
  }, [isPickerMode, pickedLocation]);

  // Render markers laporan & hasil SAW
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup || isPickerMode) return;

    markersGroup.clearLayers();

    reports.forEach((report) => {
      const saw = sawResults.find((s) => s.reportId === report.id);
      const isPriorityTop3 = saw && saw.rank <= 3;
      const isSelected = selectedReport?.id === report.id;

      // Desain warna pin berdasarkan status & ranking
      let badgeBg = 'bg-slate-700';
      let pinText = '•';

      if (report.status === 'menunggu_verifikasi') {
        badgeBg = 'bg-amber-500';
        pinText = '⏳';
      } else if (saw) {
        if (saw.rank === 1) {
          badgeBg = 'bg-red-600';
          pinText = '#1';
        } else if (saw.rank === 2) {
          badgeBg = 'bg-orange-600';
          pinText = '#2';
        } else if (saw.rank === 3) {
          badgeBg = 'bg-amber-600';
          pinText = '#3';
        } else {
          badgeBg = 'bg-sky-700';
          pinText = `#${saw.rank}`;
        }
      }

      const customIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `
          <div class="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110'
          }">
            <div class="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md border-2 border-white font-semibold text-xs ${badgeBg}">
              ${pinText}
            </div>
            <div class="w-1.5 h-2 bg-slate-800 -mt-0.5"></div>
            <div class="w-2.5 h-1 bg-slate-900/30 rounded-full blur-[1px]"></div>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 38],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([report.latitude, report.longitude], {
        icon: customIcon,
      });

      // Konten Popup
      const popupHtml = `
        <div class="p-1 max-w-[260px] text-slate-800 font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
            <span class="text-[11px] font-mono font-semibold px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
              ${report.ticketNumber}
            </span>
            <span class="text-[11px] font-medium text-slate-500">${report.dusun}</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 leading-snug line-clamp-2 mb-1">
            ${report.title}
          </h4>
          <p class="text-xs text-slate-600 line-clamp-2 mb-2">
            ${report.description}
          </p>
          ${
            saw
              ? `
            <div class="bg-emerald-50 border border-emerald-200 rounded p-2 mb-2 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-emerald-700 block font-medium">Urutan Penanganan:</span>
                <span class="text-xs font-bold text-emerald-950">Prioritas Ke-${saw.rank}</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-slate-500 block">Tingkat Mendesak:</span>
                <span class="text-xs font-bold text-emerald-900">${(saw.score * 100).toFixed(0)} / 100</span>
              </div>
            </div>
          `
              : `
            <div class="bg-amber-50 border border-amber-200 rounded p-1.5 mb-2 text-center text-[11px] font-medium text-amber-800">
              Laporan Baru • Menunggu Survei Petugas
            </div>
          `
          }
          <div class="text-[10px] text-slate-400">
            Pelapor: ${report.hideReporterIdentity ? `Warga ${report.dusun} (Anonim)` : report.reporterName}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectReport) {
          onSelectReport(report);
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [reports, sawResults, selectedReport, onSelectReport, isPickerMode]);

  // Center ke laporan terpilih
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedReport) return;
    map.flyTo([selectedReport.latitude, selectedReport.longitude], 15, {
      duration: 1.2,
    });
  }, [selectedReport]);

  return (
    <div className="relative isolate w-full h-full">
      <div ref={mapContainerRef} className={className} />
      
      {/* Legend / Informasi Navigasi Peta */}
      {!isPickerMode && !hideLegend && (
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-2.5 shadow-md text-xs text-slate-700 flex flex-col gap-1.5 max-w-[210px] pointer-events-auto">
          <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider border-b border-slate-100 pb-1">
            Keterangan Peta
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-600 inline-block border border-white shadow-sm shrink-0"></span>
            <span>Prioritas #1 (Paling Mendesak)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-600 inline-block border border-white shadow-sm shrink-0"></span>
            <span>Prioritas #2 - #3 (Segera Ditangani)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-700 inline-block border border-white shadow-sm shrink-0"></span>
            <span>Prioritas #4+ (Jadwal Reguler)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500 inline-block border border-white shadow-sm shrink-0"></span>
            <span>Menunggu Pengecekan Lapangan</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
            Batas biru: Wilayah Desa Teluk Pulai Luar
          </div>
        </div>
      )}
    </div>
  );
}
