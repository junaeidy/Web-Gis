'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Report, SAWResult } from '@/types';
import { SIMANDULANG_BOUNDARY, VILLAGE_CENTER } from '@/data/geo-simandulang';

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
  // GIS Route props
  activeRouteReport?: Report | null;
  onClearRoute?: () => void;
  onNavigateRoute?: (report: Report) => void;
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
  activeRouteReport,
  onClearRoute,
  onNavigateRoute,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  // State untuk GIS Routing
  const [originType, setOriginType] = useState<'village_hall' | 'user_gps'>('village_hall');
  const [userGps, setUserGps] = useState<[number, number] | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeStats, setRouteStats] = useState<{
    distanceKm: number;
    durationMin: number;
    isFallback?: boolean;
  } | null>(null);

  // Inisialisasi peta Leaflet
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
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | GIS Desa Simandulang',
      maxZoom: 19,
    }).addTo(map);

    // Tambahkan layer poligon batas administrasi Desa Simandulang
    L.geoJSON(SIMANDULANG_BOUNDARY, {
      style: {
        color: '#0284c7', // Sky-600
        weight: 2,
        opacity: 0.85,
        fillColor: '#0ea5e9',
        fillOpacity: 0.08,
        dashArray: '4, 4',
      },
    }).addTo(map);

    // Layer grup rute GIS (di bawah markers)
    const routeGroup = L.layerGroup().addTo(map);
    routeLayerRef.current = routeGroup;

    // Layer grup marker laporan
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      routeLayerRef.current = null;
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

  // Request GPS pengguna
  const handleRequestGps = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Browser tidak mendukung pendeteksi GPS.');
      return;
    }
    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserGps([pos.coords.latitude, pos.coords.longitude]);
        setOriginType('user_gps');
        setIsLocatingGps(false);
      },
      (err) => {
        setIsLocatingGps(false);
        setGpsError('Izin GPS ditolak atau tidak tersedia. Memakai Balai Desa.');
        setOriginType('village_hall');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Hitung dan gambar rute navigasi GIS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerRef.current;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();

    if (!activeRouteReport) {
      setRouteStats(null);
      return;
    }

    let isCancelled = false;
    setRouteLoading(true);

    const destCoords: [number, number] = [activeRouteReport.latitude, activeRouteReport.longitude];
    const originCoords: [number, number] =
      originType === 'user_gps' && userGps
        ? userGps
        : [VILLAGE_CENTER[0], VILLAGE_CENTER[1]];

    const originLng = originCoords[1];
    const originLat = originCoords[0];
    const destLng = destCoords[1];
    const destLat = destCoords[0];

    // Helper Haversine distance
    const calcHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const renderRouteLayers = (
      points: [number, number][],
      distKm: number,
      durMin: number,
      isFallback: boolean
    ) => {
      if (isCancelled || !mapInstanceRef.current || !routeLayerRef.current) return;
      const group = routeLayerRef.current;
      group.clearLayers();

      // Outer border / glow line
      L.polyline(points, {
        color: '#0f172a',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      // Main route polyline (Emerald)
      L.polyline(points, {
        color: '#059669',
        weight: 5,
        opacity: 0.95,
        dashArray: isFallback ? '6, 6' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      // Origin Marker
      const originIcon = L.divIcon({
        className: 'custom-route-start-icon',
        html: `
          <div class="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white rounded-lg shadow-lg border border-slate-600 text-[11px] font-bold whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>${originType === 'user_gps' ? 'Posisi GPS Anda' : 'Balai Desa'}</span>
          </div>
        `,
        iconSize: [110, 28],
        iconAnchor: [55, 14],
      });
      L.marker(originCoords, { icon: originIcon }).addTo(group);

      // Destination Marker
      const destIcon = L.divIcon({
        className: 'custom-route-dest-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-red-400 opacity-75"></span>
            <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-xl border-2 border-white font-bold text-xs">
              🎯
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker(destCoords, { icon: destIcon }).addTo(group);

      // Zoom & fit bounds
      const bounds = L.latLngBounds([originCoords, destCoords, ...points]);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 16,
      });

      setRouteStats({ distanceKm: distKm, durationMin: durMin, isFallback });
      setRouteLoading(false);
    };

    // Ambil data geometri jalan dari OSRM
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    fetch(osrmUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('OSRM error');
        return res.json();
      })
      .then((data) => {
        clearTimeout(timeoutId);
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          );
          const distKm = Number((route.distance / 1000).toFixed(2));
          const durMin = Math.max(1, Math.round(route.duration / 60));
          renderRouteLayers(coords, distKm, durMin, false);
        } else {
          throw new Error('No route');
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        // Fallback geodesik garis langsung
        const distKm = Number(calcHaversine(originLat, originLng, destLat, destLng).toFixed(2));
        const durMin = Math.max(1, Math.round((distKm / 30) * 60));
        renderRouteLayers([originCoords, destCoords], distKm, durMin, true);
      });

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [activeRouteReport, originType, userGps]);

  // Render markers laporan & hasil SAW
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup || isPickerMode) return;

    markersGroup.clearLayers();

    reports.forEach((report) => {
      const saw = sawResults.find((s) => s.reportId === report.id);
      const isSelected = selectedReport?.id === report.id;
      const isRouteTarget = activeRouteReport?.id === report.id;

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
            isSelected || isRouteTarget ? 'scale-125 z-50' : 'hover:scale-110'
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
          <div class="text-[10px] text-slate-400 mb-2">
            Pelapor: ${report.hideReporterIdentity ? `Warga ${report.dusun} (Anonim)` : report.reporterName}
          </div>

          <!-- Tombol Aksi Spasial / Rute GIS dalam Popup -->
          <button
            type="button"
            id="btn-popup-route-${report.id}"
            class="w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
          >
            🧭 Tampilkan Rute GIS
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Event klik marker
      marker.on('click', () => {
        if (onSelectReport) {
          onSelectReport(report);
        }
      });

      // Bind tombol rute dalam popup saat popup terbuka
      marker.on('popupopen', () => {
        const btnRoute = document.getElementById(`btn-popup-route-${report.id}`);
        if (btnRoute) {
          btnRoute.onclick = (e) => {
            e.stopPropagation();
            map.closePopup();
            if (onNavigateRoute) {
              onNavigateRoute(report);
            }
          };
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [reports, sawResults, selectedReport, activeRouteReport, onSelectReport, onNavigateRoute, isPickerMode]);

  // Center ke laporan terpilih jika bukan mode rute aktif
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedReport || activeRouteReport) return;
    map.flyTo([selectedReport.latitude, selectedReport.longitude], 15, {
      duration: 1.2,
    });
  }, [selectedReport, activeRouteReport]);

  const activeOriginCoords: [number, number] =
    originType === 'user_gps' && userGps
      ? userGps
      : [VILLAGE_CENTER[0], VILLAGE_CENTER[1]];

  return (
    <div className="relative isolate w-full h-full">
      <div ref={mapContainerRef} className={className} />

      {/* Floating Card: Kontrol Rute Spasial GIS */}
      {activeRouteReport && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-400 bg-white/95 backdrop-blur-md border border-emerald-300 rounded-2xl p-3.5 shadow-xl text-xs text-slate-800 max-w-[340px] w-[calc(100%-24px)] sm:w-[340px] pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
            <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span>Rute Navigasi GIS Desa</span>
            </div>
            {onClearRoute && (
              <button
                type="button"
                onClick={onClearRoute}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-sm font-bold leading-none"
                title="Tutup & Hapus Garis Rute"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mt-2.5">
            <div className="text-[11px] font-mono font-semibold text-slate-500">
              {activeRouteReport.ticketNumber} • {activeRouteReport.dusun}
            </div>
            <div className="font-bold text-slate-900 text-xs line-clamp-1 mt-0.5">
              {activeRouteReport.title}
            </div>
          </div>

          {/* Metric Jarak & Estimasi */}
          <div className="mt-2.5 grid grid-cols-2 gap-2 p-2 bg-emerald-50/70 border border-emerald-100 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-500 block">Jarak Tempuh:</span>
              <span className="text-xs font-bold text-emerald-950 font-mono">
                {routeLoading
                  ? 'Menghitung...'
                  : routeStats
                  ? `${routeStats.distanceKm} km`
                  : '-'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Estimasi Waktu:</span>
              <span className="text-xs font-bold text-emerald-950 font-mono">
                {routeLoading
                  ? '...'
                  : routeStats
                  ? `~${routeStats.durationMin} menit`
                  : '-'}
              </span>
            </div>
          </div>

          {/* Pilihan Titik Keberangkatan */}
          <div className="mt-2.5">
            <div className="text-[10px] font-semibold text-slate-500 mb-1">
              Titik Keberangkatan:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setOriginType('village_hall')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition text-center ${
                  originType === 'village_hall'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🏢 Balai Desa
              </button>
              <button
                type="button"
                onClick={handleRequestGps}
                disabled={isLocatingGps}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition text-center ${
                  originType === 'user_gps'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {isLocatingGps ? 'Mencari GPS...' : '📱 Lokasi GPS'}
              </button>
            </div>
            {gpsError && (
              <div className="text-[10px] text-amber-700 mt-1">{gpsError}</div>
            )}
          </div>

          {/* Tombol External Google Maps & Hapus */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${activeOriginCoords[0]},${activeOriginCoords[1]}&destination=${activeRouteReport.latitude},${activeRouteReport.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800 hover:underline"
            >
              <span>🧭 Buka di Google Maps</span>
              <span>↗</span>
            </a>
            {onClearRoute && (
              <button
                type="button"
                onClick={onClearRoute}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
              >
                Hapus Rute
              </button>
            )}
          </div>
        </div>
      )}

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
            Batas biru: Wilayah Desa Simandulang
          </div>
        </div>
      )}
    </div>
  );
}
