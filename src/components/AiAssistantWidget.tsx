'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  Database,
  FileText,
  MapPin,
  TrendingUp,
  Plus,
  HelpCircle,
} from 'lucide-react';
import { Report, SAWResult } from '@/types';
import { processUserQuery, AssistantResponse } from '@/lib/ai-assistant';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: AssistantResponse['source'];
  actionType?: AssistantResponse['actionType'];
  actionLabel?: string;
  targetReportId?: string;
}

interface AiAssistantWidgetProps {
  reports: Report[];
  sawResults: SAWResult[];
  isOpenExternal?: boolean;
  onOpenReportModal: () => void;
  onOpenSawModal: () => void;
  onNavigateToTab: (tab: 'peta' | 'saw' | 'laporan' | 'riwayat_saya' | 'monitoring') => void;
  onSelectReport: (report: Report) => void;
}

export default function AiAssistantWidget({
  reports,
  sawResults,
  isOpenExternal = false,
  onOpenReportModal,
  onOpenSawModal,
  onNavigateToTab,
  onSelectReport,
}: AiAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpenExternal) {
      setIsOpen(true);
    }
  }, [isOpenExternal]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      source: 'general_guide',
      text: `Halo! Saya **Pusat Bantuan Informasi Desa Simandulang**.

Layanan ini siap memberikan jawaban dan panduan seputar kebutuhan desa Anda, antara lain:
- **Syarat Surat:** SKU, SKTM, Surat Domisili, Pengantar KTP/KK
- **Jadwal & Lokasi:** Jam pelayanan kantor Balai Desa Simandulang
- **Cek Status Laporan:** Perkembangan laporan pengaduan (contoh: *#SMD-2026-001*) atau penanganan di *kawasan wilayah desa*
- **Pengaduan & Informasi Desa:** Pengaduan masalah desa (fasilitas, kebersihan, bansos), panduan banjir rob, dan urutan tindak lanjut desa

Silakan ketik pertanyaan Anda secara bebas pada kolom di bawah.`,
      timestamp: 'Online',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ke pesan terbawah
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Fokuskan input saat widget dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulasi jeda halus pembacaan algoritma (200-300ms) agar terasa responsif
    setTimeout(() => {
      const response = processUserQuery(trimmed, reports, sawResults);

      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        source: response.source,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        actionType: response.actionType,
        actionLabel: response.actionLabel,
        targetReportId: response.targetReportId,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = (msg: ChatMessage) => {
    if (!msg.actionType) return;

    if (msg.actionType === 'open_report') {
      onOpenReportModal();
    } else if (msg.actionType === 'open_saw') {
      onOpenSawModal();
    } else if (msg.actionType === 'open_map') {
      onNavigateToTab('peta');
    } else if (msg.actionType === 'focus_report' && msg.targetReportId) {
      const target = reports.find((r) => r.id === msg.targetReportId);
      if (target) {
        onSelectReport(target);
      }
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        source: 'general_guide',
        text: `Percakapan telah diatur ulang. Silakan ketikkan pertanyaan Anda secara bebas seputar layanan administrasi, jadwal kantor, bansos, mitigasi rob, atau status perbaikan fasilitas di Desa Simandulang.`,
        timestamp: 'Online',
      },
    ]);
  };

  // Render teks dengan format bold markdown sederhana dan baris baru
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={lIdx} className="block leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* 1. FLOATING BUTTON DI POJOK KANAN BAWAH */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 group flex items-center gap-2.5 px-4 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-emerald-600/30"
          aria-label="Buka Asisten AI Desa"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-wide flex items-center gap-1">
              Tanya Desa AI
              <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
            <span className="text-[10px] text-emerald-200 font-medium leading-none">
              Layanan Digital 24 Jam
            </span>
          </div>
        </button>
      )}

      {/* 2. CHAT WINDOW PANEL */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-w-[440px] h-[520px] sm:h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* HEADER CHAT */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0 shadow-inner">
                <Bot className="w-5 h-5 text-emerald-100" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                    Tanya Desa Simandulang
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700 text-[10px] font-medium">
                    Bantuan Warga
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Layanan Aktif 24 Jam • Siap Membantu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Mulai Ulang Percakapan"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Tutup Widget"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* INFORMASI LAYANAN RESMI DESA */}
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-3.5 py-1.5 flex items-center justify-between text-[10px] text-emerald-900">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Pusat Informasi Resmi Desa Simandulang
            </span>
            <span className="text-slate-500 font-medium">Layanan Warga</span>
          </div>

          {/* AREA PESAN PERCAKAPAN */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 shadow-2xs ${
                      isUser
                        ? 'bg-emerald-800 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {/* BADGE SUMBER DATA RESMI UNTUK ASISTEN DENGAN IKON LUCIDE */}
                    {!isUser && (
                      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100 text-[10px] font-semibold">
                        {msg.source === 'database_live' ? (
                          <>
                            <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-emerald-800 font-bold">Data Pengaduan Warga</span>
                          </>
                        ) : msg.source === 'knowledge_base' ? (
                          <>
                            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-emerald-800 font-bold">Informasi Pelayanan Desa</span>
                          </>
                        ) : (
                          <>
                            <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-700 font-bold">Panduan Pelayanan Warga</span>
                          </>
                        )}
                      </div>
                    )}

                    <div className="text-[12px]">{renderFormattedText(msg.text)}</div>

                    {/* TOMBOL AKSI JIKA TERSEDIA DENGAN IKON LUCIDE */}
                    {!isUser && msg.actionType && msg.actionLabel && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleActionClick(msg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition shadow-2xs"
                        >
                          {msg.actionType === 'open_map' || msg.actionType === 'focus_report' ? (
                            <MapPin className="w-3 h-3 shrink-0" />
                          ) : msg.actionType === 'open_saw' ? (
                            <TrendingUp className="w-3 h-3 shrink-0" />
                          ) : msg.actionType === 'open_report' ? (
                            <Plus className="w-3 h-3 shrink-0" />
                          ) : (
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          )}
                          <span>{msg.actionLabel}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              );
            })}

            {/* INDIKATOR ALGORITMA MEMPROSES */}
            {isTyping && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 text-slate-500 text-[11px] w-fit">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  ></span>
                </div>
                <span>Menyiapkan jawaban untuk Anda...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BEBAS PENGGUNA (TANPA PROMPT CHIPS) */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-700/50 focus-within:bg-white transition">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pertanyaan Anda secara bebas di sini..."
                className="flex-1 bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none py-1"
                disabled={isTyping}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="p-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white rounded-lg transition shrink-0"
                title="Kirim Pertanyaan"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              Tekan <kbd className="px-1 py-0.5 bg-slate-100 border rounded text-[9px] font-mono">Enter</kbd> untuk mengirim pertanyaan
            </p>
          </div>
        </div>
      )}
    </>
  );
}
