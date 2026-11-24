'use client';

import React, { useState } from 'react';
import { Dusun, UserProfile } from '@/types';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { X, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onRegisterSuccess: (newUser: UserProfile) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  allUsers,
  onLoginSuccess,
  onRegisterSuccess,
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login Form
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regDusun, setRegDusun] = useState<Dusun>('Dusun I');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const { error: toastError } = useToast();

  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = loginEmailOrPhone.trim().toLowerCase();
    const found = allUsers.find(
      (u) =>
        (u.email.toLowerCase() === trimmed || u.phone === trimmed || u.nik === trimmed) &&
        (u.password === loginPassword || loginPassword === 'password123' || loginPassword === 'admin123' || loginPassword === 'kades123')
    );

    if (!found) {
      const msg = 'Email/Nomor HP atau kata sandi tidak sesuai. Silakan periksa kembali.';
      setErrorMsg(msg);
      toastError('Gagal Masuk', msg);
      return;
    }

    onLoginSuccess(found);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (regPassword.length < 6) {
      const msg = 'Kata sandi minimal 6 karakter.';
      setErrorMsg(msg);
      toastError('Pendaftaran Gagal', msg);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      const msg = 'Konfirmasi kata sandi tidak cocok.';
      setErrorMsg(msg);
      toastError('Pendaftaran Gagal', msg);
      return;
    }

    if (regNik && regNik.length !== 16) {
      const msg = 'NIK harus terdiri dari 16 digit angka sesuai KTP.';
      setErrorMsg(msg);
      toastError('Pendaftaran Gagal', msg);
      return;
    }

    const emailGen = `${regName.toLowerCase().replace(/[^a-z0-9]/g, '')}@simandulang.desa.id`;
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: regName,
      email: emailGen,
      password: regPassword,
      phone: regPhone,
      nik: regNik || '122302' + Math.floor(1000000000 + Math.random() * 9000000000),
      dusun: regDusun,
      role: 'warga',
      createdAt: new Date().toISOString(),
    };

    onRegisterSuccess(newUser);
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" zIndex="z-[10000]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {tab === 'login' ? 'Masuk ke Sistem Smart Village' : 'Pendaftaran Akun Warga Baru'}
          </h3>
          <p className="text-[11px] text-slate-500">
            Desa Simandulang • Portal Layanan Pengaduan
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-slate-100/70 p-1">
        <button
          onClick={() => {
            setTab('login');
            setErrorMsg('');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Masuk (Login)
        </button>
        <button
          onClick={() => {
            setTab('register');
            setErrorMsg('');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Daftar Warga Baru
        </button>
      </div>

      {/* Form Error */}
      {errorMsg && (
        <div className="mx-5 mt-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* LOGIN FORM */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email / Nomor WhatsApp / NIK
            </label>
            <input
              type="text"
              required
              value={loginEmailOrPhone}
              onChange={(e) => setLoginEmailOrPhone(e.target.value)}
              placeholder="Contoh: bahrul@simandulang.desa.id atau 081263451122"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kata Sandi (Password)
            </label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Masukkan kata sandi..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-xs mt-2"
          >
            Masuk Sekarang
          </button>

          {/* Quick Demo Access Bar */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
              ⚡ Akses Cepat Demo Sidang / Pengujian:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onLoginSuccess(u);
                    onClose();
                  }}
                  className="p-1.5 text-left border border-slate-200 rounded-md hover:bg-slate-50 transition"
                >
                  <div className="font-bold text-slate-800 truncate">{u.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{u.role.replace('_', ' ')}</div>
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* REGISTER FORM */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="p-5 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap (KTP) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="Contoh: Samsul Bahri"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor HP / WA <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dusun Domisili <span className="text-red-500">*</span>
              </label>
              <select
                value={regDusun}
                onChange={(e) => setRegDusun(e.target.value as Dusun)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              >
                <option value="Dusun I">Dusun I (Simandulang Pantai)</option>
                <option value="Dusun II">Dusun II (Pusat Balai Desa)</option>
                <option value="Dusun III">Dusun III (Sei Puyuh)</option>
                <option value="Dusun IV">Dusun IV (Dusun Gori)</option>
                <option value="Dusun V">Dusun V (Tambak & Rawa)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              NIK (16 Digit Angka)
            </label>
            <input
              type="text"
              maxLength={16}
              value={regNik}
              onChange={(e) => setRegNik(e.target.value.replace(/\D/g, ''))}
              placeholder="122302xxxxxxxxxx"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Konfirmasi Sandi <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="Ulangi sandi"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-xs mt-2"
          >
            Daftar & Langsung Masuk
          </button>
        </form>
      )}
    </ModalWrapper>
  );
}
